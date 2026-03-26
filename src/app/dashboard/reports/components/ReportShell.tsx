'use client'

import { useState, useEffect } from 'react'
import DateRangePicker from './DateRangePicker'
import ExportMenu from './ExportMenu'
import { ReportsContext } from './ReportsContext'
import type {
  SummaryData,
  StoreMetric,
  ProductItem,
  SlowMover,
  PaymentBucket,
  DateRange,
} from '../types'

// ─── Default preset ────────────────────────────────────────────────────────────

function fmt(d: Date) {
  return d.toISOString().slice(0, 10)
}

function defaultRange(): DateRange {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return { from: fmt(start), to: fmt(end), label: 'This Month' }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  tenantName: string
  stores: { id: string; name: string }[]
  pageTitle: string
  pageSubtitle: string
  section: 'summary' | 'stores' | 'products' | 'payments'
  children: React.ReactNode
}

export default function ReportShell({
  tenantName,
  stores,
  pageTitle,
  pageSubtitle,
  section,
  children,
}: Props) {
  const [dateRange, setDateRange] = useState<DateRange>(defaultRange)
  const [selectedStore, setSelectedStore] = useState<string>('')

  // Build query string
  const qs = (() => {
    const params = new URLSearchParams({ from: dateRange.from, to: dateRange.to })
    if (selectedStore) params.set('storeId', selectedStore)
    return params.toString()
  })()

  // Export data — fetched lazily for the export menu
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [storeData, setStoreData] = useState<StoreMetric[]>([])
  const [productData, setProductData] = useState<{
    byVolume: ProductItem[]
    byProfit: ProductItem[]
    slowMovers: SlowMover[]
  } | null>(null)
  const [paymentData, setPaymentData] = useState<{
    distribution: PaymentBucket[]
    totalRevenue: number
  } | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        if (section === 'summary') {
          const res = await fetch(`/api/reports/summary?${qs}`, { signal: controller.signal })
          if (res.ok) setSummary(await res.json())
        } else if (section === 'stores') {
          const res = await fetch(`/api/reports/stores?${qs}`, { signal: controller.signal })
          if (res.ok) setStoreData((await res.json()).stores)
        } else if (section === 'products') {
          const res = await fetch(`/api/reports/products?${qs}`, { signal: controller.signal })
          if (res.ok) setProductData(await res.json())
        } else if (section === 'payments') {
          const res = await fetch(`/api/reports/payments?${qs}`, { signal: controller.signal })
          if (res.ok) setPaymentData(await res.json())
        }
      } catch {
        // silently ignore abort errors
      }
    }
    load()
    return () => controller.abort()
  }, [qs, section])

  return (
    <ReportsContext.Provider value={{ qs, dateRange, selectedStore }}>
      <div className="animate-fade-in">
        {/* ── Page Header ──────────────────────────────────────────────────── */}
        <div className="page-header">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <h1 className="page-title">{pageTitle}</h1>
              <p className="page-subtitle">
                {pageSubtitle}{' '}
                <span className="font-semibold text-foreground">{tenantName}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap print:hidden">
              {stores.length > 1 && (
                <select
                  id="store-filter"
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="field-input w-40 h-8"
                >
                  <option value="">All Stores</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              )}
              <DateRangePicker value={dateRange} onChange={setDateRange} />
              <ExportMenu
                dateRange={dateRange}
                selectedStore={selectedStore}
                summary={summary}
                storeData={storeData}
                productData={productData}
                paymentData={paymentData}
              />
            </div>
          </div>
        </div>

        {/* ── Active Period Label ──────────────────────────────────────────── */}
        <div className="mb-5 flex items-center gap-2">
          <span className="badge badge-neutral">{dateRange.label}</span>
          <span className="text-[10px] text-muted-foreground">
            {dateRange.from} — {dateRange.to}
            {selectedStore && stores.length > 1
              ? ` · ${stores.find((s) => s.id === selectedStore)?.name ?? ''}`
              : ''}
          </span>
        </div>

        {/* ── Section Content ──────────────────────────────────────────────── */}
        {children}
      </div>
    </ReportsContext.Provider>
  )
}
