'use server'

import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const WarrantySchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  duration: z.coerce.number().min(0, 'Duration must be positive'),
  durationUnit: z.enum(['Days', 'Months', 'Years']),
  description: z.string().optional(),
})

export async function createWarranty(formData: FormData) {
  const session = await verifySession()
  
  const parsed = WarrantySchema.safeParse({
    name: formData.get('name'),
    duration: formData.get('duration'),
    durationUnit: formData.get('durationUnit'),
    description: formData.get('description'),
  })

  if (!parsed.success) {
    return { success: false, error: 'Invalid input data' }
  }

  try {
    const existing = await prisma.warranty.findFirst({
      where: {
        name: parsed.data.name,
        tenantId: session.tenantId,
      }
    })

    if (existing) {
      return { success: false, error: 'A warranty with this name already exists.' }
    }

    await prisma.warranty.create({
      data: {
        ...parsed.data,
        tenantId: session.tenantId,
      }
    })

    revalidatePath('/dashboard/warranties')
    revalidatePath('/dashboard/products/new')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to create warranty.' }
  }
}

export async function deleteWarranty(id: string) {
  const session = await verifySession()

  try {
    const warranty = await prisma.warranty.findFirst({
      where: { id, tenantId: session.tenantId },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    if (!warranty) return { success: false, error: 'Warranty not found.' }

    // If you want to restrict deletion when linked to active products
    // (User instructions just asked for simple CRUD but restriction is good practice)
    // if (warranty._count.products > 0) {
    //  return { success: false, error: 'Cannot delete warranty linked to active products.' }
    // }

    await prisma.warranty.delete({
      where: { id, tenantId: session.tenantId }
    })

    revalidatePath('/dashboard/warranties')
    revalidatePath('/dashboard/products/new')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to delete warranty.' }
  }
}

export async function updateWarranty(id: string, data: { name: string, duration: number, durationUnit: string, description?: string }) {
  const session = await verifySession()

  const parsed = WarrantySchema.safeParse(data)
  if (!parsed.success) return { success: false, error: 'Invalid input data.' }

  try {
    const target = await prisma.warranty.findFirst({
      where: { id, tenantId: session.tenantId }
    })
    if (!target) return { success: false, error: 'Warranty not found.' }

    const collision = await prisma.warranty.findFirst({
      where: { name: parsed.data.name, tenantId: session.tenantId, NOT: { id } }
    })
    if (collision) return { success: false, error: 'Another warranty with this name already exists.' }

    await prisma.warranty.update({
      where: { id, tenantId: session.tenantId },
      data: parsed.data,
    })

    revalidatePath('/dashboard/warranties')
    revalidatePath('/dashboard/products/new')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to update warranty.' }
  }
}
