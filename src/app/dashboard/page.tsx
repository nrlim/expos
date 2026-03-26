import type { Metadata } from 'next'
import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import StatCard from '@/components/dashboard/StatCard'
import RecentTransactions from '@/components/dashboard/RecentTransactions'
import RevenueChart from '@/components/dashboard/RevenueChart'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const session = await verifySession()
  const tenantId = session.tenantId

  // Fetch all stats in parallel — all scoped to tenantId
  const [
    totalProducts,
    availableProducts,
    soldProducts,
    totalTransactions,
    recentTransactions,
    revenueDataRaw
  ] = await Promise.all([
    prisma.product.count({ where: { tenantId } }),
    // @ts-ignore
    prisma.product.count({ where: { tenantId, inventories: { some: { status: 'AVAILABLE' } } } }),
    // @ts-ignore
    prisma.product.count({ where: { tenantId, inventories: { every: { status: 'SOLD' } } } }),
    prisma.transaction.count({ where: { tenantId } }),
    prisma.transaction.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        user: { select: { username: true } },
        items: { select: { quantity: true, unitPrice: true } },
      },
    }),
    prisma.transaction.findMany({
      where: { 
        tenantId, 
        type: 'SALE',
        createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 14)) }
      },
      select: { totalAmount: true, createdAt: true },
      orderBy: { createdAt: 'asc' }
    })
  ])

  const totalRevenue = await prisma.transaction.aggregate({
    where: { tenantId, type: 'SALE' },
    _sum: { totalAmount: true },
  })

  // Format chart data (last 14 days)
  const chartDataMap = new Map<string, { revenue: number, transactions: number }>()
  
  // Initialize last 14 days with 0 so the chart doesn't have gaps
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    chartDataMap.set(dateStr, { revenue: 0, transactions: 0 })
  }

  // Populate data
  revenueDataRaw.forEach(t => {
    const dateStr = new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    if (chartDataMap.has(dateStr)) {
      const current = chartDataMap.get(dateStr)!
      chartDataMap.set(dateStr, {
        revenue: current.revenue + t.totalAmount,
        transactions: current.transactions + 1
      })
    }
  })

  const chartData = Array.from(chartDataMap.entries()).map(([date, data]) => ({
    date,
    revenue: data.revenue,
    transactions: data.transactions
  }))

  const revenue = totalRevenue._sum.totalAmount ?? 0

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Overview for <span className="font-semibold text-indigo-400">{session.tenantName}</span>
        </p>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Products"
          value={totalProducts.toLocaleString()}
          delta="All inventory items"
          color="brand"
        />
        <StatCard
          label="Available"
          value={availableProducts.toLocaleString()}
          delta="Ready to sell"
          color="success"
        />
        <StatCard
          label="Sold"
          value={soldProducts.toLocaleString()}
          delta="Completed units"
          color="neutral"
        />
        <StatCard
          label="Revenue"
          value={`Rp ${(revenue / 1000).toFixed(0)}K`}
          delta={`${totalTransactions} transactions`}
          color="accent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Main Chart */}
        <div className="card p-0 overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-border bg-muted/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-[13px] font-bold text-foreground">Revenue Overview</h2>
              <p className="text-[10px] text-muted-foreground mt-0.5">Last 14 days gross sales volume</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground group">
                 <span className="w-2.5 h-2.5 rounded-[2px] bg-primary group-hover:bg-primary/80 transition-colors shadow-[0_0_8px_0_rgba(129,140,248,0.5)]"></span>
                 Gross Sales
              </span>
            </div>
          </div>
          <div className="p-5 flex-1 w-full bg-card">
             <RevenueChart data={chartData} />
          </div>
        </div>

        {/* Recent transactions */}
        <div className="card p-0 overflow-hidden flex flex-col max-h-[460px]">
          <div className="px-5 py-4 border-b border-border bg-muted/5 flex items-center justify-between">
            <div>
               <h2 className="text-[13px] font-bold text-foreground">Recent Transactions</h2>
               <p className="text-[10px] text-muted-foreground mt-0.5">Latest system activity</p>
            </div>
            <span className="badge badge-neutral">{totalTransactions} total</span>
          </div>
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            <RecentTransactions transactions={recentTransactions} />
          </div>
          <div className="border-t border-border bg-muted/5 p-3 flex justify-center mt-auto shrink-0">
             <a href="/dashboard/transactions" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                View all transactions
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
             </a>
          </div>
        </div>
      </div>
    </div>
  )
}
