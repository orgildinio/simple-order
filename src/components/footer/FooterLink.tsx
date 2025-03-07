'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function FooterLink({ href, name }: { href: string; name: string }) {
	const pathname = usePathname()

	if (pathname === href) {
		return <span className="text-sm/6 text-blue-600 font-medium">{name}</span>
	}

	return (
		<Link href={href} className="text-sm/6 link-primary">
			{name}
		</Link>
	)
}
