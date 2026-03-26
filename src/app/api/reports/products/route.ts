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

// GET /api/reports/products
export async function GET(req: NextRequest) {
  try {
    const tenantId = await getVerifiedTenantId()
    const { searchParams } = new URL(req.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const storeId = searchParams.get('storeId') || undefined
    const dateRange = buildDateRange(from, to)

    const saleTxWhere = {
      tenantId,
      type: 'SALE' as const,
      createdAt: dateRange,
      ...(storeId ? { storeId } : {}),
    }

    // ── Best Sellers: top products by qty & revenue in the period ────────────
    const soldItems = await prisma.transactionItem.findMany({
      where: { transaction: saleTxWhere },
      select: {
        quantity: true,
        unitPrice: true,
        product: {
          select: {
            id: true,
            name: true,
            modelName: true,
            costPrice: true,
            category: { select: { name: true } },
          },
        },
      },
    })

    // Aggregate per product
    const productMap = new Map<
      string,
      {
        productId: string
        name: string
        modelName: string
        category: string
        totalQty: number
        totalRevenue: number
        totalCOGS: number
        grossProfit: number
      }
    >()

    for (const item of soldItems) {
      const p = item.product
      const existing = productMap.get(p.id) ?? {
        productId: p.id,
        name: p.name,
        modelName: p.modelName,
        category: p.category?.name ?? 'Uncategorised',
        totalQty: 0,
        totalRevenue: 0,
        totalCOGS: 0,
        grossProfit: 0,
      }
      const revenue = item.quantity * item.unitPrice
      const cogs = item.quantity * (p.costPrice ?? 0)
      productMap.set(p.id, {
        ...existing,
        totalQty: existing.totalQty + item.quantity,
        totalRevenue: existing.totalRevenue + revenue,
        totalCOGS: existing.totalCOGS + cogs,
        grossProfit: existing.grossProfit + (revenue - cogs),
      })
    }

    const allProducts = Array.from(productMap.values())

    // Top 10 by volume
    const byVolume = [...allProducts]
      .sort((a, b) => b.totalQty - a.totalQty)
      .slice(0, 10)

    // Top 10 by gross profit
    const byProfit = [...allProducts]
      .sort((a, b) => b.grossProfit - a.grossProfit)
      .slice(0, 10)

    // ── Slow Movers (Stock Aging) ─────────────────────────────────────────────
    // Products within this tenant with available inventory but low/no recent sales
    const allInventory = await prisma.inventory.findMany({
      where: {
        store: { tenantId },
        stock: { gt: 0 },
        status: 'AVAILABLE',
        ...(storeId ? { storeId } : {}),
      },
      select: {
        stock: true,
        product: {
          select: {
            id: true,
            name: true,
            modelName: true,
            createdAt: true,
            costPrice: true,
            category: { select: { name: true } },
          },
        },
      },
    })

    // Map sold product IDs in this period
    const soldProductIds = new Set(soldItems.map((i) => i.product.id))

    // Slow movers = in-stock products NOT sold in the period, sorted by age
    const slowMovers = allInventory
      .filter((inv) => !soldProductIds.has(inv.product.id))
      .map((inv) => ({
        productId: inv.product.id,
        name: inv.product.name,
        modelName: inv.product.modelName,
        category: inv.product.category?.name ?? 'Uncategorised',
        stock: inv.stock,
        stockValue: inv.stock * (inv.product.costPrice ?? 0),
        addedAt: inv.product.createdAt,
        daysInStock: Math.floor(
          (Date.now() - new Date(inv.product.createdAt).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      }))
      .sort((a, b) => b.daysInStock - a.daysInStock)
      .slice(0, 20)

    return NextResponse.json({ byVolume, byProfit, slowMovers })
  } catch (error) {
    console.error('[/api/reports/products]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
