'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { SessionPayload } from '@/lib/types'

interface Props {
  session: SessionPayload
}

const BOTTOM_NAV_ITEMS = [
  {
    label: 'Home',
    href: '/dashboard',
    exact: true,
    icon: (active: boolean) => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
      </svg>
    ),
  },
  {
    label: 'Products',
    href: '/dashboard/products',
    exact: false,
    icon: (active: boolean) => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: 'POS',
    href: '/dashboard/pos',
    exact: false,
    highlight: true,
    icon: (active: boolean) => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
        <path d="M16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
      </svg>
    ),
  },
  {
    label: 'Inventory',
    href: '/dashboard/inventory',
    exact: false,
    icon: (active: boolean) => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
        <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
        <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: 'Reports',
    href: '/dashboard/reports',
    exact: false,
    icon: (active: boolean) => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
      </svg>
    ),
  },
]

export default function BottomNav({ session }: Props) {
  const pathname = usePathname()

  // CASHIER only gets POS and potentially Transactions
  const cashierItems = BOTTOM_NAV_ITEMS.filter((i) => i.href === '/dashboard/pos')
  const adminItems = BOTTOM_NAV_ITEMS

  const items = session.role === 'CASHIER' ? cashierItems : adminItems

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 flex h-16 border-t border-border bg-card/95 backdrop-blur-md lg:hidden"
      aria-label="Bottom navigation"
    >
      <div className="flex w-full items-stretch">
        {items.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`bottom-nav-${item.label.toLowerCase()}`}
                className="relative flex flex-1 flex-col items-center justify-center gap-0.5"
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                      : 'bg-primary/15 text-primary'
                  }`}
                >
                  {item.icon(isActive)}
                </span>
                <span
                  className={`text-[10px] font-bold tracking-wide ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              id={`bottom-nav-${item.label.toLowerCase()}`}
              className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.icon(isActive)}
              <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
              {isActive && (
                <span className="absolute top-0 h-0.5 w-8 rounded-b-full bg-primary" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
