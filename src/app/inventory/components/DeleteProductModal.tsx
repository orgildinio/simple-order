'use client'
import Spinner from '@/components/Spinner'
import { dataTestIdNames } from '@/library/constants'
import type { BrowserSafeMerchantProduct } from '@/types'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function DeleteProductModal({
	isOpen,
	onClose,
	onConfirm,
	product,
	isDeleting,
}: {
	isOpen: boolean
	onClose: () => void
	onConfirm: (productId: number) => Promise<boolean>
	product: BrowserSafeMerchantProduct
	isDeleting: boolean
}) {
	async function handleConfirm() {
		await onConfirm(product.id)
		onClose()
	}

	return (
		<Dialog data-test-id={dataTestIdNames.inventory.deleteProductModal} open={isOpen} onClose={onClose} className="relative z-modal">
			<DialogBackdrop
				transition
				className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
			/>

			<div className="fixed inset-0 z-modal w-screen overflow-y-auto">
				<div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
					<DialogPanel
						transition
						className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
					>
						<div className="sm:flex sm:items-start">
							<div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
								<ExclamationTriangleIcon aria-hidden="true" className="size-6 text-red-600" />
							</div>
							<div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
								<DialogTitle as="h3" className="text-base font-semibold text-gray-900">
									Delete product
								</DialogTitle>
								<div className="mt-2">
									<p className="text-gray-500">{`Are you sure you want to delete ${product.name}?`}</p>
								</div>
							</div>
						</div>
						<div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
							<button
								type="button"
								onClick={handleConfirm}
								disabled={isDeleting}
								className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
							>
								<div className="min-h-7 min-w-[14ch] flex justify-center">
									{isDeleting ? <Spinner colour="text-white" /> : 'Delete product'}
								</div>
							</button>
							<button
								type="button"
								data-autofocus
								onClick={onClose}
								className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
							>
								Cancel
							</button>
						</div>
					</DialogPanel>
				</div>
			</div>
		</Dialog>
	)
}
