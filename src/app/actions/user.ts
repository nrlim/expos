'use server'

import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const UserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').trim(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  role: z.enum(['OWNER', 'ADMIN', 'CASHIER', 'CUSTOM']),
  customRoleId: z.string().optional()
})

export async function createUser(formData: FormData) {
  const session = await verifySession()
  if (session.role === 'CASHIER') return { success: false, error: 'Unauthorized' }

  const parsed = UserSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
    role: formData.get('role'),
    customRoleId: formData.get('customRoleId'),
  })

  if (!parsed.success) {
    return { success: false, error: 'Invalid input fields' }
  }

  const { username, password, role, customRoleId } = parsed.data

  // Security Focus: Strict OWNER privilege checks
  if (role === 'OWNER' && session.role !== 'OWNER') {
    return { success: false, error: 'Only owners can create owner accounts' }
  }

  if (!password) {
    return { success: false, error: 'Password is required to create a user' }
  }

  try {
    const existing = await prisma.user.findFirst({
      where: { username, tenantId: session.tenantId }
    })
    if (existing) {
      return { success: false, error: 'Username is already taken' }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role,
        customRoleId: role === 'CUSTOM' ? (customRoleId || null) : null,
        tenantId: session.tenantId,
      }
    })

    revalidatePath('/dashboard/users')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to create user' }
  }
}

export async function updateUser(id: string, formData: FormData) {
  const session = await verifySession()
  if (session.role === 'CASHIER') return { success: false, error: 'Unauthorized' }

  const parsed = UserSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
    role: formData.get('role'),
    customRoleId: formData.get('customRoleId'),
  })

  if (!parsed.success) {
    return { success: false, error: 'Invalid input fields' }
  }

  const { username, password, role, customRoleId } = parsed.data

  try {
    const target = await prisma.user.findFirst({
      where: { id, tenantId: session.tenantId }
    })
    if (!target) return { success: false, error: 'User not found' }

    // Admins cannot modify existing owner accounts
    if (target.role === 'OWNER' && session.role !== 'OWNER') {
      return { success: false, error: 'Only owners can modify owner accounts' }
    }

    // Admins cannot grant owner role
    if (role === 'OWNER' && session.role !== 'OWNER') {
      return { success: false, error: 'Only owners can grant owner role' }
    }

    const collision = await prisma.user.findFirst({
      where: { username, tenantId: session.tenantId, NOT: { id } }
    })
    if (collision) {
      return { success: false, error: 'Username is already taken' }
    }

    const updateData: any = { 
      username, 
      role, 
      customRoleId: role === 'CUSTOM' ? (customRoleId || null) : null 
    }
    if (password && password.length > 0) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    await prisma.user.update({
      where: { id, tenantId: session.tenantId },
      data: updateData,
    })

    revalidatePath('/dashboard/users')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to update user' }
  }
}

export async function deleteUser(id: string) {
  const session = await verifySession()
  if (session.role === 'CASHIER') return { success: false, error: 'Unauthorized' }

  if (id === session.userId) {
    return { success: false, error: 'You cannot delete yourself' }
  }

  try {
    const target = await prisma.user.findUnique({ where: { id } })
    if (!target) return { success: false, error: 'User not found' }
    if (target.role === 'OWNER' && session.role !== 'OWNER') {
      return { success: false, error: 'Only an owner can delete another owner' }
    }

    await prisma.user.delete({
      where: { id, tenantId: session.tenantId }
    })

    revalidatePath('/dashboard/users')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to delete user' }
  }
}
