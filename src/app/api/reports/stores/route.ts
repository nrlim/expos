import { NextRequest, NextResponse } from 'next/server'
import { getVerifiedTenantId } from '@/lib/dal'
import { prisma } from '@/lib/prisma'

function buildDateRange(from: string | null, to: string | null) {
  if (from && to) {
    return {
      gte: new Date(from),
      lte: new Date(new Date(to).setHours(23, 59, 59, 999)),
    }
  }
  const now = new Date()
  return {
    gte: new Date(now.getFullYear(), now.getMonth(), 1),
    lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
  }
}

// GET /api/reports/stores
export async function GET(req: NextRequest) {
  try {
    const tenantId = await getVerifiedTenantId()
    const { searchParams } = new URL(req.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const dateRange = buildDateRange(from, to)

    // Fetch all stores for the tenant
    const stores = await prisma.store.findMany({
      where: { tenantId },
      select: { id: true, name: true, location: true },
      orderBy: { name: 'asc' },
    })

    // For each store, get aggregated sales and compute COGS from items
    const storeMetrics = await Promise.all(
      stores.map(async (store) => {
        const saleTxWhere = {
          tenantId,
          storeId: store.id,
          type: 'SALE' as const,
          createdAt: dateRange,
        }

        const [agg, items] = await Promise.all([
          prisma.transaction.aggregate({
            where: saleTxWhere,
            _sum: { totalAmount: true },
            _count: { id: true },
          }),
          prisma.transactionItem.findMany({
            where: { transaction: saleTxWhere },
            select: {
              quantity: true,
              product: { select: { costPrice: true } },
            },
          }),
        ])

        const grossSales = agg._sum.totalAmount ?? 0
        const txCount = agg._count.id

        let cogs = 0
        for (const item of items) {
          cogs += item.quantity * (item.product.costPrice ?? 0)
        }

        const netProfit = grossSales - cogs
        const margin = grossSales > 0 ? (netProfit / grossSales) * 100 : 0

        return {
          storeId: store.id,
          storeName: store.name,
          location: store.location ?? '',
          grossSales,
          cogs,
          netProfit,
          txCount,
          margin: +margin.toFixed(2),
        }
      })
    )

    // Sort by gross sales descending (ranking)
    storeMetrics.sort((a, b) => b.grossSales - a.grossSales)

    return NextResponse.json({ stores: storeMetrics })
  } catch (error) {
    console.error('[/api/reports/stores]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
