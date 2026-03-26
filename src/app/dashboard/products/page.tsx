import type { Metadata } from 'next'
import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { ProductTable } from './components/ProductTable'

export const metadata: Metadata = { title: 'Products' }

export default async function ProductsPage() {
  const session = await verifySession()
  
  // strict tenant isolation
  const rawProducts = await prisma.product.findMany({
    where: { tenantId: session.tenantId },
    include: {
      category: {
        select: { id: true, name: true }
      },
      // @ts-ignore
      inventories: {
        select: { stock: true, storeId: true, price: true }
      }
    },
    orderBy: { createdAt: 'desc' },
  })
  
  // @ts-ignore
  const products = rawProducts.map((p: any) => {
    const totalStock = p.inventories?.reduce((acc: number, curr: any) => acc + (curr.stock || 0), 0) || 0
    return {
      ...p,
      stock: totalStock,
      stockStatus: totalStock > 0 ? 'AVAILABLE' : 'SOLD'
    }
  })
  
  const categories = await prisma.category.findMany({
    where: { tenantId: session.tenantId },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })

  // Format the data structure if necessary, though it matches our Client component directly.
  return (
    <div className="animate-fade-in w-full pb-10">
      <div className="page-header mt-4 mb-6">
        <div>
          <h1 className="page-title text-2xl">Products ({products.length})</h1>
          <p className="page-subtitle text-sm">Manage inventory, check stock levels, and update catalog details.</p>
        </div>
      </div>

      <ProductTable products={products} categories={categories} />
    </div>
  )
}
