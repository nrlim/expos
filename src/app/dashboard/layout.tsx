import { verifySession } from '@/lib/dal'
import { getTenantPlan } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import Sidebar from '@/components/dashboard/Sidebar'
import TopBar from '@/components/dashboard/TopBar'
import BottomNav from '@/components/dashboard/BottomNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await verifySession()
  const [stores, plan] = await Promise.all([
    // @ts-ignore
    prisma.store.findMany({
      where: { tenantId: session.tenantId },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    }),
    getTenantPlan(session.tenantId),
  ])

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {/* Desktop sidebar — hidden on mobile via Sidebar's own class */}
      <Sidebar session={session} plan={plan} />

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <TopBar session={session} stores={stores} />

        {/*
          Main content area:
          - pb-16 lg:pb-0 accounts for the bottom nav bar on mobile
          - overflow-y-auto allows scrolling within the content area
        */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav — hidden on lg+ via BottomNav's own class */}
      <BottomNav session={session} />
    </div>
  )
}
