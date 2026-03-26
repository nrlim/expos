import type { Metadata } from 'next'
import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import ReportShell from './components/ReportShell'
import SummarySection from './components/SummarySection'

export const metadata: Metadata = {
  title: 'Sales Overview | Reports | ex-POS',
  description: 'Executive sales summary with gross sales, net profit, COGS and period trends.',
}

export default async function SalesOverviewPage() {
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
      pageTitle="Sales Overview"
      pageSubtitle="Executive summary for"
      section="summary"
    >
      <SummarySection />
    </ReportShell>
  )
}
