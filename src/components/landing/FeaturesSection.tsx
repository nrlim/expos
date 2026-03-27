const features = [
  {
    id: 'multi-store',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="11" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="2" y="12" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="11" y="12" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M9 6.5H11M9 15.5H11M14.5 10V12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <path d="M5.5 10V12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
    badge: 'Multi-Store',
    title: 'Manajemen Multi-Cabang',
    description:
      'Sinkronisasi data stok dan penjualan antar cabang secara real-time. Tidak ada lagi laporan manual atau data yang tidak sinkron antar outlet.',
    details: ['Sinkronisasi stok lintas cabang', 'Transfer produk antar outlet', 'Dashboard konsolidasi terpusat'],
  },
  {
    id: 'analytics',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 15L7 9.5L10.5 12.5L14 7L17 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="2" y="2" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    ),
    badge: 'Deep Analytics',
    title: 'Analitik Laba Mendalam',
    description:
      'Menghitung HPP dan Laba Bersih secara otomatis, bukan sekadar omzet. Ketahui produk mana yang benar-benar menguntungkan bisnis Anda.',
    details: ['Kalkulasi HPP otomatis', 'Laporan laba bersih per produk', 'Tren penjualan & profitabilitas'],
  },
  {
    id: 'order-tracking',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 5H17M3 10H17M3 15H11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <circle cx="15" cy="15" r="3" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M14 15L14.8 15.8L16.2 14.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    badge: 'Order Tracking',
    title: 'Universal Order Tracking',
    description:
      'Monitor proses produksi dari Dapur, Laundry, hingga Teknisi secara menyeluruh — setiap pesanan terlacak hingga siap di tangan pelanggan.',
    details: ['Status pesanan real-time', 'Notifikasi progress produksi', 'Histori lengkap per order'],
  },
  {
    id: 'receipt',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 2H15C15.5523 2 16 2.44772 16 3V18L13.5 16.5L11 18L8.5 16.5L6 18L4 16.5V3C4 2.44772 4.44772 2 5 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
        <path d="M7 7H13M7 10H11M7 13H9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
    badge: 'Custom Branding',
    title: 'Custom Receipt & Branding',
    description:
      'Bangun kepercayaan pelanggan dengan struk bermerek profesional. Tersedia untuk struk fisik thermal printer maupun struk digital via WhatsApp.',
    details: ['Logo & nama bisnis di struk', 'Struk digital via WhatsApp', 'Template struk kustom'],
  },
]

export default function FeaturesSection() {
  return (
    <section id="fitur" className="py-24 bg-background relative">
      {/* Subtle top separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-600/30 bg-teal-600/8 mb-4">
            <span className="text-[11px] font-semibold text-teal-600 tracking-wider uppercase">
              Keunggulan ex-POS
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            Dirancang untuk Bisnis yang Serius
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Setiap fitur dibangun berdasarkan kebutuhan nyata pemilik bisnis multi-cabang
            yang membutuhkan transparansi penuh dalam satu sistem.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature) => (
            <div
              key={feature.id}
              id={`feature-${feature.id}`}
              className="group relative flex flex-col gap-4 p-6 rounded-xl border border-border bg-card hover:border-teal-600/40 hover:shadow-lg hover:shadow-teal-600/5 transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-lg bg-teal-600/10 flex items-center justify-center text-teal-600 group-hover:bg-teal-600/15 transition-colors">
                {feature.icon}
              </div>

              {/* Badge */}
              <div className="inline-flex self-start">
                <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm bg-teal-600/8 text-teal-600 border border-teal-600/20">
                  {feature.badge}
                </span>
              </div>

              {/* Content */}
              <div>
                <h3 className="text-sm font-bold text-foreground mb-2 leading-snug">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>

              {/* Detail list */}
              <ul className="flex flex-col gap-1.5 pt-2 border-t border-border/60">
                {feature.details.map((detail, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-0.5 shrink-0">
                      <circle cx="5" cy="5" r="4.5" className="stroke-teal-600/40" strokeWidth="0.8"/>
                      <path d="M3 5L4.2 6.2L7 3.5" className="stroke-teal-600" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {detail}
                  </li>
                ))}
              </ul>

              {/* Hover glow accent */}
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-teal-600/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
