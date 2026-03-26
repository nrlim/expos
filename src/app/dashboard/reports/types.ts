// ─── Shared Report Types ──────────────────────────────────────────────────────

export interface SummaryData {
  grossSales: number
  totalCOGS: number
  netProfit: number
  txCount: number
  aov: number
  margin: number
  salesDeltaPct: number | null
  countDeltaPct: number | null
  timeline: { date: string; revenue: number; count: number }[]
}

export interface StoreMetric {
  storeId: string
  storeName: string
  location: string
  grossSales: number
  cogs: number
  netProfit: number
  txCount: number
  margin: number
}

export interface ProductItem {
  productId: string
  name: string
  modelName: string
  category: string
  totalQty: number
  totalRevenue: number
  totalCOGS: number
  grossProfit: number
}

export interface SlowMover {
  productId: string
  name: string
  modelName: string
  category: string
  stock: number
  stockValue: number
  daysInStock: number
}

export interface PaymentBucket {
  method: string
  amount: number
  count: number
  pct: number
}

export interface DateRange {
  from: string // YYYY-MM-DD
  to: string   // YYYY-MM-DD
  label: string
}
