import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { BrandManager } from './components/BrandManager'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Brands' }

export default async function BrandsPage() {
  const session = await verifySession()

  // @ts-ignore
  const brands = await prisma.brand.findMany({
    where: { tenantId: session.tenantId },
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="animate-fade-in w-full pb-10">
      <div className="page-header mt-4">
        <h1 className="page-title">Brands</h1>
        <p className="page-subtitle">Manage manufacturers and brands for your products.</p>
      </div>

      <div className="mt-6">
        <BrandManager brands={brands as any} />
      </div>
    </div>
  )
}
