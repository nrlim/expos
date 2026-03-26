'use client'

import { useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import type { SessionPayload } from '@/lib/types'
import { StoreSwitcher } from './StoreSwitcher'
import { ThemeToggle } from '@/components/ThemeToggle'

interface Props {
  session: SessionPayload
  stores?: { id: string; name: string }[]
}

// ── Icons ──

const POSIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
    <path d="M16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
  </svg>
)

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
    <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
  </svg>
)

export default function TopBar({ session, stores = [] }: Props) {
  const [pending, startTransition] = useTransition()
  const pathname = usePathname()
  const router = useRouter()

  const isPOS = pathname === '/dashboard/pos'
  const isCashier = session.role === 'CASHIER'

  const handleLogout = () => {
    startTransition(async () => {
      await logout()
    })
  }

  const handlePOSToggle = () => {
    router.push(isPOS ? '/dashboard' : '/dashboard/pos')
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-6 shadow-sm">
      {/* Left — breadcrumb */}
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        <span className="text-foreground">{session.tenantName}</span>
        <span>/</span>
        <span>{session.username}</span>
        <span
          className={`ml-2 badge ${
            session.role === 'OWNER'
              ? 'badge-warning'
              : session.role === 'ADMIN'
              ? 'badge-brand'
              : 'badge-neutral'
          }`}
        >
          {session.role}
        </span>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-3">
        {/* Store Switcher — hidden on POS (handled inside POSClient) */}
        {!isPOS && <StoreSwitcher stores={stores} />}

        {/*
          POS / Dashboard toggle:
          - CASHIER: button is hidden entirely (they have no dashboard access)
          - ADMIN/OWNER on dashboard: show "Point of Sale" button
          - ADMIN/OWNER on POS: show "← Dashboard" button
        */}
        {!isCashier && (
          <button
            id="btn-pos-toggle"
            onClick={handlePOSToggle}
            className={`inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
              isPOS
                ? 'border border-border bg-background text-foreground hover:bg-muted'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
            }`}
          >
            {isPOS ? (
              <>
                <ArrowLeftIcon />
                Dashboard
              </>
            ) : (
              <>
                <POSIcon />
                Point of Sale
              </>
            )}
          </button>
        )}

        <ThemeToggle />
        <button
          id="btn-logout"
          onClick={handleLogout}
          disabled={pending}
          className="btn-ghost text-xs disabled:opacity-60"
        >
          {pending ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </header>
  )
}
