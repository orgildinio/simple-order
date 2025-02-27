import {
	authenticationMessages,
	basicMessages,
	cookieDurations,
	durationOptions,
	httpStatus,
	illegalCharactersMessages,
	missingFieldMessages,
} from '@/library/constants'
import { database } from '@/library/database/connection'
import { confirmationTokens, freeTrials, merchantProfiles, users } from '@/library/database/schema'
import { sendEmail } from '@/library/email/sendEmail'
import { createNewMerchantEmail } from '@/library/email/templates/newMerchant'
import { emailRegex } from '@/library/email/utilities'
import { dynamicBaseURL } from '@/library/environment/publicVariables'
import logger from '@/library/logger'
import { containsIllegalCharacters, createFreeTrialEndTime, createMerchantSlug } from '@/library/utilities'
import { sanitiseDangerousBaseUser } from '@/library/utilities'
import { createCookieWithToken, createSessionCookieWithToken } from '@/library/utilities/server'
import type {
	BaseUserInsertValues,
	BrowserSafeCompositeUser,
	DangerousBaseUser,
	FreeTrial,
	IllegalCharactersMessages,
	MissingFieldMessages,
	NewFreeTrial,
} from '@/types'
import bcrypt from 'bcryptjs'
import { eq, or } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'
import { v4 as generateConfirmationToken } from 'uuid'

export interface CreateAccountPOSTbody extends Omit<BaseUserInsertValues, 'hashedPassword' | 'emailConfirmed' | 'cachedTrialExpired'> {
	password: string
	staySignedIn: boolean
}

export interface CreateAccountPOSTresponse {
	message:
		| typeof missingFieldMessages.lastNameMissing
		| typeof missingFieldMessages.firstNameMissing
		| typeof missingFieldMessages.emailMissing
		| typeof missingFieldMessages.businessNameMissing
		| typeof missingFieldMessages.passwordMissing
		| typeof authenticationMessages.invalidEmailFormat
		| typeof authenticationMessages.emailTaken
		| typeof authenticationMessages.businessNameTaken
		| IllegalCharactersMessages
		| typeof basicMessages.success
		| typeof basicMessages.serverError
	user?: BrowserSafeCompositeUser
}

