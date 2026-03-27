import Link from 'next/link'

const COMPARE_ROWS = [
  // core
  { category: 'Sistem Inti', feature: 'Batas Toko (Cabang)', starter: '1 Store', business: 'Maks. 3 Store', enterprise: 'Tidak Terbatas' },
  { category: 'Sistem Inti', feature: 'Akses Pengguna (Admin/Kasir)', starter: 'Maks. 3 Akun', business: 'Maks. 10 Akun', enterprise: 'Tidak Terbatas' },
  { category: 'Sistem Inti', feature: 'Batas Transaksi Bulanan', starter: 'Tanpa Batas', business: 'Tanpa Batas', enterprise: 'Tanpa Batas' },
  { category: 'Sistem Inti', feature: 'Mode Offline (PWA)', starter: true, business: true, enterprise: true },
  
  // Kasir & Pembayaran
  { category: 'Kasir & Pembayaran', feature: 'Barcode Scanner Support', starter: true, business: true, enterprise: true },
  { category: 'Kasir & Pembayaran', feature: 'Pajak & Diskon Kustom', starter: true, business: true, enterprise: true },
  { category: 'Kasir & Pembayaran', feature: 'Struk Digital (WhatsApp/Email)', starter: true, business: true, enterprise: true },
  { category: 'Kasir & Pembayaran', feature: 'Custom Logo Struk Thermal', starter: false, business: true, enterprise: true },
  
  // Manajemen
  { category: 'Manajemen Operasional', feature: 'Katalog Produk Global', starter: false, business: true, enterprise: true },
  { category: 'Manajemen Operasional', feature: 'Role & Izin Spesifik', starter: false, business: true, enterprise: true },
  { category: 'Manajemen Operasional', feature: 'Transfer Stok Antar Cabang', starter: false, business: true, enterprise: true },
  { category: 'Manajemen Operasional', feature: 'Universal Order Tracking (OMS)', starter: false, business: false, enterprise: true },
  { category: 'Manajemen Operasional', feature: 'Kanban & Audio Alerts', starter: false, business: false, enterprise: true },

  // Analitik & Tambahan
  { category: 'Laporan & Ekstensi', feature: 'Laporan Penjualan Dasar', starter: true, business: true, enterprise: true },
  { category: 'Laporan & Ekstensi', feature: 'Analitik Lanjut (HPP & Profit)', starter: false, business: true, enterprise: true },
  { category: 'Laporan & Ekstensi', feature: 'Export Data (Excel/PDF)', starter: false, business: false, enterprise: true },
  { category: 'Laporan & Ekstensi', feature: 'Akses API Terbuka', starter: false, business: false, enterprise: true },
  { category: 'Laporan & Ekstensi', feature: 'Jalur Dukungan (Support)', starter: 'Email', business: 'WhatsApp & Email', enterprise: 'Prioritas 24/7' },
]

export default function PlanComparisonSection() {
  return (
    <section id="bandingkan-paket" className="py-24 bg-background relative border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-600/30 bg-teal-600/8 mb-4">
            <span className="text-[11px] font-semibold text-teal-600 tracking-wider uppercase">
              Perbandingan Lengkap
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            Bandingkan Fitur Antar Paket
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Detail fitur transparan. Jangan bayar untuk apa yang tidak Anda perlukan. Upgrade seiring pertumbuhan skala bisnis.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[800px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="py-4 px-6 font-semibold text-sm text-muted-foreground w-[40%]">
                  Fitur & Kemampuan
                </th>
                <th className="py-4 px-6 font-bold text-sm text-center text-foreground w-[20%] border-l border-border/50">
                  Starter
                </th>
                <th className="py-4 px-6 font-bold text-sm text-center text-teal-600 w-[20%] bg-teal-600/5 border-l border-border/50 relative">
                  {/* Subtle recommended badge */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-teal-600" />
                  Business
                </th>
                <th className="py-4 px-6 font-bold text-sm text-center text-foreground w-[20%] border-l border-border/50 bg-muted/10">
                  Enterprise
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row, index) => {
                const isFirstInCategory = index === 0 || COMPARE_ROWS[index - 1].category !== row.category

                return (
                  <React.Fragment key={index}>
                    {isFirstInCategory && (
                      <tr className="bg-muted/10 border-b border-border">
                        <td colSpan={4} className="py-2.5 px-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/20">
                          {row.category}
                        </td>
                      </tr>
                    )}
                    <tr className="border-b border-border/60 hover:bg-muted/10 transition-colors">
                      <td className="py-3 px-6 text-xs font-medium text-foreground">
                        {row.feature}
                      </td>
                      
                      <td className="py-3 px-6 text-xs text-center text-muted-foreground border-l border-border/50">
                        {renderValue(row.starter)}
                      </td>
                      
                      <td className="py-3 px-6 text-xs text-center font-medium border-l border-border/50 bg-teal-600/[0.02]">
                        {renderValue(row.business)}
                      </td>
                      
                      <td className="py-3 px-6 text-xs text-center text-muted-foreground border-l border-border/50 bg-muted/5">
                        {renderValue(row.enterprise)}
                      </td>
                    </tr>
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>

      </div>
    </section>
  )
}

function renderValue(val: string | boolean) {
  if (typeof val === 'string') return val
  if (val === true) {
    return (
      <svg className="w-4 h-4 text-teal-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    )
  }
  return (
    <div className="w-1.5 h-px bg-muted-foreground/40 mx-auto" /> // minimalist dash for false
  )
}

import React from 'react'
