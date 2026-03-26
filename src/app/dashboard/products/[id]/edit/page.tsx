import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { ProductForm } from '../../new/components/ProductForm'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = { title: 'Edit Product' }

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession()
  const resolvedParams = await params
  const { id } = resolvedParams

  // @ts-ignore
  const product = await prisma.product.findFirst({
    where: { 
      id,
      tenantId: session.tenantId
    },
    include: {
      inventories: true
    }
  })

  if (!product) {
    notFound()
  }

  // Fetch contextual choices (categories, brands, stores)
  // @ts-ignore
  const categories = await prisma.category.findMany({
    where: { tenantId: session.tenantId, parentId: null },
    include: { children: { orderBy: { name: 'asc' } } },
    orderBy: { name: 'asc' }
  })

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

  return (
    <div className="animate-fade-in w-full pb-10">
      <div className="page-header mt-4">
        <h1 className="page-title">Edit Product</h1>
        <p className="page-subtitle">Update product properties and stock levels.</p>
      </div>

      <div className="card p-6 mt-6">
        <ProductForm 
          categories={categories} 
          stores={stores} 
          brands={brands} 
          initialData={product as any} 
        />
      </div>
    </div>
  )
}
