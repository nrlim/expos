const rows = [
  { feature: 'Jumlah Store', traditional: '1 Perangkat / Store', expos: 'Tidak Terbatas (Multi-Store)' },
  { feature: 'Biaya per Store Tambahan', traditional: 'Beli perangkat baru (Rp 3-5jt)', expos: 'Inklusif dalam paket' },
  { feature: 'Sinkronisasi Data', traditional: 'Manual / Export CSV', expos: 'Real-time otomatis' },
  { feature: 'Kalkulasi HPP & Laba', traditional: 'Tidak tersedia', expos: 'Otomatis per produk' },
  { feature: 'Akses dari Mana Saja', traditional: 'Hanya di perangkat kasir', expos: 'Browser & Mobile' },
  { feature: 'Laporan Konsolidasi', traditional: 'Rekap manual per toko', expos: 'Dashboard terpusat' },
  { feature: 'Order Tracking', traditional: 'Tidak tersedia', expos: 'Universal (Dapur/Laundry/Teknisi)' },
  { feature: 'Custom Struk', traditional: 'Template bawaan statis', expos: 'Logo & branding kustom' },
  { feature: 'Upgrade Sistem', traditional: 'Beli lisensi baru', expos: 'Update otomatis' },
  { feature: 'Support Teknis', traditional: 'Teknisi on-site (berbayar)', expos: 'Chat & Email (inklusif)' },
]

type StatusType = 'good' | 'bad' | 'neutral'

function StatusIndicator({ type }: { type: StatusType }) {
  if (type === 'good') {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block mr-1.5 shrink-0 align-middle">
        <circle cx="7" cy="7" r="6.5" fill="#0d9488" fillOpacity="0.12" stroke="#0d9488" strokeOpacity="0.4" strokeWidth="0.8"/>
        <path d="M4.5 7L6 8.5L9.5 5" stroke="#0d9488" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
  if (type === 'bad') {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block mr-1.5 shrink-0 align-middle">
        <circle cx="7" cy="7" r="6.5" fill="#ef4444" fillOpacity="0.08" stroke="#ef4444" strokeOpacity="0.3" strokeWidth="0.8"/>
        <path d="M5 9L9 5M9 9L5 5" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    )
  }
  return null
}

function classifyTraditional(text: string): StatusType {
  const negativeKeywords = ['Tidak tersedia', 'on-site', 'Manual', 'statis', 'Hanya di', 'Beli', 'Rekap manual']
  if (negativeKeywords.some((kw) => text.includes(kw))) return 'bad'
  return 'neutral'
}

export default function ComparisonSection() {
  return (
    <section id="perbandingan" className="py-24 bg-muted/20 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-600/30 bg-teal-600/8 mb-4">
            <span className="text-[11px] font-semibold text-teal-600 tracking-wider uppercase">
              Perbandingan Sistem
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            Mengapa ex-POS Berbeda?
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            POS tradisional dirancang untuk satu toko. ex-POS dirancang untuk bisnis yang tumbuh.
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-border shadow-xl">
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-1/3 border-b border-border">
                  Fitur
                </th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400/80" />
                    POS Tradisional
                  </div>
                </th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-foreground border-b border-teal-600/40 bg-teal-600/5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                    ex-POS
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.feature}
                  className={`border-b border-border/60 last:border-0 transition-colors hover:bg-muted/20 ${
                    i % 2 === 0 ? 'bg-card' : 'bg-card/60'
                  }`}
                >
                  <td className="px-5 py-3.5 text-xs font-semibold text-foreground">
                    {row.feature}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <StatusIndicator type={classifyTraditional(row.traditional)} />
                      {row.traditional}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-foreground bg-teal-600/3 border-l border-teal-600/10">
                    <span className="flex items-center">
                      <StatusIndicator type="good" />
                      <span className="font-medium">{row.expos}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom callout */}
        <div className="mt-10 p-6 rounded-xl border border-teal-600/20 bg-teal-600/5 text-center">
          <p className="text-sm font-semibold text-foreground mb-1">
            Siap beralih ke sistem yang lebih transparan dan efisien?
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Tim kami siap membantu migrasi data dari sistem lama Anda secara gratis.
          </p>
          <a
            href="#harga"
            className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition-colors shadow-md shadow-teal-600/20"
          >
            Lihat Paket Harga
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.5 6H9.5M9.5 6L7 3.5M9.5 6L7 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
