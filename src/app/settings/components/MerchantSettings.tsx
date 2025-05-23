'use client'
import { useMerchantSettings } from '@/components/providers/settings'
import CutOffTime from '@/components/settings/CutOffTime'
import DeliveryDaysSetting from '@/components/settings/DeliveryDaysSetting'
import HolidaySettings from '@/components/settings/HolidaySettings'
import LeadTime from '@/components/settings/LeadTime'
import MinimumSpend from '@/components/settings/MinimumSpend'
import type { BrowserSafeCompositeUser } from '@/types'

export default function MerchantSettings({ merchant }: { merchant: BrowserSafeCompositeUser }) {
	const { saveMinimumSpendPence, acceptedWeekDayIndices, saveDeliveryDays, saveCutOffTime, saveLeadTime, holidays, addHoliday } =
		useMerchantSettings()
	const { leadTimeDays, cutOffTime, minimumSpendPence } = merchant

	return (
		<div className="w-full max-w-md border-2 border-slate-100 rounded-xl p-3 flex flex-col gap-y-6">
			<MinimumSpend minimumSpendPence={minimumSpendPence} saveMinimumSpendPence={saveMinimumSpendPence} />

			<LeadTime leadTimeDays={leadTimeDays} saveLeadTime={saveLeadTime} />

			<CutOffTime cutOffTime={cutOffTime} saveCutOffTime={saveCutOffTime} />

			<DeliveryDaysSetting acceptedWeekDayIndices={acceptedWeekDayIndices} saveDeliveryDays={saveDeliveryDays} />

			<HolidaySettings holidays={holidays} addHoliday={addHoliday} />
		</div>
	)
}
