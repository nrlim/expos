import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { WarrantyManager } from './components/WarrantyManager'

export const metadata = {
  title: 'Warranties - Master Data',
}

export default async function WarrantiesPage() {
  const session = await verifySession()

  // @ts-ignore
  const warranties = await prisma.warranty.findMany({
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
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Warranties</h1>
        <p className="text-sm text-muted-foreground">Manage different warranty types that can be attached to products.</p>
      </div>
      <WarrantyManager warranties={warranties} />
    </div>
  )
}
