'use client'

import { useState } from 'react'
import type { Feature, Plan } from '@/lib/plans'
import { FEATURE_LABELS, PLAN_CONFIG, formatPrice, planLabel } from '@/lib/plans'
import Link from 'next/link'

// ─── Lock Badge (inline, for nav items) ──────────────────────────────────────

export function PlanLockBadge({ requiredPlan }: { requiredPlan: Plan }) {
  return (
    <span
      title={`Tersedia di paket ${planLabel(requiredPlan)}`}
      className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[8px] font-bold uppercase tracking-wider border border-teal-600/30 bg-teal-600/10 text-teal-600"
    >
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="3.5" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="0.8"/>
        <path d="M2.5 3.5V2.5C2.5 1.67 3.17 1 4 1C4.83 1 5.5 1.67 5.5 2.5V3.5" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
      </svg>
      {planLabel(requiredPlan)}
    </span>
  )
}

// ─── Upgrade Modal ────────────────────────────────────────────────────────────

interface UpgradeModalProps {
  feature: Feature
  currentPlan: Plan
  onClose: () => void
}

function UpgradeModal({ feature, currentPlan, onClose }: UpgradeModalProps) {
  const info = FEATURE_LABELS[feature]
  const requiredPlan = info.requiredPlan
  const planInfo = PLAN_CONFIG[requiredPlan]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card shadow-2xl">
        {/* Top teal accent */}
        <div className="h-1 w-full rounded-t-xl bg-teal-600" />

        <div className="p-6">
          {/* Icon + header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-600/10">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="8.5" width="12" height="8" rx="1.5" stroke="#0d9488" strokeWidth="1.3"/>
                  <path d="M5.5 8.5V6C5.5 4.343 7.067 3 9 3C10.933 3 12.5 4.343 12.5 6V8.5" stroke="#0d9488" strokeWidth="1.3" strokeLinecap="round"/>
                  <circle cx="9" cy="12.5" r="1" fill="#0d9488"/>
                </svg>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-0.5">
                  Fitur Premium
                </div>
                <h2 id="upgrade-modal-title" className="text-sm font-bold text-foreground">
                  {info.title}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
              aria-label="Tutup"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground leading-relaxed mb-5">
            {info.description}
          </p>

          {/* Plan comparison strip */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border mb-5">
            <div className="flex-1 text-center">
              <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Paket Anda</div>
              <div className="text-xs font-bold text-foreground mt-0.5">{planLabel(currentPlan)}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-muted-foreground">
              <path d="M5 8H11M11 8L8.5 5.5M11 8L8.5 10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="flex-1 text-center">
              <div className="text-[9px] font-bold uppercase tracking-wider text-teal-600">Diperlukan</div>
              <div className="text-xs font-bold text-teal-600 mt-0.5">{planLabel(requiredPlan)}</div>
            </div>
          </div>

          {/* Included features in the required plan */}
          <div className="mb-5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Yang Anda dapatkan di paket {planLabel(requiredPlan)}:
            </div>
            <ul className="flex flex-col gap-1.5">
              {planInfo.features.slice(0, 4).map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-foreground">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                    <circle cx="5" cy="5" r="4.5" fill="#0d9488" fillOpacity="0.12" stroke="#0d9488" strokeOpacity="0.4" strokeWidth="0.8"/>
                    <path d="M3 5L4.2 6.2L7 3.5" stroke="#0d9488" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {FEATURE_LABELS[f].title}
                </li>
              ))}
            </ul>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 mb-5 px-3 py-2.5 rounded-lg bg-teal-600/5 border border-teal-600/15">
            <span className="text-lg font-bold text-foreground">{formatPrice(requiredPlan)}</span>
            <span className="text-xs text-muted-foreground">per bulan</span>
            <span className="ml-auto text-[10px] font-semibold text-teal-600">14 hari gratis</span>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Link
              href="/#harga"
              className="flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition-colors shadow-md shadow-teal-600/20"
              onClick={onClose}
            >
              Upgrade ke {planLabel(requiredPlan)}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.5 6H9.5M9.5 6L7 3.5M9.5 6L7 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <button
              onClick={onClose}
              className="py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Lanjutkan dengan paket saat ini
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── PlanGuard ────────────────────────────────────────────────────────────────

