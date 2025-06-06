import { database } from '@/library/database/connection'
import { products } from '@/library/database/schema'
import logger from '@/library/logger'
import type { Product, ProductInsertValues } from '@/types'

/**
 * @param items An array of ProductInsertValues
 * @example
const addedProducts = await addProducts(
	[{	
		ownerId: 1,
		name: 'Soup',
		priceInMinorUnits: 500,
	}])
 */
export async function addProducts(items: ProductInsertValues[]): Promise<Product[]> {
	try {
		return await database.insert(products).values(items).returning()
	} catch (error) {
		logger.error('addProducts caught error', error)
		throw error
	}
}
