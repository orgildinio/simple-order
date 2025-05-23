import { http403forbidden, userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkAccess } from '@/library/database/operations'
import { products } from '@/library/database/schema'
import { initialiseDevelopmentLogger } from '@/library/utilities/public'
import { and, equals } from '@/library/utilities/server'
import type { BrowserSafeMerchantProduct, UserMessages } from '@/types'
import { type NextRequest, NextResponse } from 'next/server'
import type { InventoryItemParams } from './route'

export interface InventoryDELETEresponse {
	userMessage?: UserMessages
	developmentMessage?: string
	softDeletedProduct?: BrowserSafeMerchantProduct
}

// ToDo: this needs to be refactored but it works
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<InventoryItemParams> },
): Promise<NextResponse<InventoryDELETEresponse>> {
	const { developmentLogger } = initialiseDevelopmentLogger('/inventory/[itemId]', 'DELETE')

	try {
		const resolvedParams = await params
		const itemId = Number.parseInt(resolvedParams.itemId)

		if (!itemId) {
			const developmentMessage = developmentLogger('productToDeleteId missing')
			return NextResponse.json({ developmentMessage }, { status: 400 })
		}

		const { dangerousUser, accessDenied } = await checkAccess({
			request,
			requireConfirmed: false, // Allow people to play around immediately
			requireSubscriptionOrTrial: false,
		})

		if (accessDenied) {
			const developmentMessage = developmentLogger(accessDenied.message)
			return NextResponse.json({ developmentMessage }, { status: accessDenied.status })
		}

		const deletedAt = new Date()
		deletedAt.setUTCHours(0, 0, 0, 0)

		const [softDeletedProduct]: BrowserSafeMerchantProduct[] = await database
			.update(products)
			.set({ deletedAt })
			.where(and(equals(products.id, itemId), equals(products.ownerId, dangerousUser.id)))
			.returning({
				id: products.id,
				name: products.name,
				description: products.description,
				priceInMinorUnits: products.priceInMinorUnits,
				customVat: products.customVat,
				deletedAt: products.deletedAt,
			})

		if (!softDeletedProduct) {
			const developmentMessage = developmentLogger("product doesn't exist or isn't yours to delete")
			return NextResponse.json({ developmentMessage }, { status: http403forbidden })
		}

		const developmentMessage = developmentLogger(`Successfully soft deleted ${softDeletedProduct.name}`, { level: 'level3success' })
		return NextResponse.json({ softDeletedProduct, developmentMessage }, { status: 200 })
	} catch (error) {
		const developmentMessage = developmentLogger('Caught error', { error })
		return NextResponse.json({ userMessage: userMessages.serverError, developmentMessage }, { status: 500 })
	}
}
