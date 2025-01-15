import type { Metadata, Viewport } from 'next'

import { productionBaseURL } from '@/library/environment/publicVariables'

import MenuBar from '@/components/menubar'
import Providers from '@/components/Providers'

import './styles.tailwind.css'

export const metadata: Metadata = {
  title: `Simple Order`,
  description: ``,
  alternates: {
    canonical: productionBaseURL,
  },
}

export const viewport: Viewport = {
  initialScale: 1,
  width: 'device-width',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <body>
        <Providers>
          <MenuBar />
          <div className="max-w-2xl w-full mx-auto my-4">{children}</div>
        </Providers>
      </body>
    </html>
  )
}
