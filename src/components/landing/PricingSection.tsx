'use client'

import { useState } from 'react'
import Link from 'next/link'

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 299000,
    yearlyPrice: 249000,
    description: 'Ideal untuk usaha tunggal yang baru memulai digitalisasi operasional.',
    recommended: false,
    features: [
      { label: '1 Store', included: true },
      { label: 'Maks. 3 User', included: true },
      { label: 'Transaksi Tidak Terbatas', included: true },
      { label: 'Inventaris Dasar', included: true },
      { label: 'Sales Overview', included: true },
      { label: 'Role Kustom (Izin Khusus)', included: false },
      { label: 'Analitik Lanjut (HPP & Profit)', included: false },
      { label: 'Global Catalog Management', included: false },
      { label: 'Custom Branding', included: false },
      { label: 'Universal Order Tracking', included: false },
      { label: 'API Access', included: false },
      { label: 'Priority Support', included: false },
    ],
  },
  {
    id: 'business',
    name: 'Business',
    monthlyPrice: 599000,
    yearlyPrice: 499000,
    description: 'Untuk bisnis yang tumbuh dengan beberapa cabang dan tim yang lebih besar.',
    recommended: true,
    features: [
      { label: 'Hingga 3 Store', included: true },
      { label: 'Maks. 10 User', included: true },
      { label: 'Transaksi Tidak Terbatas', included: true },
      { label: 'Inventaris Lanjutan', included: true },
      { label: 'Sales Overview', included: true },
      { label: 'Role Kustom (Izin Khusus)', included: true },
      { label: 'Analitik Lanjut (HPP & Profit)', included: true },
      { label: 'Global Catalog Management', included: true },
      { label: 'Custom Branding', included: true },
      { label: 'Universal Order Tracking', included: false },
      { label: 'API Access', included: false },
      { label: 'Priority Support', included: false },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 1299000,
    yearlyPrice: 1099000,
    description: 'Skalabilitas penuh untuk jaringan bisnis besar dengan kebutuhan integrasi sistem.',
    recommended: false,
    features: [
      { label: 'Store Tidak Terbatas', included: true },
      { label: 'User Tidak Terbatas', included: true },
      { label: 'Transaksi Tidak Terbatas', included: true },
      { label: 'Inventaris Lanjutan', included: true },
      { label: 'Sales Overview', included: true },
      { label: 'Role Kustom (Izin Khusus)', included: true },
      { label: 'Analitik Lanjut (HPP & Profit)', included: true },
      { label: 'Global Catalog Management', included: true },
      { label: 'Custom Branding', included: true },
      { label: 'Universal Order Tracking', included: true },
      { label: 'API Access', included: true },
      { label: 'Priority Support', included: true },
    ],
  },
]

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export default function PricingSection() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')

  return (
    <section id="harga" className="py-24 bg-muted/20 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-600/30 bg-teal-600/8 mb-4">
            <span className="text-[11px] font-semibold text-teal-600 tracking-wider uppercase">
              Paket Berlangganan
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            Harga Transparan, Tanpa Biaya Tersembunyi
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto mb-8">
            Pilih paket yang sesuai dengan skala bisnis Anda. Upgrade atau downgrade kapan saja.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-lg border border-border bg-card">
            <button
              id="billing-monthly"
              onClick={() => setBilling('monthly')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${billing === 'monthly'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Bulanan
            </button>
            <button
              id="billing-yearly"
              onClick={() => setBilling('yearly')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 flex items-center gap-2 ${billing === 'yearly'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Tahunan
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm ${billing === 'yearly' ? 'bg-white/20 text-white' : 'bg-teal-600/10 text-teal-600'
                }`}>
                Hemat 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => {
            const price = billing === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice
            return (
              <div
                key={plan.id}
                id={`plan-${plan.id}`}
                className={`relative flex flex-col rounded-xl border transition-all duration-300 ${plan.recommended
                    ? 'border-teal-600 bg-card shadow-xl shadow-teal-600/10 scale-[1.02]'
                    : 'border-border bg-card hover:border-teal-600/30 hover:shadow-lg'
                  }`}
              >
                {/* Recommended badge */}
                {plan.recommended && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-4 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-teal-600 text-white shadow-md">
                      Direkomendasikan
                    </span>
                  </div>
                )}

                <div className="p-6 flex flex-col gap-5 flex-1">
                  {/* Plan header */}
                  <div>
                    <div className="text-sm font-bold text-foreground mb-1">{plan.name}</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-foreground">{formatRupiah(price)}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      per bulan{billing === 'yearly' ? ', ditagih tahunan' : ''}
                    </div>
                    {billing === 'yearly' && (
                      <div className="text-[10px] text-teal-600 font-semibold mt-1">
                        Hemat {formatRupiah((plan.monthlyPrice - plan.yearlyPrice) * 12)} per tahun
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <Link
                    href="/register"
                    className={`inline-flex items-center justify-center py-2.5 px-4 text-xs font-semibold rounded-lg transition-all duration-200 ${plan.recommended
                        ? 'bg-teal-600 text-white hover:bg-teal-500 shadow-md shadow-teal-600/20'
                        : 'border border-border bg-background hover:bg-muted/60 text-foreground'
                      }`}
                  >
                    Mulai dengan {plan.name}
                  </Link>

                  {/* Feature list */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-border/60 flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Yang termasuk:
                    </div>
                    {plan.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        {feat.included ? (
                          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                            <circle cx="5.5" cy="5.5" r="5" className="fill-teal-600/15 stroke-teal-600/40" strokeWidth="0.8" />
                            <path d="M3.5 5.5L4.8 6.8L7.5 4" stroke="#0d9488" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                            <circle cx="5.5" cy="5.5" r="5" className="fill-muted stroke-border" strokeWidth="0.8" />
                            <path d="M4 7L7 4M7 7L4 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="text-muted-foreground/40" />
                          </svg>
                        )}
                        <span className={`text-xs leading-relaxed ${feat.included ? 'text-foreground' : 'text-muted-foreground/60 line-through'}`}>
                          {feat.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs text-muted-foreground mt-10">
          Semua paket termasuk uji coba gratis 14 hari. Tidak diperlukan kartu kredit.
          Butuh solusi kustom?{' '}
          <a href="mailto:sales@ex-pos.id" className="text-teal-600 hover:underline font-medium">
            Hubungi tim kami.
          </a>
        </p>
      </div>
    </section>
  )
}
