import { database } from '@/library/database/connection'
import { users } from '@/library/database/schema'
import { equals } from '@/library/utilities/server'
import type { DangerousBaseUser, TestUserInputValues } from '@/types'
import { apiTestRequest, createTestUser, deleteUser } from '@tests/utilities'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

const userInputValues: TestUserInputValues = {
	firstName: 'Cinderella',
	lastName: 'Charming',
	businessName: 'Glass Slipper Cleaners',
	email: 'cinderella@castle.com',
	password: 'M1dnight!Pumpkin',
}

describe('Create user', () => {
	describe('Creates a user with the right shape', () => {
		let user: DangerousBaseUser | undefined
		let cookie: string | undefined

		beforeAll(async () => {
			const { createdUser, validCookie } = await createTestUser(userInputValues)
			user = createdUser
			cookie = validCookie
		})

		afterAll(async () => {
			await deleteUser(userInputValues.email)
		})

		test('Creates a user', async () => {
			if (!user) throw new Error('User not defined')
			const [foundUser] = await database.select().from(users).where(equals(users.id, user.id)).limit(1)
			expect(foundUser).toBeDefined()
		})

		test('Cookie exists', () => {
			expect(cookie).toBeDefined()
		})

		test('Cookie can be used to make a request to /authentication/verify-token', async () => {
			const response = await apiTestRequest({
				basePath: 'authentication/verify-token',
				requestCookie: cookie,
			})
			expect(response.status).toBe(200)
		})
	})
})

/* 
pnpm vitest tests/utilities/definitions/createTestUser
*/
