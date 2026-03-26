import type { Metadata } from 'next'
import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { InventoryManager } from './components/InventoryManager'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Inventory Management' }

export default async function InventoryPage() {
  const session = await verifySession()
  
  if (session.role === 'CASHIER') {
    redirect('/dashboard/pos')
  }

  // Fetch all products with inventory
  const rawProducts = await prisma.product.findMany({
    where: { tenantId: session.tenantId },
    include: {
      category: { select: { id: true, name: true } },
      brandRel: { select: { id: true, name: true } },
      inventories: {
        select: { storeId: true, stock: true, price: true }
      }
    },
    orderBy: { name: 'asc' },
  })

  // Fetch all stores in the tenant
  const stores = await prisma.store.findMany({
    where: { tenantId: session.tenantId },
    select: { id: true, name: true, location: true },
    orderBy: { name: 'asc' }
  })

  // Format products
  // @ts-ignore
  const products = rawProducts.map((p: any) => {
    const totalStock = p.inventories?.reduce((acc: number, curr: any) => acc + (curr.stock || 0), 0) || 0
    return {
      id: p.id,
      name: p.name,
      modelName: p.modelName,
      sku: p.sku || '',
      price: p.price,
      imageUrl: p.imageUrl,
      category: p.category,
      brand: p.brandRel?.name || p.brand || '',
      totalStock,
      inventories: p.inventories || []
    }
  })

  return (
    <div className="animate-fade-in w-full pb-10">
      <div className="page-header mt-4 mb-6">
        <div>
          <h1 className="page-title text-2xl">Inventory & Stock</h1>
          <p className="page-subtitle text-sm">Transfer stock between stores and perform manual adjustments.</p>
        </div>
      </div>

      <InventoryManager products={products} stores={stores} />
    </div>
  )
}
