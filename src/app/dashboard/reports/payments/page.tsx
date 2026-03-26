import type { Metadata } from 'next'
import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import ReportShell from '../components/ReportShell'
import PaymentSection from '../components/PaymentSection'

export const metadata: Metadata = {
  title: 'Payment Methods | Reports | ex-POS',
  description: 'Payment channel distribution across Cash, QRIS, Debit and Credit.',
}

export default async function PaymentMethodsPage() {
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
      pageTitle="Payment Methods"
      pageSubtitle="Cash flow distribution by channel for"
      section="payments"
    >
      <PaymentSection />
    </ReportShell>
  )
}
