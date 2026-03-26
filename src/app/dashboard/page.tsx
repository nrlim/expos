import type { Metadata } from 'next'
import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import StatCard from '@/components/dashboard/StatCard'
import RecentTransactions from '@/components/dashboard/RecentTransactions'

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
  ])

  const totalRevenue = await prisma.transaction.aggregate({
    where: { tenantId, type: 'SALE' },
    _sum: { totalAmount: true },
  })

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

      {/* Recent transactions */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200">Recent Transactions</h2>
          <span className="badge badge-neutral">{totalTransactions} total</span>
        </div>
        <RecentTransactions transactions={recentTransactions} />
      </div>
    </div>
  )
}
