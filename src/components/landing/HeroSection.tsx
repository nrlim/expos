'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let t = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const isDark = document.documentElement.classList.contains('dark')
      const lineColor = isDark ? 'rgba(13,148,136,0.12)' : 'rgba(13,148,136,0.08)'

      // Animated grid lines
      const spacing = 48
      ctx.strokeStyle = lineColor
      ctx.lineWidth = 1

      for (let x = (t * 0.3) % spacing; x < canvas.width; x += spacing) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = (t * 0.2) % spacing; y < canvas.height; y += spacing) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      t += 0.4
      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background">
      {/* Animated grid canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      />

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(13,148,136,0.08) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40">
        <div className="max-w-4xl mx-auto text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-600/30 bg-teal-600/8 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-teal-600 tracking-wider uppercase">
              Multi-Store POS System
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
            Satu Dashboard.{' '}
            <span className="text-teal-600">Banyak Cabang.</span>
            <br />
            Transparansi Tanpa Celah.
          </h1>

          {/* Sub-headline */}
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Sistem POS Multi-Store yang didesain untuk skalabilitas bisnis Anda.
            Kelola inventaris, pantau profit bersih, dan kontrol operasional
            seluruh outlet dalam satu genggaman.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              id="hero-cta-primary"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition-all duration-200 shadow-lg shadow-teal-600/20 hover:shadow-teal-500/30 hover:-translate-y-0.5 w-full sm:w-auto"
            >
              Mulai Uji Coba Gratis
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7H11M11 7L8 4M11 7L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <a
              href="#fitur"
              id="hero-cta-secondary"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg border border-border bg-background hover:bg-muted/60 text-foreground transition-all duration-200 hover:-translate-y-0.5 w-full sm:w-auto"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M5.5 7L7 5.5L8.5 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" transform="rotate(90 7 7)"/>
              </svg>
              Lihat Demo Interaktif
            </a>
          </div>

          {/* Trust indicators */}
          <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-muted-foreground">
            {[
              { label: 'Setup dalam 5 menit' },
              { label: 'Tanpa kartu kredit' },
              { label: 'Dukungan teknis penuh' },
            ].map((item, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="6" cy="6" r="5.5" className="stroke-teal-600/50" strokeWidth="1"/>
                  <path d="M3.5 6L5 7.5L8.5 4" className="stroke-teal-600" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {item.label}
              </span>
            ))}
          </div>
        </div>

        {/* Dashboard Preview Card */}
        <div className="mt-20 max-w-5xl mx-auto">
          <div className="relative rounded-xl border border-border bg-card shadow-2xl shadow-black/10 overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/30">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
              <div className="ml-3 flex-1 bg-background rounded border border-border px-3 py-1 text-[10px] text-muted-foreground">
                app.ex-pos.id/dashboard
              </div>
            </div>

            {/* Dashboard content mockup */}
            <div className="p-5 bg-background/60">
              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {[
                  { label: 'Total Omzet', value: 'Rp 84.5jt', delta: '+12.3%', color: 'text-teal-600' },
                  { label: 'Laba Bersih', value: 'Rp 21.2jt', delta: '+8.7%', color: 'text-teal-600' },
                  { label: 'Transaksi', value: '1,847', delta: '+5.1%', color: 'text-teal-600' },
                  { label: 'Cabang Aktif', value: '3', delta: 'Online', color: 'text-teal-600' },
                ].map((stat, i) => (
                  <div key={i} className="bg-card border border-border rounded-lg p-3">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{stat.label}</div>
                    <div className="text-lg font-bold text-foreground leading-none">{stat.value}</div>
                    <div className={`text-[9px] font-semibold mt-1 ${stat.color}`}>{stat.delta}</div>
                  </div>
                ))}
              </div>

              {/* Chart + table row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Mini chart */}
                <div className="md:col-span-2 bg-card border border-border rounded-lg p-3">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Penjualan 7 Hari Terakhir</div>
                  <svg viewBox="0 0 300 80" className="w-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0d9488" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#0d9488" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    <path d="M0,60 L43,45 L86,52 L129,30 L172,38 L215,18 L258,25 L300,15 L300,80 L0,80Z" fill="url(#chartGrad)"/>
                    <path d="M0,60 L43,45 L86,52 L129,30 L172,38 L215,18 L258,25 L300,15" fill="none" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                {/* Recent transactions */}
                <div className="bg-card border border-border rounded-lg p-3">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Transaksi Terbaru</div>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { store: 'Cab. Sudirman', amount: 'Rp 450rb', time: '2m ago' },
                      { store: 'Cab. Gatot Subroto', amount: 'Rp 280rb', time: '7m ago' },
                      { store: 'Cab. Kuningan', amount: 'Rp 675rb', time: '12m ago' },
                    ].map((tx, i) => (
                      <div key={i} className="flex items-center justify-between py-1 border-b border-border/60 last:border-0">
                        <div>
                          <div className="text-[9px] font-semibold text-foreground">{tx.store}</div>
                          <div className="text-[8px] text-muted-foreground">{tx.time}</div>
                        </div>
                        <div className="text-[9px] font-bold text-teal-600">{tx.amount}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
