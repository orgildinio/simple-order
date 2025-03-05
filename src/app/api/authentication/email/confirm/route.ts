import { apiPaths, authenticationMessages, basicMessages, cookieDurations, httpStatus, tokenMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkActiveSubscriptionOrTrial, getUserRoles } from '@/library/database/operations'
import { confirmationTokens, users } from '@/library/database/schema'
import logger from '@/library/logger'
import { sanitiseDangerousBaseUser } from '@/library/utilities'
import { createCookieWithToken } from '@/library/utilities/server'
import type { BrowserSafeCompositeUser, ConfirmationToken, DangerousBaseUser } from '@/types'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

export interface AuthenticationEmailConfirmPOSTresponse {
	message:
		| typeof basicMessages.success
		| typeof basicMessages.serverError
		| typeof tokenMessages.tokenMissing
		| typeof tokenMessages.tokenInvalid
		| typeof tokenMessages.tokenExpired
		| typeof tokenMessages.userNotFound
		| typeof authenticationMessages.alreadyConfirmed
		| 'transaction error updating user'
		| 'transaction error expiring token'
	confirmedUser?: BrowserSafeCompositeUser
}

export interface AuthenticationEmailConfirmPOSTbody {
	token: string
}

export async function POST(request: NextRequest): Promise<NextResponse<AuthenticationEmailConfirmPOSTresponse>> {
	const routeDetail = `POST ${apiPaths.authentication.email.confirm}: `
	let transactionFailureMessage = undefined
	let transactionFailureStatus = undefined
	try {
		const { token }: AuthenticationEmailConfirmPOSTbody = await request.json()

		if (!token) {
			logger.warn(routeDetail, 'Email confirmation token not found')
			return NextResponse.json({ message: tokenMessages.tokenMissing }, { status: httpStatus.http401unauthorised })
		}

		const [foundToken]: ConfirmationToken[] = await database.select().from(confirmationTokens).where(eq(confirmationTokens.token, token))

		if (!foundToken) {
			return NextResponse.json({ message: tokenMessages.tokenInvalid }, { status: httpStatus.http401unauthorised })
		}

		const [foundDangerousUser]: DangerousBaseUser[] = await database.select().from(users).where(eq(users.id, foundToken.userId))

		if (!foundDangerousUser) {
			return NextResponse.json({ message: tokenMessages.userNotFound }, { status: httpStatus.http404notFound })
		}

		if (foundDangerousUser.emailConfirmed) {
			logger.info(routeDetail, 'Email already confirmed.', foundDangerousUser)
			return NextResponse.json({ message: authenticationMessages.alreadyConfirmed }, { status: httpStatus.http202accepted })
		}

		if (new Date() > new Date(foundToken.expiresAt)) {
			return NextResponse.json({ message: tokenMessages.tokenExpired }, { status: httpStatus.http401unauthorised })
		}

		await database.transaction(async (tx) => {
			transactionFailureMessage = 'transaction error updating user'
			transactionFailureStatus = httpStatus.http500serverError
			await tx.update(users).set({ emailConfirmed: true }).where(eq(users.id, foundDangerousUser.id))

			transactionFailureMessage = 'transaction error expiring token'
			await tx.update(confirmationTokens).set({ usedAt: new Date() }).where(eq(confirmationTokens.id, foundToken.id))

			transactionFailureMessage = undefined
			transactionFailureStatus = undefined
		})

		const { userRole } = await getUserRoles(foundDangerousUser.id)
		const { activeSubscriptionOrTrial } = await checkActiveSubscriptionOrTrial(foundDangerousUser.id)

		const confirmedUser: BrowserSafeCompositeUser = {
			...sanitiseDangerousBaseUser(foundDangerousUser),
			roles: userRole,
			activeSubscriptionOrTrial,
		}

		const cookieStore = await cookies()
		cookieStore.set(createCookieWithToken(foundDangerousUser.id, cookieDurations.oneYear))

		return NextResponse.json({ message: basicMessages.success, confirmedUser }, { status: httpStatus.http200ok })
	} catch (error) {
		if (transactionFailureStatus && transactionFailureMessage) {
			logger.error(routeDetail, 'Transaction failure: ', transactionFailureMessage)
			return NextResponse.json(
				{ message: transactionFailureMessage || 'unknown transaction error' },
				{ status: transactionFailureStatus | httpStatus.http500serverError },
			)
		}

		logger.error(routeDetail, 'Uncaught error: ', error)
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}
