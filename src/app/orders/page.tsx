'use client'
import { useUser } from '@/components/providers/user'
import { apiRequest } from '@/library/utilities/public'
import type { OrderStatusId } from '@/types'
import type { OrderAdminOrderIdPATCHbody, OrderAdminOrderIdPATCHresponse } from '../api/orders/admin/[orderId]/route'
import OrdersPageContent, { type UpdateOrderStatusFunction } from './components/OrdersPageContent'

export default function OrdersPage() {
	const { user, confirmedMerchants, ordersReceived, ordersMade, setOrdersReceived } = useUser()

	const updateOrderStatus: UpdateOrderStatusFunction = async function updateOrderStatus(orderId: number, newOrderStatusId: OrderStatusId) {
		const { ok, updatedOrder, userMessage, developmentMessage } = await apiRequest<
			OrderAdminOrderIdPATCHresponse,
			OrderAdminOrderIdPATCHbody
		>({
			basePath: '/orders/admin',
			segment: orderId,
			method: 'PATCH',
			body: { statusId: newOrderStatusId, id: orderId },
		})

		if (ok) return { ok, updatedOrder }

		return { ok, userMessage, developmentMessage }
	}

	return (
		<OrdersPageContent
			user={user}
			isDemo={false}
			confirmedMerchants={confirmedMerchants}
			ordersReceived={ordersReceived}
			ordersMade={ordersMade}
			setOrdersReceived={setOrdersReceived}
			onUpdateStatus={updateOrderStatus}
		/>
	)
}
