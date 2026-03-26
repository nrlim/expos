import type { JWTPayload } from 'jose'

// ─── Session ──────────────────────────────────────────────────────────────────

export interface SessionPayload extends JWTPayload {
  userId: string
  username: string
  role: 'OWNER' | 'ADMIN' | 'CASHIER'
  tenantId: string
  tenantSlug: string
  tenantName: string
}

// ─── Form States ──────────────────────────────────────────────────────────────

export type ActionResult =
  | { success: true; redirectTo?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

// ─── API Response Shape ───────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  meta?: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}
