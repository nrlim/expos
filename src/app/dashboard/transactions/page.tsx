import type { Metadata } from 'next'
import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = { title: 'Transactions' }

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount)
}

export default async function TransactionsPage() {
  const session = await verifySession()

  const transactions = await prisma.transaction.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      user: { select: { username: true } },
      items: { select: { quantity: true, unitPrice: true } },
    },
  })

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Transactions</h1>
        <p className="page-subtitle">{transactions.length} transactions loaded</p>
      </div>

      <div className="card overflow-hidden">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-slate-400 text-sm">No transactions recorded yet.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Items</th>
                <th>Total</th>
                <th>Cashier</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="font-mono text-xs text-slate-500">{tx.id.slice(0, 8)}</td>
                  <td>
                    <span className={
                      tx.type === 'SALE'   ? 'badge badge-success' :
                      tx.type === 'REFUND' ? 'badge badge-danger'  : 'badge badge-neutral'
                    }>
                      {tx.type}
                    </span>
                  </td>
                  <td className="text-slate-400">{tx.items.length}</td>
                  <td className={`font-bold ${tx.type === 'REFUND' ? 'text-destructive' : 'text-emerald-400'}`}>
                    {tx.type === 'REFUND' ? '-' : '+'}{formatCurrency(tx.totalAmount)}
                  </td>
                  <td className="text-slate-400">{tx.user.username}</td>
                  <td className="text-slate-500 text-xs">
                    {new Intl.DateTimeFormat('en-GB', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    }).format(new Date(tx.createdAt))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
