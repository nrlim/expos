import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getVerifiedTenantId } from '@/lib/dal'

// GET /api/products — returns tenant-scoped product list
export async function GET(request: NextRequest) {
  try {
    const tenantId = await getVerifiedTenantId()

    const { searchParams } = request.nextUrl
    const page    = Math.max(1, parseInt(searchParams.get('page')    ?? '1'))
    const limit   = Math.min(100, parseInt(searchParams.get('limit') ?? '20'))
    const brand   = searchParams.get('brand')  ?? undefined
    const status  = searchParams.get('status') ?? undefined
    const sort    = searchParams.get('sort')   ?? 'newest'

    const where = {
      tenantId, // strict isolation — only this tenant's data
      ...(brand  ? { brand }                       : {}),
      // @ts-ignore
      ...(status ? { inventories: { some: { status: status as 'AVAILABLE' | 'BOOKED' | 'SOLD' } } } : {}),
    }

    const orderBy =
      sort === 'price_asc'  ? { price: 'asc'  as const } :
      sort === 'price_desc' ? { price: 'desc' as const } :
                              { createdAt: 'desc' as const }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    return Response.json({
      data: products,
      meta: {
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/products — create a new product for the current tenant
export async function POST(request: NextRequest) {
  try {
    const tenantId = await getVerifiedTenantId()
    const body = await request.json()

    const {
      name, brand, modelName, sku, storage, price, costPrice,
      condition, batteryHealth, isFullset, warranty, images, stock, storeId,
    } = body

    if (!name || !brand || !price || !condition) {
      return Response.json(
        { error: 'name, brand, price, and condition are required.' },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: {
        name:          String(name),
        brand:         String(brand),
        modelName:     String(modelName ?? name),
        sku:           sku   ? String(sku)   : undefined,
        storage:       storage ? String(storage) : undefined,
        price:         parseInt(String(price)),
        costPrice:     costPrice ? parseInt(String(costPrice)) : undefined,
        condition:     String(condition),
        batteryHealth: batteryHealth ? parseInt(String(batteryHealth)) : undefined,
        isFullset:     Boolean(isFullset),
        warranty:      warranty ? String(warranty) : undefined,
        images:        JSON.stringify(images ?? []),
        tenantId,      // always set from verified session — never from body
        // @ts-ignore
        inventories: storeId ? {
          create: [{
            storeId: String(storeId),
            stock: stock ? parseInt(String(stock)) : 1,
          }]
        } : undefined,
      },
    })

    return Response.json({ data: product }, { status: 201 })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
