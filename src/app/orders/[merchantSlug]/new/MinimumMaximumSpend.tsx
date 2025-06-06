import { serviceConstraints } from '@/library/constants'
import { formatPrice, mergeClasses } from '@/library/utilities/public'
import type { BrowserSafeMerchantProfile } from '@/types'
import type { UiContextData } from '@/types/definitions/contexts/ui'
import { CheckCircleIcon } from '@heroicons/react/24/outline'

type Props = {
	merchantDetails: BrowserSafeMerchantProfile
	minimumSpendReached: boolean
	maximumOrderValueExceeded: boolean
	totalWithoutVAT: number
	percentageTowardsMinimumSpend: number
	currency: UiContextData['currency']
}

export default function MinimumMaximumSpend(props: Props) {
	const { merchantDetails, minimumSpendReached, maximumOrderValueExceeded, totalWithoutVAT, percentageTowardsMinimumSpend, currency } =
		props

	if (maximumOrderValueExceeded) {
		return (
			<p className="text-red-600">This order is over our {formatPrice(serviceConstraints.maximumOrderValueInMinorUnits, currency)} limit</p>
		)
	}

	return (
		<div className="flex flex-col gap-y-2">
			<div className="flex justify-between w-full items-center">
				<span className="font-medium block">
					Minimum spend
					{minimumSpendReached && (
						<span>
							{' '}
							reached
							<CheckCircleIcon className="inline-block ml-2 size-7 text-green-600" />
						</span>
					)}
				</span>
				{!minimumSpendReached && <span className="block">{formatPrice(merchantDetails.minimumSpendPence, currency)} without VAT</span>}
			</div>
			<div className="overflow-hidden rounded-full bg-gray-200">
				<div
					style={{
						width: `${percentageTowardsMinimumSpend}%`, //
					}}
					className={mergeClasses(
						'h-2 rounded-full transition-all duration-500 ease-in-out',
						minimumSpendReached ? 'bg-green-600' : 'bg-blue-600',
					)}
				/>
			</div>
			{!minimumSpendReached && (
				<span className="text-zinc-600">{formatPrice(merchantDetails.minimumSpendPence - totalWithoutVAT, currency)} to go</span>
			)}
		</div>
	)
}
