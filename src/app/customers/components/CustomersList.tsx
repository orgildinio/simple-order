'use client'
import Spinner from '@/components/Spinner'
import { useUser } from '@/providers/user'
import { useState } from 'react'
import ConfirmedCustomerCard from './ConfirmedCustomerCard'
import InvitedCustomerCard from './InvitedCustomerCard'

export default function CustomersList() {
	const { confirmedCustomers, invitedCustomers } = useUser()
	const [isLoading] = useState(false)
	const [message] = useState('')

	if (isLoading) return <Spinner />

	return (
		<div className="flex flex-col gap-y-4">
			{confirmedCustomers && (
				<h2 className="mt-12">
					{confirmedCustomers.length} Confirmed customer{confirmedCustomers.length !== 1 && 's'}
				</h2>
			)}
			{confirmedCustomers?.map((customer, index) => (
				<ConfirmedCustomerCard key={customer.businessName} confirmedCustomer={customer} zebraStripe={Boolean(index % 2)} />
			))}
			{invitedCustomers && (
				<h2 className="mt-12">
					{invitedCustomers.length} Invited customer{invitedCustomers.length !== 1 && 's'}
				</h2>
			)}
			{invitedCustomers?.map((customer, index) => (
				<InvitedCustomerCard key={customer.obfuscatedEmail} invitedCustomer={customer} zebraStripe={Boolean(index % 2)} />
			))}

			{message && <div>{message}</div>}
		</div>
	)
}
