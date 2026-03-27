import type { Metadata } from 'next'
import LandingNav from '@/components/landing/LandingNav'
import HeroSection from '@/components/landing/HeroSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import PricingSection from '@/components/landing/PricingSection'
import HardwareSection from '@/components/landing/HardwareSection'
import ComparisonSection from '@/components/landing/ComparisonSection'
import LandingFooter from '@/components/landing/LandingFooter'

export const metadata: Metadata = {
  title: 'ex-POS — Sistem POS Multi-Store untuk Bisnis Modern',
  description:
    'Kelola seluruh cabang bisnis Anda dalam satu dashboard. Real-time inventory sync, kalkulasi HPP otomatis, dan universal order tracking untuk skalabilitas tanpa batas.',
  openGraph: {
    title: 'ex-POS — Satu Dashboard. Banyak Cabang. Transparansi Tanpa Celah.',
    description:
      'Sistem POS Multi-Store yang didesain untuk skalabilitas bisnis. Kelola inventaris, pantau profit bersih, dan kontrol operasional seluruh outlet dalam satu genggaman.',
    type: 'website',
  },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNav />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <HardwareSection />
        <ComparisonSection />
      </main>
      <LandingFooter />
    </div>
  )
}
