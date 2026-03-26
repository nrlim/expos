import type { Metadata } from 'next'
import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { POSClient } from './components/POSClient'

export const metadata: Metadata = {
  title: 'Point of Sale — ex-POS',
  description: 'Fast & efficient cashier interface for ex-POS retail management.',
}

export default async function POSPage() {
  const session = await verifySession()

  // @ts-ignore
  const stores = await prisma.store.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, location: true },
  })

  // @ts-ignore
  const categories = await prisma.category.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, imageUrl: true },
  })

  return (
    <POSClient
      session={{
        userId: session.userId,
        username: session.username,
        role: session.role,
        tenantId: session.tenantId,
        tenantName: session.tenantName,
      }}
      stores={stores}
      categories={categories}
    />
  )
}
