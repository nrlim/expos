import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'ex-POS — Admin Portal',
    template: '%s | ex-POS',
  },
  description:
    'Multi-tenant POS & inventory management system for smartphone retailers.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'),
}

import { ThemeProvider } from '@/components/ThemeProvider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          scriptProps={{ suppressHydrationWarning: true } as any}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
