import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import Sidebar from '@/components/dashboard/Sidebar'
import TopBar from '@/components/dashboard/TopBar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await verifySession()

  // @ts-ignore
  const stores = await prisma.store.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <Sidebar session={session} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar session={session} stores={stores} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
