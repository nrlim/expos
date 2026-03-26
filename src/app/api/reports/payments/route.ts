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

// GET /api/reports/payments
export async function GET(req: NextRequest) {
  try {
    const tenantId = await getVerifiedTenantId()
    const { searchParams } = new URL(req.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const storeId = searchParams.get('storeId') || undefined
    const dateRange = buildDateRange(from, to)

    const baseTxWhere = {
      tenantId,
      type: 'SALE' as const,
      createdAt: dateRange,
      ...(storeId ? { storeId } : {}),
    }

    // Group by paymentMethod
    // We use groupBy for efficiency — note: null paymentMethod = legacy records
    const grouped = await prisma.transaction.groupBy({
      by: ['paymentMethod'],
      where: baseTxWhere,
      _sum: { totalAmount: true },
      _count: { id: true },
    })

    const totalRevenue = grouped.reduce(
      (sum, g) => sum + (g._sum.totalAmount ?? 0),
      0
    )

    const distribution = grouped.map((g) => ({
      method: g.paymentMethod ?? 'UNKNOWN',
      amount: g._sum.totalAmount ?? 0,
      count: g._count.id,
      pct: totalRevenue > 0
        ? +((((g._sum.totalAmount ?? 0) / totalRevenue) * 100)).toFixed(2)
        : 0,
    }))

    // Sort by amount descending
    distribution.sort((a, b) => b.amount - a.amount)

    return NextResponse.json({ distribution, totalRevenue })
  } catch (error) {
    console.error('[/api/reports/payments]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
