'use client'
import PageContainer from '@/components/PageContainer'
import { apiPaths, dataTestIdNames, websiteCopy } from '@/library/constants'
import logger from '@/library/logger'
import { allowedCharacters, containsIllegalCharacters, emailRegex } from '@/library/utilities/public'
import { useUi } from '@/providers/ui'
import { useUser } from '@/providers/user'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FormEvent, useEffect, useState } from 'react'
import type { CreateAccountPOSTbody, CreateAccountPOSTresponse } from '../api/authentication/create-account/route'

// Important enhancement ToDo: input validation, strong password etc.

export default function CreateAccountPage() {
	const router = useRouter()
	const { setUser } = useUser()
	const { setMerchantMode } = useUi()
	const [showPassword, setShowPassword] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [illegalCharacterMessage, setIllegalCharacterMessage] = useState('')
	const [formReady, setFormReady] = useState(false)
	const [formData, setFormData] = useState<CreateAccountPOSTbody>({
		firstName: '',
		lastName: '',
		businessName: '',
		email: '',
		password: '',
	})

	useEffect(() => {
		const allFieldsFilled =
			formData.firstName !== '' &&
			formData.lastName !== '' &&
			formData.businessName !== '' &&
			formData.email !== '' &&
			emailRegex.test(formData.email.trim()) &&
			formData.password.length >= 10

		if (containsIllegalCharacters(formData.businessName)) {
			setIllegalCharacterMessage(`Please use only letters, numbers, spaces or ${allowedCharacters.punctuation}`)
			setFormReady(false)
		} else {
			setIllegalCharacterMessage('')
		}

		setFormReady(allFieldsFilled)
	}, [formData])

	async function handleSubmit(event: FormEvent) {
		event.preventDefault()
		setErrorMessage('')

		try {
			const requestBody: CreateAccountPOSTbody = {
				firstName: formData.firstName.trim(),
				lastName: formData.lastName.trim(),
				businessName: formData.businessName.trim(),
				email: formData.email.trim(),
				password: formData.password.trim(),
			}

			const response = await fetch(apiPaths.authentication.createAccount, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(requestBody),
			})

			const { userMessage, user }: CreateAccountPOSTresponse = await response.json()
			if (user) {
				// Must be merchant mode for new free-trials
				setMerchantMode(true)
				setUser(user)
				router.push('/dashboard')
			} else if (userMessage) {
				setErrorMessage(userMessage)
			}
			return
		} catch (error) {
			logger.error(error)
			setErrorMessage('Sorry something went wrong')
		}
	}

	return (
		<PageContainer>
			<div className="max-w-md mx-auto mt-8 md:p-6">
				<h1 className="text-pretty">Start your 30-day free trial</h1>
				<form onSubmit={handleSubmit} className="flex flex-col gap-y-6">
					<div>
						<label htmlFor="firstName" className="block mb-1">
							First name
						</label>
						<input
							data-test-id={dataTestIdNames.createAccountFirstNameInput}
							id="firstName"
							type="text"
							value={formData.firstName}
							autoComplete="given-name"
							onChange={(event) =>
								setFormData((previous) => ({
									...previous,
									firstName: event.target.value,
								}))
							}
							required
							className="w-full"
						/>
					</div>

					<div>
						<label htmlFor="lastName" className="block mb-1">
							Last name
						</label>
						<input
							data-test-id={dataTestIdNames.createAccountLastNameInput}
							id="lastName"
							type="text"
							value={formData.lastName}
							autoComplete="family-name"
							onChange={(event) =>
								setFormData((previous) => ({
									...previous,
									lastName: event.target.value,
								}))
							}
							required
							className="w-full"
						/>
					</div>

					<div>
						<div className="block mb-1">
							<label htmlFor="businessName">Business name</label>
						</div>
						<input
							data-test-id={dataTestIdNames.createAccountBusinessNameInput}
							id="businessName"
							type="text"
							value={formData.businessName}
							autoComplete="company name"
							onChange={(event) =>
								setFormData((previous) => ({
									...previous,
									businessName: event.target.value,
								}))
							}
							required
							className="w-full"
						/>
						{illegalCharacterMessage && <span className="text-red-600 block mt-2">{illegalCharacterMessage}</span>}
					</div>
					{/* Optimisation ToDo: add honeypot */}
					<div>
						<label htmlFor="email" className="block mb-1">
							Email
						</label>
						<input
							data-test-id={dataTestIdNames.createAccountEmailInput}
							id="email"
							type="email"
							value={formData.email}
							autoComplete="work email"
							onChange={(event) =>
								setFormData((previous) => ({
									...previous,
									email: event.target.value,
								}))
							}
							required
							className="w-full"
						/>
					</div>

					<div>
						<label htmlFor="password" className="block mb-1">
							Password
						</label>
						<div className="relative">
							<input
								data-test-id={dataTestIdNames.createAccountPasswordInput}
								id="password"
								type={showPassword ? 'text' : 'password'}
								value={formData.password}
								autoComplete="current-password"
								onChange={(event) =>
									setFormData((previous) => ({
										...previous,
										password: event.target.value,
									}))
								}
								required
								className="w-full"
							/>
							<button
								type="button"
								aria-label="Toggle password visibility"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 -translate-y-1/2 z-10 focus-visible:outline-orange-400 focus-visible:outline-2 focus-visible:outline focus-visible:rounded"
								tabIndex={0}
							>
								{showPassword ? <EyeIcon className="text-blue-600 size-6" /> : <EyeSlashIcon className="text-blue-600 size-6" />}
							</button>
							<div aria-live="polite" id="password-text" className="sr-only">
								{showPassword ? 'Password visible' : 'Password hidden'}
							</div>
						</div>
					</div>

					{errorMessage && <div className="mb-4 p-2 bg-red-50 text-red-600 rounded">{errorMessage}</div>}
					<button
						data-test-id={dataTestIdNames.createAccountSubmitButton}
						type="submit"
						disabled={!formReady}
						className="button-primary inline-block w-full mt-4 py-2"
					>
						{websiteCopy.CTAs.primary.displayText}
					</button>
				</form>
				<div className="flex justify-center gap-x-2 mt-6">
					<p>Already a member?</p>
					<Link href="/sign-in" className="link-secondary">
						Sign in instead
					</Link>
				</div>
			</div>
		</PageContainer>
	)
}
