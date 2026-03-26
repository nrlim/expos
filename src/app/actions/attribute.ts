'use server'

import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const AttributeSchema = z.object({
  name: z.string().min(1, 'Attribute name is required').trim(),
})
const ValueSchema = z.object({
  value: z.string().min(1, 'Value is required').trim(),
})

// ─── Attribute  ─────────────────────────────────

export async function createAttribute(formData: FormData) {
  const session = await verifySession()
  const name = formData.get('name')

  const parsed = AttributeSchema.safeParse({ name })
  if (!parsed.success) {
    return { success: false, error: 'Invalid input data' }
  }

  const { name: trimmedName } = parsed.data

  try {
    const existing = await prisma.attribute.findFirst({
      where: { name: trimmedName, tenantId: session.tenantId }
    })
    if (existing) {
      return { success: false, error: 'An attribute with this name already exists.' }
    }

    await prisma.attribute.create({
      data: {
        name: trimmedName,
        tenantId: session.tenantId,
      }
    })

    revalidatePath('/dashboard/attributes')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to create attribute.' }
  }
}

export async function deleteAttribute(id: string) {
  const session = await verifySession()

  try {
    const attr = await prisma.attribute.findFirst({
      where: { id, tenantId: session.tenantId }
    })
    if (!attr) return { success: false, error: 'Attribute not found.' }

    await prisma.attribute.delete({
      where: { id, tenantId: session.tenantId }
    })

    revalidatePath('/dashboard/attributes')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to delete attribute.' }
  }
}

export async function updateAttribute(id: string, name: string) {
  const session = await verifySession()

  const parsed = AttributeSchema.safeParse({ name })
  if (!parsed.success) return { success: false, error: 'Invalid input data.' }

  const { name: trimmedName } = parsed.data

  try {
    const attr = await prisma.attribute.findFirst({
      where: { id, tenantId: session.tenantId }
    })
    if (!attr) return { success: false, error: 'Attribute not found.' }

    const collision = await prisma.attribute.findFirst({
      where: { name: trimmedName, tenantId: session.tenantId, NOT: { id } }
    })
    if (collision) return { success: false, error: 'Another attribute with this name already exists.' }

    await prisma.attribute.update({
      where: { id, tenantId: session.tenantId },
      data: { name: trimmedName }
    })

    revalidatePath('/dashboard/attributes')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to update attribute.' }
  }
}

// ─── Attribute Values ─────────────────────────────────

export async function createAttributeValue(attributeId: string, formData: FormData) {
  const session = await verifySession()
  const value = formData.get('value')

  const parsed = ValueSchema.safeParse({ value })
  if (!parsed.success) return { success: false, error: 'Invalid value.' }

  const { value: trimmedValue } = parsed.data

  try {
    const attr = await prisma.attribute.findFirst({
      where: { id: attributeId, tenantId: session.tenantId }
    })
    if (!attr) return { success: false, error: 'Attribute not found.' }

    const existing = await prisma.attributeValue.findFirst({
      where: { value: trimmedValue, attributeId }
    })
    if (existing) return { success: false, error: 'This value already exists for this attribute.' }

    await prisma.attributeValue.create({
      data: {
        value: trimmedValue,
        attributeId,
      }
    })

    revalidatePath('/dashboard/attributes')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to create value.' }
  }
}

export async function deleteAttributeValue(id: string) {
  const session = await verifySession()

  try {
    const val = await prisma.attributeValue.findFirst({
      where: { id },
      include: { attribute: true }
    })
    if (!val || val.attribute.tenantId !== session.tenantId) {
      return { success: false, error: 'Value not found.' }
    }

    await prisma.attributeValue.delete({
      where: { id, attribute: { tenantId: session.tenantId } }
    })

    revalidatePath('/dashboard/attributes')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to delete value.' }
  }
}

export async function updateAttributeValue(id: string, value: string) {
  const session = await verifySession()

  const parsed = ValueSchema.safeParse({ value })
  if (!parsed.success) return { success: false, error: 'Invalid value.' }
  const { value: trimmedValue } = parsed.data

  try {
    const val = await prisma.attributeValue.findFirst({
      where: { id },
      include: { attribute: true }
    })
    if (!val || val.attribute.tenantId !== session.tenantId) {
      return { success: false, error: 'Value not found.' }
    }

    const collision = await prisma.attributeValue.findFirst({
      where: { value: trimmedValue, attributeId: val.attributeId, NOT: { id } }
    })
    if (collision) return { success: false, error: 'This value already exists.' }

    await prisma.attributeValue.update({
      where: { id, attribute: { tenantId: session.tenantId } },
      data: { value: trimmedValue }
    })

    revalidatePath('/dashboard/attributes')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to update value.' }
  }
}
