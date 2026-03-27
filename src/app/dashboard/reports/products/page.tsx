import type { Metadata } from 'next'
import { verifySession, getTenantPlan } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import ReportShell from '../components/ReportShell'
import ProductSection from '../components/ProductSection'
import { PagePlanGate } from '@/components/PagePlanGate'

export const metadata: Metadata = {
  title: 'Product Analytics | Reports | ex-POS',
  description: 'Best sellers by volume and profit, plus slow-moving stock identification.',
}

export default async function ProductAnalyticsPage() {
  const session = await verifySession()
  const [stores, plan] = await Promise.all([
    prisma.store.findMany({
      where: { tenantId: session.tenantId },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    getTenantPlan(session.tenantId),
  ])

  return (
    <ReportShell
      tenantName={session.tenantName}
      stores={stores}
      pageTitle="Product Analytics"
      pageSubtitle="Best sellers and stock aging analysis for"
      section="products"
    >
      <PagePlanGate feature="advanced_analytics" plan={plan}>
        <ProductSection />
      </PagePlanGate>
    </ReportShell>
  )
}
