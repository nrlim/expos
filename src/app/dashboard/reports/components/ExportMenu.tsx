'use client'

import type {
  SummaryData,
  StoreMetric,
  ProductItem,
  SlowMover,
  PaymentBucket,
  DateRange,
} from '../types'

// ─── Currency Formatting ──────────────────────────────────────────────────────

function fmtIDR(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}

function downloadCSV(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  dateRange: DateRange
  selectedStore: string
  summary: SummaryData | null
  storeData: StoreMetric[]
  productData: { byVolume: ProductItem[]; byProfit: ProductItem[]; slowMovers: SlowMover[] } | null
  paymentData: { distribution: PaymentBucket[]; totalRevenue: number } | null
}

export default function ExportMenu({
  dateRange,
  summary,
  storeData,
  productData,
  paymentData,
}: Props) {
  function exportSummaryCSV() {
    if (!summary) return
    const rows: string[][] = [
      ['Metric', 'Value'],
      ['Period', `${dateRange.from} to ${dateRange.to}`],
      ['Gross Sales', String(summary.grossSales)],
      ['Total COGS (HPP)', String(summary.totalCOGS)],
      ['Net Profit', String(summary.netProfit)],
      ['Gross Margin (%)', String(summary.margin)],
      ['Transactions', String(summary.txCount)],
      ['Average Order Value', String(summary.aov)],
    ]
    downloadCSV(`expos-summary-${dateRange.from}-${dateRange.to}.csv`, rows)
  }

  function exportStoresCSV() {
    const rows: string[][] = [
      ['Store', 'Location', 'Gross Sales', 'COGS', 'Net Profit', 'Margin %', 'Transactions'],
      ...storeData.map((s) => [
        s.storeName,
        s.location,
        String(s.grossSales),
        String(s.cogs),
        String(s.netProfit),
        String(s.margin),
        String(s.txCount),
      ]),
    ]
    downloadCSV(`expos-stores-${dateRange.from}-${dateRange.to}.csv`, rows)
  }

  function exportProductsCSV() {
    if (!productData) return
    const rows: string[][] = [
      ['Rank', 'Product', 'Model', 'Category', 'Qty Sold', 'Revenue', 'COGS', 'Gross Profit'],
      ...productData.byVolume.map((p, i) => [
        String(i + 1),
        p.name,
        p.modelName,
        p.category,
        String(p.totalQty),
        String(p.totalRevenue),
        String(p.totalCOGS),
        String(p.grossProfit),
      ]),
    ]
    downloadCSV(`expos-bestsellers-${dateRange.from}-${dateRange.to}.csv`, rows)
  }

  function exportSlowMoversCSV() {
    if (!productData) return
    const rows: string[][] = [
      ['Product', 'Model', 'Category', 'Stock Qty', 'Stock Value', 'Days In Stock'],
      ...productData.slowMovers.map((p) => [
        p.name,
        p.modelName,
        p.category,
        String(p.stock),
        String(p.stockValue),
        String(p.daysInStock),
      ]),
    ]
    downloadCSV(`expos-slowmovers-${dateRange.from}-${dateRange.to}.csv`, rows)
  }

  function exportPaymentsCSV() {
    if (!paymentData) return
    const rows: string[][] = [
      ['Payment Method', 'Amount', 'Transactions', 'Share (%)'],
      ...paymentData.distribution.map((d) => [
        d.method,
        String(d.amount),
        String(d.count),
        String(d.pct),
      ]),
    ]
    downloadCSV(`expos-payments-${dateRange.from}-${dateRange.to}.csv`, rows)
  }

  function exportPrint() {
    window.print()
  }

  return (
    <div className="relative group">
      <button
        id="export-menu-trigger"
        className="btn-ghost border border-border h-8 gap-2 flex items-center"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span className="text-xs font-semibold">Export</span>
        <svg className="w-3 h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className="absolute right-0 top-10 z-40 w-56 card shadow-xl p-1.5 hidden group-focus-within:flex group-hover:flex flex-col gap-0.5">
        <p className="px-2 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          CSV Export
        </p>
        <button
          id="export-summary-csv"
          onClick={exportSummaryCSV}
          disabled={!summary}
          className="text-left px-3 py-2 text-xs font-medium rounded-sm hover:bg-muted transition-colors disabled:opacity-40"
        >
          Sales Summary
        </button>
        <button
          id="export-stores-csv"
          onClick={exportStoresCSV}
          disabled={storeData.length === 0}
          className="text-left px-3 py-2 text-xs font-medium rounded-sm hover:bg-muted transition-colors disabled:opacity-40"
        >
          Store Performance
        </button>
        <button
          id="export-products-csv"
          onClick={exportProductsCSV}
          disabled={!productData}
          className="text-left px-3 py-2 text-xs font-medium rounded-sm hover:bg-muted transition-colors disabled:opacity-40"
        >
          Best Sellers
        </button>
        <button
          id="export-slowmovers-csv"
          onClick={exportSlowMoversCSV}
          disabled={!productData}
          className="text-left px-3 py-2 text-xs font-medium rounded-sm hover:bg-muted transition-colors disabled:opacity-40"
        >
          Slow Movers
        </button>
        <button
          id="export-payments-csv"
          onClick={exportPaymentsCSV}
          disabled={!paymentData}
          className="text-left px-3 py-2 text-xs font-medium rounded-sm hover:bg-muted transition-colors disabled:opacity-40"
        >
          Payment Distribution
        </button>
        <div className="border-t border-border my-1" />
        <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          PDF
        </p>
        <button
          id="export-print-pdf"
          onClick={exportPrint}
          className="text-left px-3 py-2 text-xs font-medium rounded-sm hover:bg-muted transition-colors"
        >
          Print / Save as PDF
        </button>
      </div>
    </div>
  )
}
