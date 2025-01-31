import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { database } from '@/library/database/configuration'
import { confirmationTokens, users } from '@/library/database/schema'
import logger, { logUnknownErrorWithLabel } from '@/library/logger'

import { authenticationMessages, basicMessages, httpStatus } from '@/types'
import { ConfirmEmailPOSTbody, ConfirmEmailPOSTresponse } from '@/types/api/authentication/email/confirm'

export async function POST(request: NextRequest): Promise<NextResponse<ConfirmEmailPOSTresponse>> {
  const { token }: ConfirmEmailPOSTbody = await request.json()

  if (!token) {
    return NextResponse.json(
      { message: authenticationMessages.confirmationTokenMissing },
      { status: httpStatus.http401unauthorised },
    )
  }

  let transactionFailureMessage
  let transactionFailureStatus
  try {
    const result = await database.transaction(async tx => {
      const [confirmationToken] = await tx
        .select()
        .from(confirmationTokens)
        .where(eq(confirmationTokens.token, token))
        .limit(1)

      if (!confirmationToken) {
        transactionFailureMessage = authenticationMessages.tokenInvalid
        transactionFailureStatus = httpStatus.http401unauthorised
        throw new Error()
      }

      if (confirmationToken.usedAt) {
        const [user] = await tx.select().from(users).where(eq(users.id, confirmationToken.userId)).limit(1)

        if (user && user.emailConfirmed) {
          transactionFailureMessage = authenticationMessages.alreadyConfirmed
          transactionFailureStatus = httpStatus.http409conflict
        } else {
          transactionFailureMessage = authenticationMessages.tokenUsed
          transactionFailureStatus = httpStatus.http401unauthorised
        }
        return false
      }

      if (new Date() > new Date(confirmationToken.expiresAt)) {
        transactionFailureMessage = authenticationMessages.tokenExpired
        transactionFailureStatus = httpStatus.http401unauthorised
        throw new Error()
      }

      const [user] = await tx.select().from(users).where(eq(users.id, confirmationToken.userId)).limit(1)

      if (!user) {
        transactionFailureMessage = authenticationMessages.userNotFound
        transactionFailureStatus = httpStatus.http404notFound
        throw new Error()
      }

      await tx.update(users).set({ emailConfirmed: true }).where(eq(users.id, user.id))

      await tx
        .update(confirmationTokens)
        .set({ usedAt: new Date() })
        .where(eq(confirmationTokens.id, confirmationToken.id))
      return true
    })

    if (!result) {
      throw new Error()
    }

    return NextResponse.json({ message: basicMessages.success }, { status: httpStatus.http200ok })
  } catch (error) {
    if (transactionFailureStatus && transactionFailureMessage) {
      logger.error('Transaction failure: ', transactionFailureMessage)
      return NextResponse.json({ message: transactionFailureMessage }, { status: transactionFailureStatus })
    }

    logUnknownErrorWithLabel('Transaction failed: ', error)
    return NextResponse.json(
      { message: basicMessages.serverError },
      { status: httpStatus.http500serverError },
    )
  }
}
