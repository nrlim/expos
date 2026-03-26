import type { Metadata } from 'next'
import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { StoreManager } from './components/StoreManager'

export const metadata: Metadata = { title: 'Stores & Locations' }

export default async function StoresPage() {
  const session = await verifySession()
  if (session.role !== 'OWNER') redirect('/403') // Strict restriction

  const stores = await prisma.store.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { createdAt: 'asc' },
    include: {
      _count: {
        select: { inventories: true, transactions: true }
      }
    }
  })

  return (
    <div className="animate-fade-in space-y-6 w-full">
      <div className="page-header flex-col items-start gap-1">
        <h1 className="page-title">Stores & Locations</h1>
        <p className="page-subtitle">Manage multiple physical outlets and their specific details.</p>
      </div>

      <StoreManager stores={stores} />
    </div>
  )
}
