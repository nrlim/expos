import type { Metadata } from 'next'
import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import ReportShell from '../components/ReportShell'
import ProductSection from '../components/ProductSection'

export const metadata: Metadata = {
  title: 'Product Analytics | Reports | ex-POS',
  description: 'Best sellers by volume and profit, plus slow-moving stock identification.',
}

export default async function ProductAnalyticsPage() {
  const session = await verifySession()
  const stores = await prisma.store.findMany({
    where: { tenantId: session.tenantId },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return (
    <ReportShell
      tenantName={session.tenantName}
      stores={stores}
      pageTitle="Product Analytics"
      pageSubtitle="Best sellers and stock aging analysis for"
      section="products"
    >
      <ProductSection />
    </ReportShell>
  )
}
