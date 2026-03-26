import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '403 Forbidden' }

export default function ForbiddenPage() {
  return (
    <div className="min-h-dvh bg-grid flex items-center justify-center p-4">
      <div className="text-center animate-fade-in">
        <p className="text-7xl font-black text-slate-800">403</p>
        <h1 className="mt-2 text-xl font-bold text-slate-200">Access Denied</h1>
        <p className="mt-2 text-sm text-slate-500">
          You do not have permission to view this page.
        </p>
        <Link href="/dashboard" className="btn-primary mt-6 w-auto inline-block px-6">
          Return to Dashboard
        </Link>
      </div>
    </div>
  )
}
