import type { Metadata } from 'next'
import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ReceiptBuilder from './ReceiptBuilder'

export const metadata: Metadata = { title: 'Receipt Configuration | ex-POS' }

export default async function ReceiptSettingsPage() {
  const session = await verifySession()
  if (session.role !== 'OWNER' && session.role !== 'ADMIN') redirect('/403')

  const stores = await prisma.store.findMany({
    where: { tenantId: session.tenantId },
    select: { id: true, name: true },
    orderBy: { createdAt: 'asc' }
  })

  return (
    <div className="animate-fade-in space-y-6 w-full">
      <div className="page-header flex-col items-start gap-1 mb-8 pb-4 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Receipt Configuration</h1>
        <p className="text-sm text-muted-foreground mt-1">Customize thermal receipt headers, footers, and printing rules per store.</p>
      </div>

      <ReceiptBuilder stores={stores} />
    </div>
  )
}
