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
    <div className="flex flex-col">
      <ul className="divide-y divide-border/40">
        {transactions.map((tx) => (
          <li key={tx.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center ${tx.type === 'SALE' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                {tx.type === 'SALE' ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{tx.type === 'SALE' ? 'Sale' : 'Refund'} #{tx.id.slice(0, 8)}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{formatDate(tx.createdAt)} • {tx.items.length} items</p>
              </div>
            </div>
            <div className="text-right shrink-0 ml-3">
              <p className={`text-[13px] font-bold ${tx.type === 'REFUND' ? 'text-destructive' : 'text-emerald-400'}`}>
                {tx.type === 'REFUND' ? '-' : '+'}{formatCurrency(tx.totalAmount)}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5"><span className="opacity-70">by</span> {tx.user.username}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
