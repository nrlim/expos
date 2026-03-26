'use server'

import { z } from 'zod'
import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const AdjustStockSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  storeId: z.string().min(1, 'Store is required'),
  quantityStr: z.string().min(1, 'Quantity is required'),
  notes: z.string().optional(),
})

export async function adjustStock(payload: FormData) {
  try {
    const session = await verifySession()

    // Admins and owners only
    if (session.role === 'CASHIER') {
      return { success: false, error: 'Unauthorized role.' }
    }

    const data = Object.fromEntries(payload.entries())
    const parsed = AdjustStockSchema.safeParse(data)

    if (!parsed.success) {
      return { success: false, error: 'Invalid input data.' }
    }

    const { productId, storeId, quantityStr, notes } = parsed.data
    const quantity = parseInt(quantityStr, 10)
    
    if (isNaN(quantity) || quantity === 0) {
      return { success: false, error: 'Quantity must be a non-zero number.' }
    }

    await prisma.$transaction(async (tx) => {
      // Find current inventory
      // @ts-ignore
      let inv = await tx.inventory.findUnique({
        where: { productId_storeId: { productId, storeId } },
      })

      if (!inv) {
        if (quantity < 0) throw new Error('Cannot reduce stock below 0.')
        // Create if it doesn't exist
        // @ts-ignore
        inv = await tx.inventory.create({
          data: {
            productId,
            storeId,
            stock: quantity
          }
        })
      } else {
        if (inv.stock + quantity < 0) {
          throw new Error('Adjustment would result in negative stock.')
        }
        // @ts-ignore
        inv = await tx.inventory.update({
          where: { productId_storeId: { productId, storeId } },
          data: { stock: { increment: quantity } },
        })
      }

      // Record transaction
      // @ts-ignore
      await tx.transaction.create({
        data: {
          type: 'ADJUSTMENT',
          totalAmount: 0,
          notes: notes || `Stock adjustment: ${quantity > 0 ? '+' : ''}${quantity}`,
          tenantId: session.tenantId,
          storeId,
          userId: session.userId,
          items: {
            create: [
              {
                productId,
                quantity: Math.abs(quantity),
                unitPrice: 0,
              }
            ]
          }
        }
      })
    })

    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard/products')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to adjust stock.' }
  }
}

const TransferStockSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  sourceStoreId: z.string().min(1, 'Source store is required'),
  targetStoreId: z.string().min(1, 'Target store is required'),
  quantityStr: z.string().min(1, 'Quantity is required'),
  notes: z.string().optional(),
})

export async function transferStock(payload: FormData) {
  try {
    const session = await verifySession()

    if (session.role === 'CASHIER') {
      return { success: false, error: 'Unauthorized role.' }
    }

    const data = Object.fromEntries(payload.entries())
    const parsed = TransferStockSchema.safeParse(data)

    if (!parsed.success) {
      return { success: false, error: 'Invalid input data.' }
    }

    const { productId, sourceStoreId, targetStoreId, quantityStr, notes } = parsed.data
    const quantity = parseInt(quantityStr, 10)

    if (sourceStoreId === targetStoreId) {
      return { success: false, error: 'Source and target stores cannot be the same.' }
    }

    if (isNaN(quantity) || quantity <= 0) {
      return { success: false, error: 'Quantity must be greater than 0.' }
    }

    await prisma.$transaction(async (tx) => {
      // Check source inventory
      // @ts-ignore
      const sourceInv = await tx.inventory.findUnique({
        where: { productId_storeId: { productId, storeId: sourceStoreId } },
      })

      if (!sourceInv || sourceInv.stock < quantity) {
        throw new Error('Insufficient stock in source store for transfer.')
      }

      // Deduct from source
      // @ts-ignore
      await tx.inventory.update({
        where: { productId_storeId: { productId, storeId: sourceStoreId } },
        data: { stock: { decrement: quantity } },
      })

      // Add to target
      // @ts-ignore
      const targetInv = await tx.inventory.findUnique({
        where: { productId_storeId: { productId, storeId: targetStoreId } },
      })

      if (!targetInv) {
        // @ts-ignore
        await tx.inventory.create({
          data: {
            productId,
            storeId: targetStoreId,
            stock: quantity
          }
        })
      } else {
        // @ts-ignore
        await tx.inventory.update({
          where: { productId_storeId: { productId, storeId: targetStoreId } },
          data: { stock: { increment: quantity } },
        })
      }

      // Record transaction
      // @ts-ignore
      await tx.transaction.create({
        data: {
          type: 'TRANSFER',
          totalAmount: 0,
          notes: notes || `Transfer ${quantity} to store ${targetStoreId}`,
          tenantId: session.tenantId,
          storeId: sourceStoreId,
          targetStoreId: targetStoreId,
          userId: session.userId,
          items: {
            create: [
              {
                productId,
                quantity,
                unitPrice: 0,
              }
            ]
          }
        }
      })
    })

    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard/products')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to transfer stock.' }
  }
}
