'use client'
import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
import TwoColumnContainer from '@/components/TwoColumnContainer'
import RoleModeButton from '@/components/menubar/RoleModeButton'
import { useUi } from '@/providers/ui'
import { useUser } from '@/providers/user'
import VatToggleButton from '../inventory/components/VatToggleButton'
import OrdersMadePage from './ordersMadeSection'
import OrdersReceivedPage from './ordersReceivedSection'

export default function OrdersPage() {
	const { merchantMode } = useUi()
	const { user } = useUser()

	if (!user) return null

	const dynamicTitle = user.roles === 'both' ? (merchantMode ? 'Orders received' : 'Orders made') : 'Orders'

	return (
		<>
			<SignedInBreadCrumbs businessName={user.businessName} currentPageTitle={dynamicTitle} />
			<h1>{dynamicTitle}</h1>
			<TwoColumnContainer
				mainColumn={merchantMode ? <OrdersReceivedPage /> : <OrdersMadePage />}
				sideColumn={
					<>
						<VatToggleButton />
						<RoleModeButton />
					</>
				}
				sideColumnClasses="gap-y-4"
			/>
		</>
	)
}
