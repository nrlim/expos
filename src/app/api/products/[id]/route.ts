import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getVerifiedTenantId, verifySession } from '@/lib/dal'

// GET /api/products/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = await getVerifiedTenantId()
    const { id } = await params

    const product = await prisma.product.findFirst({
      where: { id, tenantId }, // tenantId ensures cross-tenant access is impossible
    })

    if (!product) {
      return Response.json({ error: 'Product not found.' }, { status: 404 })
    }

    return Response.json({ data: product })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/products/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = await getVerifiedTenantId()
    const { id } = await params

    // Verify the product belongs to the requesting tenant before any update
    const existing = await prisma.product.findFirst({ where: { id, tenantId } })
    if (!existing) {
      return Response.json({ error: 'Product not found.' }, { status: 404 })
    }

    const body = await request.json()
    // Explicitly omit tenantId from body to prevent tenant hopping
    const { tenantId: _ignored, ...safe } = body

    const updated = await prisma.product.update({
      where: { id, tenantId },
      data: {
        ...(safe.name         !== undefined ? { name:         String(safe.name)                    } : {}),
        ...(safe.brand        !== undefined ? { brand:        String(safe.brand)                   } : {}),
        ...(safe.price         !== undefined ? { price:        parseInt(String(safe.price))         } : {}),
        ...(safe.condition    !== undefined ? { condition:    String(safe.condition)               } : {}),
        ...(safe.batteryHealth!== undefined ? { batteryHealth:parseInt(String(safe.batteryHealth)) } : {}),
        ...(safe.images       !== undefined ? { images:       JSON.stringify(safe.images)         } : {}),
      },
    })

    return Response.json({ data: updated })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/products/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = await getVerifiedTenantId()
    const session  = await verifySession()
    const { id }   = await params

    // Only OWNER or ADMIN can delete
    if (session.role === 'CASHIER') {
      return Response.json({ error: 'Forbidden.' }, { status: 403 })
    }

    // Verify ownership before deletion
    const existing = await prisma.product.findFirst({ where: { id, tenantId } })
    if (!existing) {
      return Response.json({ error: 'Product not found.' }, { status: 404 })
    }

    await prisma.product.delete({ where: { id, tenantId } })
    return Response.json({ data: { id } })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