/**
 * Wraps a feature with plan-gating logic.
 * 
 * If `allowed` is false, renders a locked overlay over the content.
 * If `mode="replace"`, renders nothing but a trigger button (for sidebar items etc).
 * 
 * @example
 * <PlanGuard feature="advanced_analytics" allowed={hasFeature(plan, 'advanced_analytics')} currentPlan={plan}>
 *   <AnalyticsPanel />
 * </PlanGuard>
 */
interface PlanGuardProps {
  feature: Feature
  allowed: boolean
  currentPlan: Plan
  children: React.ReactNode
  /** 'overlay' = grey-out + lock overlay (default). 'hide' = completely hidden. */
  mode?: 'overlay' | 'hide'
}

export function PlanGuard({ feature, allowed, currentPlan, children, mode = 'overlay' }: PlanGuardProps) {
  const [showModal, setShowModal] = useState(false)

  if (allowed) return <>{children}</>

  if (mode === 'hide') return null

  return (
    <>
      <div className="relative select-none">
        {/* Blurred content */}
        <div className="opacity-30 pointer-events-none blur-[2px]" aria-hidden="true">
          {children}
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg bg-background/60 backdrop-blur-[1px]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600/10 border border-teal-600/20">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2.5" y="7.5" width="11" height="7" rx="1.5" stroke="#0d9488" strokeWidth="1.2"/>
              <path d="M5 7.5V5C5 3.343 6.343 2 8 2C9.657 2 11 3.343 11 5V7.5" stroke="#0d9488" strokeWidth="1.2" strokeLinecap="round"/>
              <circle cx="8" cy="11" r="1" fill="#0d9488"/>
            </svg>
          </div>
          <div className="text-center px-4">
            <p className="text-xs font-bold text-foreground">{FEATURE_LABELS[feature].title}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Tersedia di paket {planLabel(FEATURE_LABELS[feature].requiredPlan)}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="text-[11px] font-semibold text-teal-600 hover:text-teal-500 underline underline-offset-2 transition-colors"
          >
            Lihat detail upgrade
          </button>
        </div>
      </div>

      {showModal && (
        <UpgradeModal
          feature={feature}
          currentPlan={currentPlan}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}

// ─── Plan Limit Banner ────────────────────────────────────────────────────────

/**
 * Inline banner shown when a resource limit is approached or reached.
 * Use in list pages (stores, users) to proactively surface the plan gate.
 */
interface PlanLimitBannerProps {
  feature: Feature
  currentPlan: Plan
  current: number
  max: number
}

export function PlanLimitBanner({ feature, currentPlan, current, max }: PlanLimitBannerProps) {
  const [showModal, setShowModal] = useState(false)
  const isAtLimit = current >= max
  const isNearLimit = !isAtLimit && current >= max - 1

  if (!isAtLimit && !isNearLimit) return null

  const entity = feature === 'multi_store' ? 'store' : 'user'

  return (
    <>
      <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border text-xs ${
        isAtLimit
          ? 'bg-destructive/5 border-destructive/20 text-destructive'
          : 'bg-warning/5 border-warning/20 text-warning'
      }`}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
          {isAtLimit ? (
            <>
              <rect x="2.5" y="6" width="9" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.1"/>
              <path d="M4.5 6V4C4.5 2.895 5.62 2 7 2C8.38 2 9.5 2.895 9.5 4V6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
              <circle cx="7" cy="9.25" r="0.8" fill="currentColor"/>
            </>
          ) : (
            <>
              <path d="M7 2.5L12.5 12H1.5L7 2.5Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
              <path d="M7 6V8.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
              <circle cx="7" cy="10.5" r="0.6" fill="currentColor"/>
            </>
          )}
        </svg>
        <span className="flex-1">
          {isAtLimit
            ? `Batas maksimum ${max} ${entity} untuk paket ${planLabel(currentPlan)} telah tercapai.`
            : `Anda menggunakan ${current} dari ${max} ${entity} yang tersedia di paket ${planLabel(currentPlan)}.`}
        </span>
        <button
          onClick={() => setShowModal(true)}
          className="font-bold underline underline-offset-2 hover:opacity-80 transition-opacity shrink-0"
        >
          Upgrade
        </button>
      </div>

      {showModal && (
        <UpgradeModal
          feature={feature}
          currentPlan={currentPlan}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
