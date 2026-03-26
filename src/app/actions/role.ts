'use server'

import { z } from 'zod'
import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const CreateRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  permissions: z.string() // JSON string representation of string[]
})

export async function createCustomRole(payload: FormData) {
  try {
    const session = await verifySession()
    if (session.role === 'CASHIER' || session.role === 'CUSTOM') {
      return { success: false, error: 'Unauthorized.' }
    }

    const data = Object.fromEntries(payload.entries())
    const parsed = CreateRoleSchema.safeParse(data)
    if (!parsed.success) return { success: false, error: 'Invalid data' }

    const { name, permissions } = parsed.data

    await prisma.customRole.create({
      data: {
        name,
        permissions,
        tenantId: session.tenantId,
      }
    })

    revalidatePath('/dashboard/users/roles')
    return { success: true }
  } catch (error: any) {
    if (error?.code === 'P2002') return { success: false, error: 'Role name already exists.' }
    return { success: false, error: 'Failed to create role.' }
  }
}

export async function updateCustomRole(id: string, name: string, permissions: string) {
  try {
    const session = await verifySession()
    if (session.role === 'CASHIER' || session.role === 'CUSTOM') {
      return { success: false, error: 'Unauthorized.' }
    }

    await prisma.customRole.update({
      where: { id },
      data: { name, permissions }
    })

    revalidatePath('/dashboard/users/roles')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to update role.' }
  }
}

export async function deleteCustomRole(id: string) {
  try {
    const session = await verifySession()
    if (session.role === 'CASHIER' || session.role === 'CUSTOM') {
      return { success: false, error: 'Unauthorized.' }
    }

    // Move any users back to a default role conceptually (handled by SetNull + app logic)
    // Actually the Prisma schema sets onDelete: SetNull for customRoleId, 
    // so users with this role will fall back to their system `role` enum (CASHIER generally).
    await prisma.customRole.delete({
      where: { id, tenantId: session.tenantId }
    })

    revalidatePath('/dashboard/users/roles')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to delete role.' }
  }
}
