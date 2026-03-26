import type { Metadata } from 'next'
import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import ReportShell from '../components/ReportShell'
import StoreSection from '../components/StoreSection'

export const metadata: Metadata = {
  title: 'Store Performance | Reports | ex-POS',
  description: 'Side-by-side revenue, profit and transaction comparison across all physical stores.',
}

export default async function StorePerformancePage() {
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
      pageTitle="Store Performance"
      pageSubtitle="Multi-store revenue comparison for"
      section="stores"
    >
      <StoreSection />
    </ReportShell>
  )
}
