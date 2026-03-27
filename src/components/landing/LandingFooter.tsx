import Link from 'next/link'

export default function LandingFooter() {
  return (
    <footer className="bg-background border-t border-border">
      {/* CTA Banner */}
      <div className="bg-slate-900 dark:bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
            Mulai Transformasi Bisnis Anda Hari Ini
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto mb-8">
            Bergabung dengan ratusan pemilik bisnis yang sudah mempercayakan
            operasional mereka kepada ex-POS. Uji coba 14 hari, tanpa biaya.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition-colors shadow-lg shadow-teal-600/20"
            >
              Mulai Uji Coba Gratis
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7H11M11 7L8 4M11 7L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <a
              href="mailto:sales@ex-pos.id"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white transition-colors"
            >
              Konsultasi dengan Tim Kami
            </a>
          </div>
        </div>
      </div>

      {/* Footer links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-md bg-teal-600 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="5" height="5" rx="1" fill="white"/>
                  <rect x="9" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.7"/>
                  <rect x="2" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.7"/>
                  <rect x="9" y="9" width="5" height="5" rx="1" fill="white"/>
                </svg>
              </div>
              <span className="font-bold text-sm text-foreground">
                ex<span className="text-teal-600">-POS</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sistem POS Multi-Store untuk bisnis modern yang mengutamakan transparansi dan efisiensi operasional.
            </p>
          </div>

          {/* Product */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-4">Produk</div>
            <ul className="flex flex-col gap-2.5">
              {['Fitur', 'Paket Harga', 'Hardware Bundle', 'Changelog'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-4">Dukungan</div>
            <ul className="flex flex-col gap-2.5">
              {['Dokumentasi', 'Panduan Setup', 'Status Sistem', 'Hubungi Kami'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-4">Legal</div>
            <ul className="flex flex-col gap-2.5">
              {['Kebijakan Privasi', 'Syarat Layanan', 'Kebijakan Refund'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-border">
          <p className="text-[11px] text-muted-foreground">
            &copy; {new Date().getFullYear()} ex-POS by Accuwrite. Seluruh hak cipta dilindungi undang-undang.
          </p>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            Semua sistem berjalan normal
          </div>
        </div>
      </div>
    </footer>
  )
}
