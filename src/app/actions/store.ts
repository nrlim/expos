'use server'

import { verifySession } from '@/lib/dal'
import { getTenantPlan } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { canAddStore, PLAN_CONFIG, planLabel } from '@/lib/plans'

const StoreSchema = z.object({
  name: z.string().min(1, 'Store name is required').trim(),
  location: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
})

export async function createStore(formData: FormData) {
  const session = await verifySession()
  if (session.role !== 'OWNER') return { success: false, error: 'Only owners can manage stores' }

  const parsed = StoreSchema.safeParse({
    name: formData.get('name'),
    location: formData.get('location'),
  })

  if (!parsed.success) {
    return { success: false, error: 'Invalid store details' }
  }

  const { name, location, phone } = parsed.data

  try {
    // ── Plan limit check ───────────────────────────────────────────────────────
    const plan = await getTenantPlan(session.tenantId)
    const currentCount = await prisma.store.count({ where: { tenantId: session.tenantId } })

    if (!canAddStore(plan, currentCount)) {
      const max = PLAN_CONFIG[plan].maxStores
      const nextPlan = plan === 'STARTER' ? 'BUSINESS' : 'ENTERPRISE'
      return {
        success: false,
        error: `Batas maksimum ${max} store untuk paket ${planLabel(plan)} telah tercapai. Upgrade ke ${planLabel(nextPlan)} untuk menambah cabang.`,
        limitReached: true,
        currentPlan: plan,
      }
    }

    const existing = await prisma.store.findFirst({
      where: { name, tenantId: session.tenantId }
    })
    if (existing) {
      return { success: false, error: 'A store with this name already exists' }
    }

    // phone/isActive newly added — cast to any until `prisma generate` types refresh
    await (prisma.store as any).create({
      data: {
        name,
        location,
        phone,
        tenantId: session.tenantId,
      }
    })

    revalidatePath('/dashboard/settings/stores')
    revalidatePath('/dashboard/products/new')
    revalidatePath('/dashboard/products')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to create store' }
  }
}

export async function updateStore(id: string, formData: FormData) {
  const session = await verifySession()
  if (session.role !== 'OWNER') return { success: false, error: 'Only owners can manage stores' }

  const parsed = StoreSchema.safeParse({
    name: formData.get('name'),
    location: formData.get('location'),
    phone: formData.get('phone'),
  })

  if (!parsed.success) {
    return { success: false, error: 'Invalid store details' }
  }

  const { name, location, phone } = parsed.data

  try {
    const collision = await prisma.store.findFirst({
      where: { name, tenantId: session.tenantId, NOT: { id } }
    })
    if (collision) {
      return { success: false, error: 'Another store with this name already exists' }
    }

    await (prisma.store as any).update({
      where: { id, tenantId: session.tenantId },
      data: { name, location, phone },
    })

    revalidatePath('/dashboard/settings/stores')
    revalidatePath('/dashboard/products/new')
    revalidatePath('/dashboard/products')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to update store' }
  }
}

export async function deleteStore(id: string) {
  const session = await verifySession()
  if (session.role !== 'OWNER') return { success: false, error: 'Only owners can manage stores' }

  try {
    // We rely on Prisma Cascade to handle deleting inventories related to this store
    await prisma.store.delete({
      where: { id, tenantId: session.tenantId }
    })

    revalidatePath('/dashboard/settings/stores')
    revalidatePath('/dashboard/products/new')
    revalidatePath('/dashboard/products')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to delete store (it may have related data)' }
  }
}

export async function toggleStoreActive(id: string, isActive: boolean) {
  const session = await verifySession()
  if (session.role !== 'OWNER') return { success: false, error: 'Only owners can manage stores' }

  try {
    await (prisma.store as any).update({
      where: { id, tenantId: session.tenantId },
      data: { isActive },
    })
    revalidatePath('/dashboard/settings/stores')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to toggle store status' }
  }
}
