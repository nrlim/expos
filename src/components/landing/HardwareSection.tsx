import Link from 'next/link'

const bundles = [
  {
    id: 'lite-bundle',
    tier: 'Lite Bundle',
    price: 7490000,
    plan: 'Business Plan (1 Tahun)',
    hardware: [
      'Thermal Printer 58mm',
      '10 Roll Paper Thermal',
    ],
    highlight: false,
    badge: 'Populer untuk Warung & Cafe',
    specs: [
      { label: 'Kecepatan Cetak', value: '80 mm/s' },
      { label: 'Lebar Kertas', value: '58mm' },
      { label: 'Koneksi', value: 'USB + Bluetooth' },
    ],
  },
  {
    id: 'pro-bundle',
    tier: 'Pro Bundle',
    price: 14900000,
    plan: 'Enterprise Plan (1 Tahun)',
    hardware: [
      'Thermal Printer 80mm Auto-Cutter',
      '20 Roll Paper Thermal',
    ],
    highlight: true,
    badge: 'Terbaik untuk Restoran & Laundry',
    specs: [
      { label: 'Kecepatan Cetak', value: '200 mm/s' },
      { label: 'Lebar Kertas', value: '80mm' },
      { label: 'Koneksi', value: 'USB + LAN + Bluetooth' },
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

export default function HardwareSection() {
  return (
    <section id="hardware" className="py-24 bg-background relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-600/30 bg-teal-600/8 mb-4">
            <span className="text-[11px] font-semibold text-teal-600 tracking-wider uppercase">
              Hardware Bundling
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            Plug and Play. Siap Operasi Hari Ini.
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Dapatkan hardware yang sudah dikonfigurasi penuh dengan sistem ex-POS.
            Tanpa setup teknis yang rumit, langsung operasional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {bundles.map((bundle) => (
            <div
              key={bundle.id}
              id={bundle.id}
              className={`relative rounded-xl border overflow-hidden transition-all duration-300 ${
                bundle.highlight
                  ? 'border-teal-600 shadow-xl shadow-teal-600/10'
                  : 'border-border hover:border-teal-600/30 hover:shadow-lg'
              }`}
            >
              {/* Top color band */}
              <div className={`h-1.5 w-full ${bundle.highlight ? 'bg-teal-600' : 'bg-border'}`} />

              <div className="p-6 bg-card">
                {/* Badge */}
                <div className="mb-4">
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm ${
                    bundle.highlight
                      ? 'bg-teal-600/10 text-teal-600 border border-teal-600/20'
                      : 'bg-muted text-muted-foreground border border-border'
                  }`}>
                    {bundle.badge}
                  </span>
                </div>

                {/* Tier & Price */}
                <div className="mb-5">
                  <h3 className="text-xl font-bold text-foreground mb-1">{bundle.tier}</h3>
                  <div className="text-2xl font-bold text-foreground">
                    {formatRupiah(bundle.price)}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">pembayaran satu kali</div>
                </div>

                {/* What's included */}
                <div className="mb-5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Termasuk:</div>
                  <div className="flex flex-col gap-2">
                    {/* Software plan */}
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-teal-600/5 border border-teal-600/15">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-teal-600 shrink-0">
                        <path d="M2 4H14M2 8H14M2 12H8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                        <rect x="9.5" y="9.5" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.1"/>
                        <path d="M10.5 11.5L11.2 12.2L13 10.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <div>
                        <div className="text-xs font-semibold text-foreground">{bundle.plan}</div>
                        <div className="text-[10px] text-teal-600 font-medium">Lisensi Software</div>
                      </div>
                    </div>

                    {/* Hardware */}
                    {bundle.hardware.map((hw, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30 border border-border/60">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground shrink-0">
                          <rect x="1.5" y="3" width="13" height="8" rx="1" stroke="currentColor" strokeWidth="1.3"/>
                          <path d="M5 11V13M11 11V13M3 13H13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                        </svg>
                        <span className="text-xs text-foreground">{hw}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specs */}
                <div className="mb-6 grid grid-cols-3 gap-2">
                  {bundle.specs.map((spec, i) => (
                    <div key={i} className="flex flex-col gap-0.5 p-2 rounded-md bg-muted/20 border border-border/40">
                      <div className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground">{spec.label}</div>
                      <div className="text-[10px] font-semibold text-foreground">{spec.value}</div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  href="/register"
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-lg transition-all duration-200 ${
                    bundle.highlight
                      ? 'bg-teal-600 text-white hover:bg-teal-500 shadow-md shadow-teal-600/20'
                      : 'border border-border bg-background hover:bg-muted/60 text-foreground'
                  }`}
                >
                  Pesan {bundle.tier}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 6H9.5M9.5 6L7 3.5M9.5 6L7 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs text-muted-foreground mt-10">
          Pengiriman ke seluruh Indonesia. Garansi hardware 1 tahun.
          Aktivasi sistem dilakukan dalam 24 jam setelah pembayaran.
        </p>
      </div>
    </section>
  )
}
