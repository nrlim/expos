import 'server-only'

import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import type { SessionPayload } from '@/lib/types'

const RAW_SECRET = process.env.SESSION_SECRET
if (!RAW_SECRET) {
  throw new Error('SESSION_SECRET environment variable is not set.')
}
const ENCODED_KEY = new TextEncoder().encode(RAW_SECRET)

const SESSION_COOKIE = 'expos_session'
const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60 // 7 days

// ─── Encrypt / Decrypt ────────────────────────────────────────────────────────

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(ENCODED_KEY)
}

export async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, ENCODED_KEY, {
      algorithms: ['HS256'],
    })
    return payload as SessionPayload
  } catch {
    return null
  }
}

// ─── Create / Update / Delete ─────────────────────────────────────────────────

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await encrypt(payload)
  const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000)
  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

export async function refreshSession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const session = await decrypt(token)
  if (!session) return

  const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000)
  const newToken = await encrypt(session)

  cookieStore.set(SESSION_COOKIE, newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  return decrypt(token)
}

export { SESSION_COOKIE }
