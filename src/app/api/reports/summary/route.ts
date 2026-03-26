import { NextRequest, NextResponse } from 'next/server'
import { getVerifiedTenantId } from '@/lib/dal'
import { prisma } from '@/lib/prisma'

// ─── Helper ───────────────────────────────────────────────────────────────────

function buildDateRange(from: string | null, to: string | null) {
  if (from && to) {
    return {
      gte: new Date(from),
      lte: new Date(new Date(to).setHours(23, 59, 59, 999)),
    }
  }
  // Default: current month
  const now = new Date()
  return {
    gte: new Date(now.getFullYear(), now.getMonth(), 1),
    lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
  }
}

function buildPreviousRange(from: string | null, to: string | null) {
  const current = buildDateRange(from, to)
  const diffMs = current.lte.getTime() - current.gte.getTime()
  return {
    gte: new Date(current.gte.getTime() - diffMs - 86400000),
    lte: new Date(current.gte.getTime() - 1),
  }
}

// ─── GET /api/reports/summary ─────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const tenantId = await getVerifiedTenantId()
    const { searchParams } = new URL(req.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const storeId = searchParams.get('storeId') || undefined

    const dateRange = buildDateRange(from, to)
    const prevRange = buildPreviousRange(from, to)

    const saleTxWhere = {
      tenantId,
      type: 'SALE' as const,
      ...(storeId ? { storeId } : {}),
    }

    // ── Current Period ────────────────────────────────────────────────────────
    const [currentAgg, currentCount, currentItems, prevAgg, prevCount] =
      await Promise.all([
        // Gross sales sum
        prisma.transaction.aggregate({
          where: { ...saleTxWhere, createdAt: dateRange },
          _sum: { totalAmount: true },
          _count: { id: true },
        }),
        // Transaction count (separate for clarity)
        prisma.transaction.count({
          where: { ...saleTxWhere, createdAt: dateRange },
        }),
        // All transaction items in period — to compute COGS from product.costPrice
        prisma.transactionItem.findMany({
          where: {
            transaction: {
              ...saleTxWhere,
              createdAt: dateRange,
            },
          },
          select: {
            quantity: true,
            unitPrice: true,
            product: { select: { costPrice: true } },
          },
        }),
        // Previous period gross sales
        prisma.transaction.aggregate({
          where: { ...saleTxWhere, createdAt: prevRange },
          _sum: { totalAmount: true },
        }),
        // Previous period count
        prisma.transaction.count({
          where: { ...saleTxWhere, createdAt: prevRange },
        }),
      ])

    const grossSales = currentAgg._sum.totalAmount ?? 0
    const txCount = currentCount

    // COGS = sum of (quantity × costPrice) for each item
    let totalCOGS = 0
    let totalRevenueLine = 0
    for (const item of currentItems) {
      const cost = item.product.costPrice ?? 0
      totalCOGS += item.quantity * cost
      totalRevenueLine += item.quantity * item.unitPrice
    }
    const netProfit = grossSales - totalCOGS
    const aov = txCount > 0 ? Math.round(grossSales / txCount) : 0
    const margin = grossSales > 0 ? (netProfit / grossSales) * 100 : 0

    // ── Period Delta ──────────────────────────────────────────────────────────
    const prevGross = prevAgg._sum.totalAmount ?? 0
    const salesDeltaPct =
      prevGross > 0 ? ((grossSales - prevGross) / prevGross) * 100 : null
    const countDeltaPct =
      prevCount > 0 ? ((txCount - prevCount) / prevCount) * 100 : null

    // ── Daily Timeline ────────────────────────────────────────────────────────
    const dailyRaw = await prisma.transaction.findMany({
      where: { ...saleTxWhere, createdAt: dateRange },
      select: { totalAmount: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    })

    const timelineMap = new Map<string, { revenue: number; count: number }>()
    for (const tx of dailyRaw) {
      const key = tx.createdAt.toISOString().slice(0, 10) // YYYY-MM-DD
      const existing = timelineMap.get(key) ?? { revenue: 0, count: 0 }
      timelineMap.set(key, {
        revenue: existing.revenue + tx.totalAmount,
        count: existing.count + 1,
      })
    }

    const timeline = Array.from(timelineMap.entries()).map(([date, d]) => ({
      date,
      revenue: d.revenue,
      count: d.count,
    }))

    return NextResponse.json({
      grossSales,
      totalCOGS,
      netProfit,
      txCount,
      aov,
      margin: +margin.toFixed(2),
      salesDeltaPct: salesDeltaPct !== null ? +salesDeltaPct.toFixed(2) : null,
      countDeltaPct: countDeltaPct !== null ? +countDeltaPct.toFixed(2) : null,
      timeline,
    })
  } catch (error) {
    console.error('[/api/reports/summary]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
