import { NextRequest, NextResponse } from 'next/server'

import { checkDatabaseAuthorisation, checkMerchantProfile, getInventory } from '@/library/database/operations/operations'
import logger from '@/library/logger'
import { extractIdFromRequestCookie } from '@/library/utilities/server'

import { authenticationMessages, AuthenticationMessages, BasicMessages, basicMessages, ClientProduct, httpStatus } from '@/types'

export interface InventoryGETresponse {
  message: BasicMessages | AuthenticationMessages
  inventory?: ClientProduct[]
}

export async function GET(request: NextRequest): Promise<NextResponse<InventoryGETresponse>> {
  try {
    const { extractedUserId, status, message } = extractIdFromRequestCookie(request)

    if (!extractedUserId) {
      return NextResponse.json({ message }, { status })
    }

    const { userExists } = await checkDatabaseAuthorisation(extractedUserId)
    if (!userExists) {
      return NextResponse.json({ message: authenticationMessages.userNotFound }, { status: httpStatus.http401unauthorised })
    }

    const { merchantProfileExists } = await checkMerchantProfile(extractedUserId)
    if (!merchantProfileExists) {
      return NextResponse.json({ message: authenticationMessages.merchantMissing }, { status: httpStatus.http401unauthorised })
    }

    const inventory = await getInventory(extractedUserId)

    return NextResponse.json({ message: basicMessages.success, inventory }, { status: httpStatus.http200ok })
  } catch (error) {
    logger.errorUnknown(error)
    return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
  }
}
