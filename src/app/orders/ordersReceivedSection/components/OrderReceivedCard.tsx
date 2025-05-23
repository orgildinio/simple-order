import ZebraContainer from '@/components/ZebraContainer'
import { orderStatusNames } from '@/library/constants'
import { calculateOrderTotal, formatDate, formatPrice } from '@/library/utilities/public'
import type { OrderReceived, OrderStatusName } from '@/types'
import OrderStatusDropdown from './OrderStatusDropdown'

interface Props {
	orderDetails: OrderReceived
	onStatusChangeRequest: (orderId: number, currentStatus: OrderStatusName, newStatus: OrderStatusName) => void
	includeVat: boolean
	index: number // Calculate the zebra stripe
}

export default function OrderReceivedCard({ orderDetails, includeVat, index, onStatusChangeRequest }: Props) {
	const { totalWithVAT, totalWithoutVAT } = calculateOrderTotal(orderDetails.products)

	const formattedTotal = formatPrice(includeVat ? totalWithVAT : totalWithoutVAT)

	const { products, businessName, requestedDeliveryDate, statusName, id, adminOnlyNote, customerNote } = orderDetails

	return (
		<li>
			<ZebraContainer
				index={index}
				oddStyles="bg-blue-50 border-blue-100"
				evenStyles="bg-zinc-50 border-zinc-100"
				baseStyles="flex flex-col gap-y-6 w-full p-4 border-2 rounded-xl"
			>
				{/* Order heading */}
				<div className="flex justify-between">
					<h3>{businessName}</h3>
					<div className="flex gap-x-3">
						<time dateTime={requestedDeliveryDate.toString()}>{formatDate(requestedDeliveryDate)}</time>
						<OrderStatusDropdown
							statusOptions={[orderStatusNames.Pending, orderStatusNames.Completed]}
							currentStatus={statusName}
							onStatusChange={(newStatus) => onStatusChangeRequest(id, statusName, newStatus)}
						/>
					</div>
				</div>
				{/* Merchant note */}
				<div>
					<h4 className="font-medium">Private note</h4>
					<p>{adminOnlyNote}</p>
				</div>

				{/* Customer note */}
				<div>
					<h4 className="font-medium">Customer note</h4>
					<p>{customerNote}</p>
				</div>

				{/* Order items */}
				<ul className="flex flex-col gap-y-6 divide-y-2 divide-zinc-200">
					{products.map((item) => (
						<li key={item.id} className="flex flex-col pt-6 first:pt-4">
							{/* Item heading */}
							<div className="flex justify-between mb-3">
								<span className="text-xl">{item.name}</span>
								<div>
									<span className="text-zinc-600">x </span>
									<span className="text-xl">{item.quantity}</span>
								</div>
							</div>

							{/* Item body */}
							<div className="flex justify-between text-zinc-700">
								<span>{formatPrice(item.priceInMinorUnitsWithoutVat)} each</span>
								<span>Subtotal {formatPrice(item.priceInMinorUnitsWithoutVat * item.quantity)}</span>
							</div>
						</li>
					))}
				</ul>
				{/* Order total */}
				<div className="w-full flex gap-x-3 items-end justify-end text-xl">
					<span className="text-zinc-600">Total</span>
					<span className="font-medium">{formattedTotal}</span>
				</div>
			</ZebraContainer>
		</li>
	)
}
