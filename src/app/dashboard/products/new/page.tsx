import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { ProductForm } from './components/ProductForm'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Add Product' }

export default async function NewProductPage() {
  const session = await verifySession()

  // Fetch root categories with children for grouped dropdown
  // @ts-ignore — parentId / children added post prisma-generate; runtime is correct
  const categories = await prisma.category.findMany({
    where: { tenantId: session.tenantId, parentId: null },
    include: { children: { orderBy: { name: 'asc' } } },
    orderBy: { name: 'asc' }
  })

  // Fetch stores isolated by tenant
  // @ts-ignore
  const stores = await prisma.store.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { name: 'asc' }
  })

  // @ts-ignore
  const brands = await prisma.brand.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { name: 'asc' }
  })

  // @ts-ignore
  const units = await prisma.unit.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { name: 'asc' }
  })

  // @ts-ignore
  const warranties = await prisma.warranty.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { name: 'asc' }
  })

  // @ts-ignore
  const attributes = await prisma.attribute.findMany({
    where: { tenantId: session.tenantId },
    include: { values: { orderBy: { value: 'asc' } } },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="animate-fade-in w-full pb-10">
      <div className="page-header mt-4">
        <h1 className="page-title">Add New Product</h1>
        <p className="page-subtitle">Enter product details carefully for inventory accuracy.</p>
      </div>

      <div className="card p-6 mt-6">
        <ProductForm 
          categories={categories} 
          stores={stores} 
          brands={brands} 
          units={units}
          warranties={warranties}
          attributes={attributes}
        />
      </div>
    </div>
  )
}
