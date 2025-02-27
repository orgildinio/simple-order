import PageContainer from '@/components/PageContainer'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
	title: 'Dashboard',
}

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<PageContainer>
			<h1>Dashboard</h1>
			{children}
		</PageContainer>
	)
}
