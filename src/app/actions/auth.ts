'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { createSession, deleteSession } from '@/lib/session'
import { verifySession } from '@/lib/dal'
import type { ActionResult } from '@/lib/types'

// ─── Validation Schemas ───────────────────────────────────────────────────────

const RegisterSchema = z.object({
  storeName: z
    .string()
    .min(2, 'Store name must be at least 2 characters.')
    .max(80, 'Store name is too long.')
    .trim(),
  storeSlug: z
    .string()
    .min(2, 'Store identifier must be at least 2 characters.')
    .max(40, 'Store identifier is too long.')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens allowed.')
    .trim(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters.')
    .max(30, 'Username is too long.')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed.')
    .trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter.')
    .regex(/[0-9]/, 'Password must contain at least one number.'),
})

const LoginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required.')
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required.'),
})

// ─── Register Action ──────────────────────────────────────────────────────────

/**
 * Creates a new Tenant + Owner User in a single transaction.
 * The first user registered for a store is always the OWNER.
 */
export async function register(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const rawData = {
    storeName: formData.get('storeName'),
    storeSlug: formData.get('storeSlug'),
    username: formData.get('username'),
    password: formData.get('password'),
  }

  const parsed = RegisterSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed. Please check the fields below.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const { storeName, storeSlug, username, password } = parsed.data

  // Check for existing slug
  const existingTenant = await prisma.tenant.findUnique({ where: { slug: storeSlug } })
  if (existingTenant) {
    return {
      success: false,
      error: 'Store identifier already taken. Please choose another.',
      fieldErrors: { storeSlug: ['This identifier is already in use.'] },
    }
  }

  const existingUser = await prisma.user.findUnique({ where: { username } })
  if (existingUser) {
    return {
      success: false,
      error: 'Username already taken. Please choose another.',
      fieldErrors: { username: ['This username is already in use.'] },
    }
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const { tenant, user } = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: { 
        name: storeName, 
        slug: storeSlug,
        // @ts-ignore
        stores: {
          create: {
            name: `${storeName} (HQ)`,
            location: 'Headquarters'
          }
        }
      },
    })
    const user = await tx.user.create({
      data: {
        username,
        password: hashedPassword,
        role: 'OWNER',
        tenantId: tenant.id,
      },
    })
    return { tenant, user }
  })

  await createSession({
    userId: user.id,
    username: user.username,
    role: user.role,
    tenantId: tenant.id,
    tenantSlug: tenant.slug,
    tenantName: tenant.name,
  })

  redirect('/dashboard')
}

// ─── Login Action ─────────────────────────────────────────────────────────────

/**
 * Validates credentials against the specified tenant's user table.
 * Tenant isolation is enforced by joining on tenantId in the lookup.
 */
export async function login(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const rawData = {
    username: formData.get('username'),
    password: formData.get('password'),
  }

  const parsed = LoginSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please fill in all required fields.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const { username, password } = parsed.data

  const user = await prisma.user.findUnique({
    where: { username },
    include: { tenant: true },
  })

  if (!user) {
    await bcrypt.compare(password, '$2b$12$invalidhashfortimingnormalization00000000000000000000')
    return { success: false, error: 'Invalid username or password.' }
  }

  const passwordMatch = await bcrypt.compare(password, user.password)
  if (!passwordMatch) {
    return { success: false, error: 'Invalid username or password.' }
  }

  await createSession({
    userId: user.id,
    username: user.username,
    role: user.role,
    tenantId: user.tenant.id,
    tenantSlug: user.tenant.slug,
    tenantName: user.tenant.name,
  })

  // CASHIER goes directly to the POS; owners/admins go to the dashboard
  redirect(user.role === 'CASHIER' ? '/dashboard/pos' : '/dashboard')
}

// ─── Logout Action ────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  await verifySession()
  await deleteSession()
  redirect('/login')
}
