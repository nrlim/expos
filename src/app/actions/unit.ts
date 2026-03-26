'use server'

import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const UnitSchema = z.object({
  name: z.string().min(1, 'Unit name is required').trim(),
  shortName: z.string().min(1, 'Short name is required').trim(),
})

export async function createUnit(formData: FormData) {
  const session = await verifySession()
  const name = formData.get('name')
  const shortName = formData.get('shortName')

  const parsed = UnitSchema.safeParse({ name, shortName })
  if (!parsed.success) {
    return { success: false, error: 'Invalid input data' }
  }

  const { name: unitName, shortName: unitShortName } = parsed.data

  try {
    const existing = await prisma.unit.findFirst({
      where: {
        name: unitName,
        tenantId: session.tenantId,
      }
    })

    if (existing) {
      return { success: false, error: 'A unit with this name already exists.' }
    }

    await prisma.unit.create({
      data: {
        name: unitName,
        shortName: unitShortName,
        tenantId: session.tenantId,
      }
    })

    revalidatePath('/dashboard/units')
    revalidatePath('/dashboard/products/new')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to create unit.' }
  }
}

export async function deleteUnit(id: string) {
  const session = await verifySession()

  try {
    const unit = await prisma.unit.findFirst({
      where: { id, tenantId: session.tenantId },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    if (!unit) return { success: false, error: 'Unit not found.' }

    if (unit._count.products > 0) {
      return { success: false, error: 'Cannot delete unit linked to active products.' }
    }

    await prisma.unit.delete({
      where: { id, tenantId: session.tenantId }
    })

    revalidatePath('/dashboard/units')
    revalidatePath('/dashboard/products/new')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to delete unit.' }
  }
}

export async function updateUnit(id: string, name: string, shortName: string) {
  const session = await verifySession()

  const parsed = UnitSchema.safeParse({ name, shortName })
  if (!parsed.success) {
    return { success: false, error: 'Invalid input data.' }
  }

  const { name: trimmedName, shortName: trimmedShortName } = parsed.data

  try {
    const target = await prisma.unit.findFirst({
      where: { id, tenantId: session.tenantId }
    })
    if (!target) return { success: false, error: 'Unit not found.' }

    const collision = await prisma.unit.findFirst({
      where: {
        name: trimmedName,
        tenantId: session.tenantId,
        NOT: { id },
      }
    })
    if (collision) {
      return { success: false, error: 'Another unit with this name already exists.' }
    }

    await prisma.unit.update({
      where: { id, tenantId: session.tenantId },
      data: { name: trimmedName, shortName: trimmedShortName },
    })

    revalidatePath('/dashboard/units')
    revalidatePath('/dashboard/products/new')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to update unit.' }
  }
}
