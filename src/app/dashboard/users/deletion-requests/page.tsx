import type { Metadata } from 'next'
import { verifySession } from '@/lib/dal'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Delete Account Requests' }

export default async function DeletionRequestsPage() {
  const session = await verifySession()
  
  if (session.role === 'CASHIER') {
    redirect('/dashboard/pos')
  }

  return (
    <div className="animate-fade-in w-full pb-10">
      <div className="page-header mt-4 mb-6">
        <div>
          <h1 className="page-title text-2xl">Delete Account Requests</h1>
          <p className="page-subtitle text-sm">Manage incoming requests from users to delete their account data.</p>
        </div>
      </div>

      <div className="card flex items-center justify-center p-12 custom-empty-state">
        <div className="text-center space-y-3 max-w-sm">
          <svg className="w-12 h-12 text-muted-foreground/30 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-semibold text-foreground text-base">No pending requests</p>
          <p className="text-xs text-muted-foreground">There are currently no active account deletion requests in the queue.</p>
        </div>
      </div>
    </div>
  )
}
