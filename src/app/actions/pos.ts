'use server'

import { z } from 'zod'
import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// ─── Types exported for client use ───────────────────────────────────────────

export type POSProduct = {
  id: string
  name: string
  modelName: string
  sku: string | null
  price: number
  imageUrl: string | null
  condition: string
  warranty: string | null
  warrantyRel: { name: string; duration: number; durationUnit: string } | null
  category: { name: string } | null
  brandRel: { name: string } | null
  unit: { shortName: string } | null
  attributeValues: {
    attribute: { id: string; name: string }
    attributeValue: { id: string; value: string }
  }[]
  storeInventory: {
    stock: number
    price: number | null
    status: string
  } | null
}

export type CheckoutItem = {
  productId: string
  quantity: number
  unitPrice: number
}

export type PaymentMethod = 'CASH' | 'QRIS' | 'DEBIT' | 'CREDIT'

const CheckoutSchema = z.object({
  storeId: z.string().min(1, 'Store is required'),
  paymentMethod: z.enum(['CASH', 'QRIS', 'DEBIT', 'CREDIT']),
  amountPaid: z.coerce.number().min(0),
  discount: z.coerce.number().min(0).max(100).default(0),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.coerce.number().int().min(1),
      unitPrice: z.coerce.number().min(0),
    })
  ).min(1, 'Cart cannot be empty'),
})

// ─── Fetch POS Products for a Given Store ────────────────────────────────────

export async function getPOSProducts(storeId: string): Promise<{
  success: boolean
  data?: POSProduct[]
  error?: string
}> {
  try {
    const session = await verifySession()

    if (!storeId) return { success: false, error: 'Store ID is required.' }

    // Verify store belongs to tenant
    // @ts-ignore
    const store = await prisma.store.findFirst({
      where: { id: storeId, tenantId: session.tenantId },
    })
    if (!store) return { success: false, error: 'Store not found or access denied.' }

    // @ts-ignore
    const products = await prisma.product.findMany({
      where: {
        tenantId: session.tenantId,
        inventories: {
          some: {
            storeId,
            stock: { gt: 0 },
          },
        },
      },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        modelName: true,
        sku: true,
        price: true,
        imageUrl: true,
        condition: true,
        warranty: true,
        warrantyRel: {
          select: { name: true, duration: true, durationUnit: true },
        },
        category: { select: { name: true } },
        brandRel: { select: { name: true } },
        unit: { select: { shortName: true } },
        attributeValues: {
          select: {
            attribute: { select: { id: true, name: true } },
            attributeValue: { select: { id: true, value: true } },
          },
        },
        inventories: {
          where: { storeId },
          select: { stock: true, price: true, status: true },
          take: 1,
        },
      },
    })

    const mapped: POSProduct[] = products.map((p: any) => ({
      ...p,
      storeInventory: p.inventories[0] ?? null,
    }))

    return { success: true, data: mapped }
  } catch {
    return { success: false, error: 'Failed to load products.' }
  }
}

// ─── Checkout Server Action ───────────────────────────────────────────────────

export async function processCheckout(payload: {
  storeId: string
  paymentMethod: string
  amountPaid: number
  discount: number
  notes?: string
  items: CheckoutItem[]
}): Promise<{ success: boolean; transactionId?: string; change?: number; error?: string }> {
  try {
    const session = await verifySession()

    const parsed = CheckoutSchema.safeParse(payload)
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0]
      return { success: false, error: firstError || 'Invalid checkout data.' }
    }

    const { storeId, paymentMethod, amountPaid, discount, notes, items } = parsed.data

    // Verify store belongs to tenant
    // @ts-ignore
    const store = await prisma.store.findFirst({
      where: { id: storeId, tenantId: session.tenantId },
    })
    if (!store) return { success: false, error: 'Store not found or access denied.' }

    // Calculate total before discount
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    const discountAmount = Math.round(subtotal * (discount / 100))
    const totalAmount = subtotal - discountAmount

    if (amountPaid < totalAmount && paymentMethod === 'CASH') {
      return { success: false, error: 'Insufficient payment amount.' }
    }

    // Run in DB transaction: verify stock, create transaction, deduct stock
    const transaction = await prisma.$transaction(async (tx) => {
      // Verify & lock stock for each item
      for (const item of items) {
        // @ts-ignore
        const inv = await tx.inventory.findUnique({
          where: { productId_storeId: { productId: item.productId, storeId } },
        })

        if (!inv) throw new Error(`Product ${item.productId} not found in store inventory.`)
        if (inv.stock < item.quantity)
          throw new Error(`Insufficient stock for product ${item.productId}.`)
      }

      // Create the transaction record
      // @ts-ignore
      const newTx = await tx.transaction.create({
        data: {
          type: 'SALE',
          totalAmount,
          notes: notes || null,
          tenantId: session.tenantId,
          storeId,
          userId: session.userId,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
      })

      // Deduct stock from inventory
      for (const item of items) {
        // @ts-ignore
        await tx.inventory.update({
          where: { productId_storeId: { productId: item.productId, storeId } },
          data: { stock: { decrement: item.quantity } },
        })
      }

      return newTx
    })

    revalidatePath('/dashboard/pos')
    revalidatePath('/dashboard/transactions')
    revalidatePath('/dashboard')

    const change = paymentMethod === 'CASH' ? amountPaid - totalAmount : 0

    return { success: true, transactionId: transaction.id, change }
  } catch (err: any) {
    const isCustomError = err instanceof Error && (err.message.includes('stock') || err.message.includes('not found'))
    return { success: false, error: isCustomError ? err.message : 'Checkout failed. Please try again.' }
  }
}
