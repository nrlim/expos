interface TransactionItem {
  quantity: number
  unitPrice: number
}

interface Transaction {
  id: string
  type: string
  totalAmount: number
  createdAt: Date
  user: { username: string }
  items: TransactionItem[]
}

interface Props {
  transactions: Transaction[]
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export default function RecentTransactions({ transactions }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-slate-400 text-sm">No transactions yet.</p>
        <p className="text-slate-600 text-xs mt-1">Transactions will appear here once created.</p>
      </div>
    )
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Type</th>
          <th>Items</th>
          <th>Amount</th>
          <th>Cashier</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((tx) => (
          <tr key={tx.id}>
            <td className="font-mono text-xs text-slate-500">{tx.id.slice(0, 8)}</td>
            <td>
              <span
                className={
                  tx.type === 'SALE'
                    ? 'badge badge-success'
                    : tx.type === 'REFUND'
                    ? 'badge badge-danger'
                    : 'badge badge-neutral'
                }
              >
                {tx.type}
              </span>
            </td>
            <td className="text-slate-400">{tx.items.length}</td>
            <td className="font-medium text-slate-200">{formatCurrency(tx.totalAmount)}</td>
            <td className="text-slate-400">{tx.user.username}</td>
            <td className="text-slate-500 text-xs">{formatDate(tx.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
