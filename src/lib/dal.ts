import 'server-only'

import { cache } from 'react'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import type { SessionPayload } from '@/lib/types'

// ─── Session Verification ─────────────────────────────────────────────────────

/**
 * Verifies the JWT session cookie. Redirects to /login if invalid or absent.
 * Memoized with React.cache() — safe to call multiple times in one render pass.
 */
export const verifySession = cache(async (): Promise<SessionPayload> => {
  const session = await getSession()
  if (!session?.userId) redirect('/login')
  return session
})

/**
 * Like verifySession but does NOT redirect — returns null if unauthenticated.
 * Used in layouts that need to be partially visible for unauthenticated users.
 */
export const getOptionalSession = cache(async (): Promise<SessionPayload | null> => {
  return getSession()
})

// ─── Current User ─────────────────────────────────────────────────────────────

/**
 * Returns the full user record from the database for the current session.
 * Tenant-scoped: only fetches if userId matches the session tenantId.
 */
export const getCurrentUser = cache(async () => {
  const session = await verifySession()

  const user = await prisma.user.findFirst({
    where: {
      id: session.userId,
      tenantId: session.tenantId, // strict tenant isolation
    },
    select: {
      id: true,
      username: true,
      role: true,
      tenantId: true,
      createdAt: true,
      tenant: {
        select: { id: true, name: true, slug: true },
      },
    },
  })

  if (!user) redirect('/login')
  return user
})

// ─── Tenant Isolation Helper ──────────────────────────────────────────────────

/**
 * Asserts the session belongs to the requested tenant.
 * Call at the start of every API Route Handler or Server Action.
 */
export async function assertTenantAccess(tenantId: string): Promise<SessionPayload> {
  const session = await verifySession()
  if (session.tenantId !== tenantId) {
    redirect('/403')
  }
  return session
}

/**
 * Returns the tenantId from the verified session.
 * Convenience wrapper for route handlers.
 */
export async function getVerifiedTenantId(): Promise<string> {
  const session = await verifySession()
  return session.tenantId
}
