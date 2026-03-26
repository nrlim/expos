'use server'

import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const StoreSchema = z.object({
  name: z.string().min(1, 'Store name is required').trim(),
  location: z.string().optional().nullable(),
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

  const { name, location } = parsed.data

  try {
    const existing = await prisma.store.findFirst({
      where: { name, tenantId: session.tenantId }
    })
    if (existing) {
      return { success: false, error: 'A store with this name already exists' }
    }

    await prisma.store.create({
      data: {
        name,
        location,
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
  })

  if (!parsed.success) {
    return { success: false, error: 'Invalid store details' }
  }

  const { name, location } = parsed.data

  try {
    const collision = await prisma.store.findFirst({
      where: { name, tenantId: session.tenantId, NOT: { id } }
    })
    if (collision) {
      return { success: false, error: 'Another store with this name already exists' }
    }

    await prisma.store.update({
      where: { id, tenantId: session.tenantId },
      data: { name, location },
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
