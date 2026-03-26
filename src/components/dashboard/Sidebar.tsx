'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { SessionPayload } from '@/lib/types'

interface Props {
  session: SessionPayload
}

type NavItem = {
  label: string
  href: string
  icon: React.ReactNode
  ownerOnly?: boolean
  subItems?: { label: string; href: string; ownerOnly?: boolean }[]
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
      </svg>
    ),
  },
  {
    label: 'Products',
    href: '/dashboard/products',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: 'Categories',
    href: '/dashboard/categories',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
      </svg>
    ),
  },
  {
    label: 'Brands',
    href: '/dashboard/brands',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: 'Transactions',
    href: '/dashboard/transactions',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
      </svg>
    ),
  },

  {
    label: 'Units',
    href: '/dashboard/units',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: 'Attributes',
    href: '/dashboard/attributes',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
         <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm14 1a1 1 0 11-2 0 1 1 0 012 0zM2 13a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2zm14 1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: 'Warranties',
    href: '/dashboard/warranties',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    ),
    subItems: [
      { label: 'General Info', href: '/dashboard/settings' },
      { label: 'Locations & Stores', href: '/dashboard/settings/stores', ownerOnly: true },
      { label: 'Team & Roles', href: '/dashboard/settings/users', ownerOnly: true },
    ]
  },
]

export default function Sidebar({ session }: Props) {
  const pathname = usePathname()

  // CASHIER role has no admin sidebar — they only access the POS view
  if (session.role === 'CASHIER') return null

  return (
    <aside className="flex w-60 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border px-4 bg-muted/10">
        <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary">
          <span className="text-xs font-black text-primary-foreground">eP</span>
        </div>
        <span className="font-bold text-foreground tracking-tight">ex-POS</span>
      </div>

      {/* Tenant info */}
      <div className="border-b border-border px-4 py-3 text-center">
        <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Store</p>
        <p className="mt-0.5 text-sm font-bold text-foreground truncate">{session.tenantName}</p>
        <p className="text-[10px] font-mono text-muted-foreground truncate focus:outline-hidden">/{session.tenantSlug}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        <p className="mb-2 px-3 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
          Navigation
        </p>
        {NAV_ITEMS.map((item) => {
          if (item.ownerOnly && session.role === 'CASHIER') return null
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
          return (
            <div key={item.href} className="flex flex-col">
              <Link
                href={item.href}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                {item.label}
              </Link>
              
              {item.subItems && isActive && (
                <div className="ml-[1.25rem] mt-0.5 border-l border-border/80 flex flex-col gap-0.5">
                  {item.subItems.map((sub) => {
                    if (sub.ownerOnly && session.role === 'CASHIER') return null
                    
                    // For sub items, if the href is exactly the same as the parent (General Info), 
                    // we check if the pathname is strictly that href. Otherwise startsWith.
                    const isSubActive = sub.href === item.href 
                      ? pathname === sub.href 
                      : pathname.startsWith(sub.href)

                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={`pl-4 py-1.5 text-[11px] font-semibold tracking-wide rounded-r-md transition-all ${
                          isSubActive 
                            ? 'text-primary bg-primary/10 border-l border-primary -ml-[1px]' 
                            : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                        }`}
                      >
                        {sub.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* User info bottom */}
      <div className="border-t border-border px-4 py-3 bg-muted/10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-primary/20 text-primary text-xs font-bold uppercase">
            {session.username.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-foreground truncate">{session.username}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{session.role}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
