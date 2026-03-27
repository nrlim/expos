'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-md bg-teal-600 flex items-center justify-center shadow-sm group-hover:bg-teal-500 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="5" height="5" rx="1" fill="white"/>
                <rect x="9" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.7"/>
                <rect x="2" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.7"/>
                <rect x="9" y="9" width="5" height="5" rx="1" fill="white"/>
              </svg>
            </div>
            <span className="font-bold text-base tracking-tight text-foreground">
              ex<span className="text-teal-600">-POS</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#fitur" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Fitur</a>
            <a href="#harga" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Harga</a>
            <a href="#hardware" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Hardware</a>
            <a href="#perbandingan" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Perbandingan</a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-4 py-1.5 text-xs font-semibold rounded-md bg-teal-600 text-white hover:bg-teal-500 transition-colors shadow-sm"
            >
              Mulai Gratis
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              {menuOpen ? (
                <>
                  <line x1="3" y1="3" x2="15" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="15" y1="3" x2="3" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </>
              ) : (
                <>
                  <line x1="3" y1="5" x2="15" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="3" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="3" y1="13" x2="15" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border bg-background/98 backdrop-blur-md py-4 flex flex-col gap-1">
            {[
              { href: '#fitur', label: 'Fitur' },
              { href: '#harga', label: 'Harga' },
              { href: '#hardware', label: 'Hardware' },
              { href: '#perbandingan', label: 'Perbandingan' },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-3 pt-3 border-t border-border flex flex-col gap-2">
              <Link href="/login" className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md transition-colors">
                Masuk ke Dashboard
              </Link>
              <Link
                href="/register"
                className="mx-3 inline-flex items-center justify-center py-2.5 text-sm font-semibold rounded-md bg-teal-600 text-white hover:bg-teal-500 transition-colors"
              >
                Mulai Uji Coba Gratis
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
