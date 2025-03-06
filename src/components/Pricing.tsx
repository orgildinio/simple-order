import { CheckIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'

const includedFeatures = ['Private forum access', 'Member resources', 'Entry to annual conference', 'Official member t-shirt']

export default function Pricing() {
	return (
		<div className="mx-auto max-w-7xl px-6 lg:px-8">
			<div className="mx-auto max-w-4xl sm:text-center">
				<h2 className="text-pretty text-5xl font-semibold tracking-tight text-gray-900 sm:text-balance sm:text-6xl">Simple pricing</h2>
				<p className="mx-auto mt-6 max-w-2xl text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
					One simple plan at £19.50 per month. Start your 30-day free trial today - no credit card required.
				</p>
			</div>
			<div className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
				<div className="p-8 sm:p-10 lg:flex-auto">
					<h3 className="text-3xl font-semibold tracking-tight text-gray-900">Lifetime membership</h3>
					<p className="mt-6 text-base/7 text-gray-600">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
					</p>
					<div className="mt-10 flex items-center gap-x-4">
						<h4 className="flex-none text-sm/6 font-semibold text-blue-600">{`What's included`}</h4>
						<div className="h-px flex-auto bg-gray-100" />
					</div>
					<ul className="mt-8 grid grid-cols-1 gap-4 text-sm/6 text-gray-600 sm:grid-cols-2 sm:gap-6">
						{includedFeatures.map((feature) => (
							<li key={feature} className="flex gap-x-3">
								<CheckIcon aria-hidden="true" className="h-6 w-5 flex-none text-blue-600" />
								{feature}
							</li>
						))}
					</ul>
				</div>
				<div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:shrink-0">
					<div className="rounded-2xl bg-gray-50 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
						<div className="mx-auto max-w-xs px-8">
							<p className="text-base font-semibold text-gray-600">Pay once, own it forever</p>
							<p className="mt-6 flex items-baseline justify-center gap-x-2">
								<span className="text-5xl font-semibold tracking-tight text-gray-900">$349</span>
								<span className="text-sm/6 font-semibold tracking-wide text-gray-600">USD</span>
							</p>
							<Link
								href="/free-trial"
								className="mt-10 block w-full rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
							>
								Get access
							</Link>
							<p className="mt-6 text-xs/5 text-gray-600">Invoices and receipts available for easy company reimbursement</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
