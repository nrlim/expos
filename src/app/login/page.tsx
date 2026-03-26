'use client'

import { useState, useActionState } from 'react'
import Link from 'next/link'
import { login } from '@/app/actions/auth'
import type { ActionResult } from '@/lib/types'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(login, null)

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
      <header className="relative z-10 p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="text-sm font-black">eP</span>
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">ex-POS</span>
        </div>
      </header>

      {/* Center Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[420px] animate-fade-in">
          {/* Card */}
          <div className="bg-card text-card-foreground border border-border shadow-2xl shadow-black/5 dark:shadow-none sm:rounded-2xl rounded-xl p-6 sm:p-8">
            
            {/* Top Icon (In Card) */}
            <div className="flex justify-center mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--icon-circle)] dark:bg-[var(--icon-circle)] border border-[var(--border)]/50">
                <svg className="h-5 w-5 text-primary dark:text-[var(--accent-link)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
            </div>

            {/* Typography */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Selamat Datang</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Masuk ke akun Anda untuk melanjutkan
              </p>
            </div>

            {state && !state.success && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive font-medium mb-6" role="alert">
                <svg xmlns="http://www.w3.org/2000/svg" className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{state.error}</span>
              </div>
            )}

            <form action={action} className="space-y-5">
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
                    placeholder="Masukkan nama pengguna"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 pl-10 transition-colors"
                  />
                </div>
                {state && !state.success && state.fieldErrors?.username && (
                  <p className="text-xs text-destructive font-medium">{state.fieldErrors.username[0]}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-foreground">
                    Kata Sandi
                  </label>
                  <Link href="#" className="text-xs font-medium text-[var(--accent-link)] hover:text-primary transition-colors hover:underline">
                    Lupa Kata Sandi?
                  </Link>
                </div>
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
                    autoComplete="current-password"
                    placeholder="••••••••"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 pl-10 pr-10 transition-colors"
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
                {state && !state.success && state.fieldErrors?.password && (
                  <p className="text-xs text-destructive font-medium">{state.fieldErrors.password[0]}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  id="btn-login"
                  type="submit"
                  disabled={pending}
                  className="group relative flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:focus:ring-offset-background"
                >
                  {pending ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Memproses...
                    </span>
                  ) : (
                    <>
                      Masuk
                      <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center text-sm">
              <span className="text-muted-foreground">Belum punya akun?</span>{' '}
              <Link href="/register" className="font-semibold text-foreground hover:text-primary transition-colors underline decoration-border hover:decoration-primary underline-offset-4">
                Buat organisasi baru
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center text-xs font-medium text-muted-foreground">
        &copy; {new Date().getFullYear()} ex-POS. Hak cipta dilindungi undang-undang.
      </footer>
    </div>
  )
}

