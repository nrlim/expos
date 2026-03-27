/**
 * PagePlanGate — Server Component
 *
 * Renders a full-page upgrade wall when the tenant's plan does not include
 * the required feature. The nav & sidebar are still visible (children not rendered).
 * Usage: wrap the page's content JSX with this component.
 */
import type { Feature, Plan } from '@/lib/plans'
import { FEATURE_LABELS, PLAN_CONFIG, hasFeature, planLabel, formatPrice } from '@/lib/plans'
import Link from 'next/link'

interface PagePlanGateProps {
  feature: Feature
  plan: Plan
  children: React.ReactNode
}

export function PagePlanGate({ feature, plan, children }: PagePlanGateProps) {
  if (hasFeature(plan, feature)) {
    return <>{children}</>
  }

  const info = FEATURE_LABELS[feature]
  const requiredPlan = info.requiredPlan
  const planInfo = PLAN_CONFIG[requiredPlan]

  return (
    <div className="animate-fade-in flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      {/* Lock icon */}
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-600/10 border border-teal-600/20">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="13" width="20" height="13" rx="2.5" stroke="#0d9488" strokeWidth="1.8"/>
          <path d="M8 13V9C8 6.239 10.686 4 14 4C17.314 4 20 6.239 20 9V13" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round"/>
          <circle cx="14" cy="19.5" r="1.5" fill="#0d9488"/>
          <path d="M14 21V23" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Plan badge */}
      <div className="mb-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-teal-600/30 bg-teal-600/8">
        <span className="text-[10px] font-bold uppercase tracking-widest text-teal-600">
          {planLabel(requiredPlan)} — Fitur Premium
        </span>
      </div>

      {/* Headline */}
      <h1 className="text-2xl font-bold text-foreground mb-2 tracking-tight">
        {info.title}
      </h1>
      <p className="text-sm text-muted-foreground max-w-sm mb-8 leading-relaxed">
        {info.description} Tersedia mulai paket <strong className="text-foreground">{planLabel(requiredPlan)}</strong>.
      </p>

      {/* Current vs Required */}
      <div className="flex items-center gap-3 mb-8 px-5 py-3 rounded-xl border border-border bg-card w-full max-w-xs">
        <div className="flex-1 text-center">
          <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Paket Anda</div>
          <div className="text-sm font-bold text-foreground">{planLabel(plan)}</div>
        </div>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 text-muted-foreground">
          <path d="M6 10H14M14 10L11 7M14 10L11 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div className="flex-1 text-center">
          <div className="text-[9px] font-bold uppercase tracking-wider text-teal-600 mb-0.5">Diperlukan</div>
          <div className="text-sm font-bold text-teal-600">{planLabel(requiredPlan)}</div>
        </div>
      </div>

      {/* What's included */}
      <div className="mb-8 w-full max-w-sm text-left">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Yang Anda dapatkan di {planLabel(requiredPlan)}:
        </p>
        <ul className="flex flex-col gap-2">
          {planInfo.features.slice(0, 5).map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-xs text-foreground">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                <circle cx="7" cy="7" r="6.5" fill="#0d9488" fillOpacity="0.12" stroke="#0d9488" strokeOpacity="0.4" strokeWidth="0.8"/>
                <path d="M4.5 7L6 8.5L9.5 5" stroke="#0d9488" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {FEATURE_LABELS[f].title}
            </li>
          ))}
        </ul>
      </div>

      {/* Price + CTA */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <div className="flex items-baseline gap-2 justify-center px-4 py-3 rounded-lg bg-teal-600/5 border border-teal-600/15">
          <span className="text-xl font-bold text-foreground">{formatPrice(requiredPlan)}</span>
          <span className="text-xs text-muted-foreground">/ bulan</span>
          <span className="ml-auto text-[10px] font-semibold text-teal-600 bg-teal-600/10 px-2 py-0.5 rounded-full">
            14 hari gratis
          </span>
        </div>

        <Link
          href="/#harga"
          className="flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition-all duration-200 shadow-md shadow-teal-600/20 hover:-translate-y-0.5"
        >
          Upgrade ke {planLabel(requiredPlan)}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 7H11M11 7L8.5 4.5M11 7L8.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>

        <Link
          href="/dashboard"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center py-1"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  )
}
