/**
 * @file plans.ts
 * Plan feature definitions and access utilities for ex-POS subscription gating.
 * This is the single source of truth — never duplicate plan logic elsewhere.
 */

export type Plan = 'STARTER' | 'BUSINESS' | 'ENTERPRISE'

export type Feature =
  | 'multi_store'        // More than 1 store
  | 'multi_user'         // Admin/Cashier role management
  | 'advanced_analytics' // HPP, Laba Bersih, & Advanced Reports
  | 'global_catalog'     // Global product catalog across stores
  | 'custom_branding'    // Custom receipt logo & footer
  | 'order_tracking'     // Universal Order Tracking (OMS)
  | 'api_access'         // REST API access
  | 'export_pro'         // Excel / PDF export

// ─── Plan Definitions ─────────────────────────────────────────────────────────

export interface PlanConfig {
  name: string
  label: string
  maxStores: number          // null = unlimited
  maxUsers: number           // null = unlimited
  monthlyPrice: number       // IDR
  features: Feature[]
  description: string
}

export const PLAN_CONFIG: Record<Plan, PlanConfig> = {
  STARTER: {
    name: 'STARTER',
    label: 'Starter',
    maxStores: 1,
    maxUsers: 3,
    monthlyPrice: 299000,
    description: 'Ideal untuk usaha tunggal yang baru memulai.',
    features: [],
  },
  BUSINESS: {
    name: 'BUSINESS',
    label: 'Business',
    maxStores: 3,
    maxUsers: 10,
    monthlyPrice: 599000,
    description: 'Untuk bisnis yang tumbuh dengan beberapa cabang.',
    features: [
      'multi_store',
      'multi_user',
      'advanced_analytics',
      'global_catalog',
      'custom_branding',
    ],
  },
  ENTERPRISE: {
    name: 'ENTERPRISE',
    label: 'Enterprise',
    maxStores: Infinity,
    maxUsers: Infinity,
    monthlyPrice: 1299000,
    description: 'Skalabilitas penuh untuk jaringan bisnis besar.',
    features: [
      'multi_store',
      'multi_user',
      'advanced_analytics',
      'global_catalog',
      'custom_branding',
      'order_tracking',
      'api_access',
      'export_pro',
    ],
  },
}

// ─── Feature Labels (for UI display) ─────────────────────────────────────────

export const FEATURE_LABELS: Record<Feature, { title: string; description: string; requiredPlan: Plan }> = {
  multi_store: {
    title: 'Multi-Store Management',
    description: 'Kelola lebih dari 1 cabang dalam satu dashboard.',
    requiredPlan: 'BUSINESS',
  },
  multi_user: {
    title: 'Multi-User Roles',
    description: 'Tambahkan Admin, Manager, dan Kasir dengan izin terpisah.',
    requiredPlan: 'BUSINESS',
  },
  advanced_analytics: {
    title: 'Analitik Lanjut & Laporan',
    description: 'Akses laporan Produk, Metode Pembayaran, HPP, & Laba Bersih.',
    requiredPlan: 'BUSINESS',
  },
  global_catalog: {
    title: 'Global Catalog Management',
    description: 'Sinkronisasi produk ke semua cabang secara terpusat.',
    requiredPlan: 'BUSINESS',
  },
  custom_branding: {
    title: 'Custom Receipt & Branding',
    description: 'Logo, nama, dan footer bisnis di setiap struk.',
    requiredPlan: 'BUSINESS',
  },
  order_tracking: {
    title: 'Universal Order Tracking',
    description: 'Monitor proses produksi dari Dapur, Laundry, hingga Teknisi.',
    requiredPlan: 'ENTERPRISE',
  },
  api_access: {
    title: 'API Access',
    description: 'Integrasikan ex-POS ke sistem eksternal via REST API.',
    requiredPlan: 'ENTERPRISE',
  },
  export_pro: {
    title: 'Pro Data Export',
    description: 'Ekspor laporan ke format Excel dan PDF.',
    requiredPlan: 'ENTERPRISE',
  },
}

// ─── Access Checkers ──────────────────────────────────────────────────────────

/**
 * Returns true if the given plan includes the requested feature.
 */
export function hasFeature(plan: Plan, feature: Feature): boolean {
  return PLAN_CONFIG[plan].features.includes(feature)
}

/**
 * Returns true if the plan allows adding at least one more store.
 */
export function canAddStore(plan: Plan, currentStoreCount: number): boolean {
  const max = PLAN_CONFIG[plan].maxStores
  return currentStoreCount < max
}

/**
 * Returns true if the plan allows adding at least one more user.
 */
export function canAddUser(plan: Plan, currentUserCount: number): boolean {
  const max = PLAN_CONFIG[plan].maxUsers
  return currentUserCount < max
}

/**
 * Returns the minimum plan required to unlock a feature.
 * Used to display "Upgrade to X" messaging in the UI.
 */
export function requiredPlanForFeature(feature: Feature): Plan {
  return FEATURE_LABELS[feature].requiredPlan
}

/** Convenience: plan display label */
export function planLabel(plan: Plan): string {
  return PLAN_CONFIG[plan].label
}

export function formatPrice(plan: Plan): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(PLAN_CONFIG[plan].monthlyPrice)
}
