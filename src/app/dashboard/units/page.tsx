import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { UnitManager } from './components/UnitManager'

export const metadata = {
  title: 'Units - Master Data',
}

export default async function UnitsPage() {
  const session = await verifySession()

  // @ts-ignore
  const units = await prisma.unit.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { products: true }
      }
    }
  })

  return (
    <div className="space-y-6 w-full py-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Units</h1>
        <p className="text-sm text-muted-foreground">Manage physical units of measurement for your products (e.g., Pcs, Kg, Liter).</p>
      </div>
      <UnitManager units={units} />
    </div>
  )
}
