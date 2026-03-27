import type { Metadata } from 'next'
import { verifySession, getTenantPlan } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { PagePlanGate } from '@/components/PagePlanGate'
import { OrderMonitorBoard } from './components/OrderMonitorBoard'

export const metadata: Metadata = {
  title: 'Order Monitor | ex-POS',
  description: 'Real-time order tracking and production workflow monitor.',
}

export default async function OrderMonitorPage() {
  const session = await verifySession()
  if (session.role === 'CASHIER') redirect('/dashboard/pos')

  const [plan, stores] = await Promise.all([
    getTenantPlan(session.tenantId),
    prisma.store.findMany({
      where: { tenantId: session.tenantId },
      select: { id: true, name: true },
    }),
  ])

  // Fetch active orders server-side (for initial render); client will poll/revalidate
  // @ts-ignore - orderStatus field newly added to schema
  const activeOrders = await prisma.transaction.findMany({
    where: {
      tenantId: session.tenantId,
      type: 'SALE',
      orderStatus: { notIn: ['COMPLETED', 'CANCELLED'] },
    },
    orderBy: { createdAt: 'asc' },
    include: {
      store: { select: { id: true, name: true } },
      user: { select: { id: true, username: true } },
      items: {
        include: { product: { select: { id: true, name: true } } },
      },
      // @ts-ignore
      orderLogs: {
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { changedBy: { select: { username: true } } },
      },
    },
  })

  return (
    <div className="animate-fade-in space-y-6 w-full">
      <div className="page-header flex-col items-start gap-1">
        <h1 className="page-title">Order Monitor</h1>
        <p className="page-subtitle">
          Real-time production workflow — track every order from payment to fulfillment.
        </p>
      </div>

      <PagePlanGate feature="order_tracking" plan={plan}>
        <OrderMonitorBoard
          initialOrders={activeOrders as any}
          stores={stores}
          currentUserId={session.userId}
        />
      </PagePlanGate>
    </div>
  )
}