export async function POST(request: NextRequest): Promise<NextResponse<CreateAccountPOSTresponse>> {
	const { firstName, lastName, email, password, businessName, staySignedIn }: CreateAccountPOSTbody = await request.json()

	let missingFieldMessage: MissingFieldMessages | null = null
	if (!firstName) missingFieldMessage = missingFieldMessages.firstNameMissing
	if (!lastName) missingFieldMessage = missingFieldMessages.lastNameMissing
	if (!email) missingFieldMessage = missingFieldMessages.emailMissing
	if (!password) missingFieldMessage = missingFieldMessages.passwordMissing
	if (!businessName) missingFieldMessage = missingFieldMessages.businessNameMissing

	if (missingFieldMessage) {
		return NextResponse.json({ message: missingFieldMessage }, { status: httpStatus.http400badRequest })
	}

	let illegalCharactersMessage: IllegalCharactersMessages | null = null
	if (containsIllegalCharacters(firstName)) illegalCharactersMessage = illegalCharactersMessages.firstName
	if (containsIllegalCharacters(lastName)) illegalCharactersMessage = illegalCharactersMessages.lastName
	if (containsIllegalCharacters(password)) illegalCharactersMessage = illegalCharactersMessages.password
	if (containsIllegalCharacters(businessName)) illegalCharactersMessage = illegalCharactersMessages.businessName

	if (illegalCharactersMessage) {
		return NextResponse.json({ message: illegalCharactersMessage }, { status: httpStatus.http400badRequest })
	}

	const normalisedEmail = email.toLowerCase().trim()
	if (!emailRegex.test(normalisedEmail)) {
		return NextResponse.json({ message: authenticationMessages.invalidEmailFormat }, { status: httpStatus.http400badRequest })
	}

	try {
		const [existingUser] = await database
			.select()
			.from(users)
			.where(or(eq(users.email, normalisedEmail), eq(users.businessName, businessName)))
			.limit(1)

		if (existingUser) {
			if (existingUser.email === normalisedEmail) {
				logger.debug('Existing user email: ', existingUser.email)
				logger.debug('normalisedEmail: ', normalisedEmail)
				return NextResponse.json({ message: authenticationMessages.emailTaken }, { status: httpStatus.http409conflict })
			}

			if (existingUser.businessName === businessName) {
				return NextResponse.json({ message: authenticationMessages.businessNameTaken }, { status: httpStatus.http409conflict })
			}
		}

		const saltRounds = 10
		const hashedPassword = await bcrypt.hash(password, saltRounds)

		// ToDo: Use proper codes
		let transactionErrorMessage: string | null = basicMessages.serverError
		let transactionErrorStatusCode: number | null = httpStatus.http503serviceUnavailable

		const { newUser, newMerchant, newFreeTrial } = await database.transaction(async (tx) => {
			const newUserInsertValues: BaseUserInsertValues = {
				firstName: firstName.trim(),
				lastName: lastName.trim(),
				email: normalisedEmail,
				hashedPassword: hashedPassword.trim(),
				businessName: businessName.trim(),
				emailConfirmed: false,
				cachedTrialExpired: false,
			}

			const [newUser]: DangerousBaseUser[] = await tx.insert(users).values(newUserInsertValues).returning()

			logger.debug('New user: ', JSON.stringify(newUser))

			const baseSlug = createMerchantSlug(businessName)
			let slug = baseSlug

			for (let attempt = 0; attempt < 5; attempt++) {
				const existingSlug = await tx.select().from(merchantProfiles).where(eq(merchantProfiles.slug, slug)).limit(1)

				if (existingSlug.length === 0) break
				slug = `${baseSlug}-${attempt + 1}`
			}

			const [newMerchant] = await tx
				.insert(merchantProfiles)
				.values({
					slug,
					userId: newUser.id,
				})
				.returning()

			logger.debug('New merchant profile: ', JSON.stringify(newMerchant))

			// The free trial is linked to the merchantId, not the userId! This is because not all users are merchants
			const freeTrialInsert: NewFreeTrial = {
				startDate: new Date(),
				endDate: createFreeTrialEndTime(),
				userId: newUser.id,
			}

			const [newFreeTrial]: FreeTrial[] = await tx.insert(freeTrials).values(freeTrialInsert).returning()

			logger.debug('New free trial: ', JSON.stringify(newFreeTrial))

			const emailConfirmationToken = generateConfirmationToken()

			await tx.insert(confirmationTokens).values({
				userId: newUser.id,
				token: emailConfirmationToken,
				expiresAt: new Date(Date.now() + durationOptions.twentyFourHoursInMilliseconds),
			})

			const confirmationURL = `${dynamicBaseURL}/confirm?token=${emailConfirmationToken}`
			logger.info('Confirmation URL: ', confirmationURL)

			// ToDo: style actual email
			transactionErrorMessage = basicMessages.errorSendingEmail
			const emailSentSuccessfully = await sendEmail({
				recipientEmail: email,
				...createNewMerchantEmail({
					recipientName: firstName,
					confirmationURL,
				}),
			})

			if (!emailSentSuccessfully) tx.rollback()

			transactionErrorMessage = null
			transactionErrorStatusCode = null

			return { newUser, newMerchant, newFreeTrial }
		})

		if (!newUser || !newMerchant || !newFreeTrial || transactionErrorMessage || transactionErrorStatusCode) {
			// ToDo: Use proper codes
			return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http503serviceUnavailable })
		}

		const sanitisedBaseUser = sanitiseDangerousBaseUser(newUser)

		const compositeUser: BrowserSafeCompositeUser = {
			...sanitisedBaseUser,
			roles: 'merchant',
			accountActive: true,
		}

		const cookieStore = await cookies()

		if (staySignedIn) {
			cookieStore.set(createCookieWithToken(newUser.id, cookieDurations.oneYear))
		} else {
			cookieStore.set(createSessionCookieWithToken(newUser.id))
		}

		return NextResponse.json({ message: basicMessages.success, compositeUser }, { status: httpStatus.http200ok })
	} catch (error) {
		logger.error('Error creating user: ', error)
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}
