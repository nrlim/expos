import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { CategoryManager } from './components/CategoryManager'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Categories' }

export default async function CategoriesPage() {
  const session = await verifySession()

  // @ts-ignore — parentId/imageUrl/children added post Prisma generate; runtime OK
  const categories = await prisma.category.findMany({
    where: {
      tenantId: session.tenantId,
      parentId: null, // root only
    },
    include: {
      children: {
        orderBy: { name: 'asc' },
        include: { _count: { select: { products: true } } }
      },
      _count: { select: { products: true } },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="animate-fade-in w-full pb-10">
      <div className="page-header mt-4">
        <h1 className="page-title">Categories</h1>
        <p className="page-subtitle">Organize your product taxonomy. Categories can have sub-categories.</p>
      </div>

      <div className="mt-6">
        <CategoryManager categories={categories as any} />
      </div>
    </div>
  )
}
