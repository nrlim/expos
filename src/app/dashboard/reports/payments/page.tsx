import type { Metadata } from 'next'
import { verifySession, getTenantPlan } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import ReportShell from '../components/ReportShell'
import PaymentSection from '../components/PaymentSection'
import { PagePlanGate } from '@/components/PagePlanGate'

export const metadata: Metadata = {
  title: 'Payment Methods | Reports | ex-POS',
  description: 'Payment channel distribution across Cash, QRIS, Debit and Credit.',
}

export default async function PaymentMethodsPage() {
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
      pageTitle="Payment Methods"
      pageSubtitle="Cash flow distribution by channel for"
      section="payments"
    >
      <PagePlanGate feature="advanced_analytics" plan={plan}>
        <PaymentSection />
      </PagePlanGate>
    </ReportShell>
  )
}
