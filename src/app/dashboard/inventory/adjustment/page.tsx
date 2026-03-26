import type { Metadata } from 'next'
import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { AdjustmentManager } from './components/AdjustmentManager'

export const metadata: Metadata = { title: 'Stock Adjustment' }

export default async function AdjustmentPage() {
  const session = await verifySession()
  
  if (session.role === 'CASHIER') {
    redirect('/dashboard/pos')
  }

  // Fetch all products with inventory
  const rawProducts = await prisma.product.findMany({
    where: { tenantId: session.tenantId },
    include: {
      inventories: {
        select: { storeId: true, stock: true }
      }
    },
    orderBy: { name: 'asc' },
  })

  // Fetch all stores in the tenant
  const stores = await prisma.store.findMany({
    where: { tenantId: session.tenantId },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })

  // Format products
  // @ts-ignore
  const products = rawProducts.map((p: any) => {
    const totalStock = p.inventories?.reduce((acc: number, curr: any) => acc + (curr.stock || 0), 0) || 0
    return {
      id: p.id,
      name: p.name,
      totalStock,
      inventories: p.inventories || []
    }
  })

  return (
    <div className="animate-fade-in w-full pb-10">
      <div className="page-header mt-4 mb-6">
        <div>
          <h1 className="page-title text-2xl">Stock Adjustment</h1>
          <p className="page-subtitle text-sm">Add or deduct stock for a specific product at a specific store.</p>
        </div>
      </div>

      <AdjustmentManager products={products} stores={stores} />
    </div>
  )
}
