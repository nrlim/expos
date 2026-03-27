'use server'

import { verifySession, getTenantPlan } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { hasFeature } from '@/lib/plans'
import { z } from 'zod'

const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'READY', 'COMPLETED', 'CANCELLED'] as const
type OrderStatus = typeof ORDER_STATUSES[number]

const UpdateStatusSchema = z.object({
  transactionId: z.string().min(1),
  status: z.enum(ORDER_STATUSES),
  note: z.string().optional(),
})

/**
 * Updates the orderStatus of a transaction and logs the change.
 * Requires ENTERPRISE plan (order_tracking feature).
 */
export async function updateOrderStatus(formData: FormData) {
  const session = await verifySession()

  // Feature gate — Enterprise only
  const plan = await getTenantPlan(session.tenantId)
  if (!hasFeature(plan, 'order_tracking')) {
    return { success: false, error: 'Fitur Order Tracking memerlukan paket Enterprise.' }
  }

  const parsed = UpdateStatusSchema.safeParse({
    transactionId: formData.get('transactionId'),
    status: formData.get('status'),
    note: formData.get('note'),
  })

  if (!parsed.success) {
    return { success: false, error: 'Data tidak valid.' }
  }

  const { transactionId, status, note } = parsed.data

  try {
    // Ensure transaction belongs to this tenant
    const tx = await prisma.transaction.findFirst({
      where: { id: transactionId, tenantId: session.tenantId },
    })
    if (!tx) return { success: false, error: 'Transaksi tidak ditemukan.' }

    // Run both updates in a transaction
    await prisma.$transaction([
      // @ts-ignore - orderStatus field newly added, types pending prisma generate
      prisma.transaction.update({
        where: { id: transactionId },
        data: { orderStatus: status },
      }),
      // @ts-ignore - OrderLog model newly added
      prisma.orderLog.create({
        data: {
          transactionId,
          status,
          note: note || null,
          changedById: session.userId,
        },
      }),
    ])

    revalidatePath('/dashboard/order-monitor')
    return { success: true }
  } catch {
    return { success: false, error: 'Gagal memperbarui status pesanan.' }
  }
}

/**
 * Fetches all active (non-completed) orders for the monitor view.
 * Includes items, store, and recent log entries.
 */
export async function getActiveOrders(tenantId: string) {
  // @ts-ignore - orderStatus field newly added
  return prisma.transaction.findMany({
    where: {
      tenantId,
      type: 'SALE',
      orderStatus: { notIn: ['COMPLETED', 'CANCELLED'] },
    },
    orderBy: { createdAt: 'asc' },
    include: {
      store: { select: { id: true, name: true } },
      user: { select: { id: true, username: true } },
      items: {
        include: {
          product: { select: { name: true } },
        },
      },
      // @ts-ignore
      orderLogs: {
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { changedBy: { select: { username: true } } },
      },
    },
  })
}
