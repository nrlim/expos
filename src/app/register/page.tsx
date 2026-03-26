'use client'

import { useState, useActionState } from 'react'
import Link from 'next/link'
import { register } from '@/app/actions/auth'
import type { ActionResult } from '@/lib/types'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(register, null)

  return (
    <div className="relative min-h-dvh flex flex-col bg-background selection:bg-primary/10 selection:text-primary overflow-hidden">
      {/* Advanced Dynamic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-muted/40 dark:from-background dark:via-background/95 dark:to-slate-900/40" />
        
        <div className="absolute inset-0 bg-grid opacity-[0.4] dark:opacity-[0.15] mix-blend-multiply dark:mix-blend-lighten" />
        
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-primary/5 dark:bg-[var(--accent-link)]/[0.07] rounded-full blur-[120px]" />
        <div className="absolute -left-32 top-1/4 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-600/[0.06] rounded-full blur-[120px]" />
        <div className="absolute -right-32 bottom-0 w-[600px] h-[600px] bg-teal-500/10 dark:bg-teal-600/[0.06] rounded-full blur-[120px]" />

        {/* Soft Vignette Edge Fade */}
        <div className="absolute inset-0 bg-background/40 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_120%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_120%)]" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 p-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="text-sm font-black">eP</span>
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">ex-POS</span>
        </div>
      </header>

      {/* Center Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-4">
        <div className="w-full max-w-[580px] animate-fade-in">
          {/* Card */}
          <div className="bg-card text-card-foreground border border-border shadow-2xl shadow-black/5 dark:shadow-none sm:rounded-2xl rounded-xl p-5 sm:p-7">
            
            {/* Top Icon (In Card) */}
            <div className="flex justify-center mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--icon-circle)] dark:bg-[var(--icon-circle)] border border-[var(--border)]/50">
                <svg className="h-4 w-4 text-primary dark:text-[var(--accent-link)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>

            {/* Typography */}
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold tracking-tight text-foreground">Daftar Akun</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Buat organisasi baru dan mulai kelola inventaris
              </p>
            </div>

            {state && !state.success && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive font-medium mb-5" role="alert">
                <svg xmlns="http://www.w3.org/2000/svg" className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{state.error}</span>
              </div>
            )}

            <form action={action} className="space-y-4">
              
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Store Name */}
                <div className="space-y-1.5">
                  <label htmlFor="storeName" className="block text-sm font-medium text-foreground">
                    Nama Toko
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <input
                      id="storeName"
                      name="storeName"
                      type="text"
                      autoComplete="organization"
                      placeholder="My Phone Store"
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 pl-9 transition-colors"
                    />
                  </div>
                  {state && !state.success && state.fieldErrors?.storeName && (
                    <p className="text-xs text-destructive font-medium">{state.fieldErrors.storeName[0]}</p>
                  )}
                </div>

                {/* Store Slug */}
                <div className="space-y-1.5 flex flex-col justify-end">
                  <label htmlFor="storeSlug" className="block text-sm font-medium text-foreground">
                    ID Organisasi
                  </label>
                  <div className="relative flex rounded-md border border-input focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-colors bg-transparent">
                    <span className="flex items-center px-2.5 text-xs text-muted-foreground border-r border-input bg-muted/50 rounded-l-md pointer-events-none select-none shrink-0">
                      expos.app/
                    </span>
                    <input
                      id="storeSlug"
                      name="storeSlug"
                      type="text"
                      autoComplete="off"
                      placeholder="my-store"
                      required
                      className="flex h-10 w-full min-w-0 rounded-r-md bg-transparent px-2.5 py-2 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  {state && !state.success && state.fieldErrors?.storeSlug ? (
                    <p className="text-[11px] text-destructive font-medium">{state.fieldErrors.storeSlug[0]}</p>
                  ) : (
                    <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                      Kecil, angka, tanda hubung (-) saja.
                    </p>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="relative py-1.5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-2 text-muted-foreground font-medium">Akun Pemilik</span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Username */}
                <div className="space-y-1.5">
                  <label htmlFor="username" className="block text-sm font-medium text-foreground">
                    Nama Pengguna
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      placeholder="admin_user"
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 pl-9 transition-colors"
                    />
                  </div>
                  {state && !state.success && state.fieldErrors?.username && (
                    <p className="text-xs text-destructive font-medium">{state.fieldErrors.username[0]}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5 flex flex-col justify-end">
                  <label htmlFor="password" className="block text-sm font-medium text-foreground">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Min. 8 karakter"
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 pl-9 pr-10 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {state && !state.success && state.fieldErrors?.password ? (
                    <p className="text-[11px] text-destructive font-medium">{state.fieldErrors.password[0]}</p>
                  ) : (
                    <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                      Min. 8 char, 1 huruf & angka
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  id="btn-register"
                  type="submit"
                  disabled={pending}
                  className="group relative flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:focus:ring-offset-background"
                >
                  {pending ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Membuat akun...
                    </span>
                  ) : (
                    <>
                      Daftar Sekarang
                      <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-5 text-center text-sm">
              <span className="text-muted-foreground">Sudah punya akun?</span>{' '}
              <Link href="/login" className="font-semibold text-foreground hover:text-primary transition-colors underline decoration-border hover:decoration-primary underline-offset-4">
                Masuk sekarang
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-5 text-center text-xs font-medium text-muted-foreground">
        &copy; {new Date().getFullYear()} ex-POS. Hak cipta dilindungi.
      </footer>
    </div>
  )
}
