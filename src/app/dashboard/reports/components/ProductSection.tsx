'use client'

import { useState, useCallback, useEffect } from 'react'
import type { ProductItem, SlowMover } from '../types'
import { useReportsContext } from './ReportsContext'

function fmtIDR(n: number) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}K`
  return `Rp ${n}`
}

function BestSellerTable({ items, rankBy }: { items: ProductItem[]; rankBy: 'volume' | 'profit' }) {
  const maxVal = items[0] ? (rankBy === 'volume' ? items[0].totalQty : items[0].grossProfit) : 1
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Product</th>
          <th>Category</th>
          <th className="text-right">Qty Sold</th>
          <th className="text-right">Revenue</th>
          <th className="text-right">Gross Profit</th>
          <th>Share</th>
        </tr>
      </thead>
      <tbody>
        {items.map((p, i) => {
          const barVal = rankBy === 'volume' ? p.totalQty : p.grossProfit
          const pct = maxVal > 0 ? (barVal / maxVal) * 100 : 0
          return (
            <tr key={p.productId}>
              <td>
                <span className={`font-bold text-xs ${i === 0 ? 'text-teal-500' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                  #{i + 1}
                </span>
              </td>
              <td>
                <div className="font-semibold text-foreground leading-tight">{p.name}</div>
                <div className="text-[10px] text-muted-foreground font-mono">{p.modelName}</div>
              </td>
              <td><span className="badge badge-neutral">{p.category}</span></td>
              <td className="text-right font-mono font-semibold">{p.totalQty.toLocaleString()}</td>
              <td className="text-right font-mono text-teal-500">{fmtIDR(p.totalRevenue)}</td>
              <td className={`text-right font-mono font-semibold ${p.grossProfit >= 0 ? 'text-foreground' : 'text-destructive'}`}>
                {fmtIDR(p.grossProfit)}
              </td>
              <td>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden w-20">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: `${pct.toFixed(0)}%` }} />
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function SlowMoversTable({ items }: { items: SlowMover[] }) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Category</th>
          <th className="text-right">In Stock</th>
          <th className="text-right">Stock Value</th>
          <th className="text-right">Days In Stock</th>
          <th>Risk Level</th>
        </tr>
      </thead>
      <tbody>
        {items.map((p) => {
          const risk = p.daysInStock > 90 ? 'Critical' : p.daysInStock > 45 ? 'High' : p.daysInStock > 21 ? 'Medium' : 'Low'
          const riskClass = risk === 'Critical' ? 'badge-danger' : risk === 'High' ? 'badge-warning' : risk === 'Medium' ? 'badge-brand' : 'badge-neutral'
          return (
            <tr key={p.productId}>
              <td>
                <div className="font-semibold text-foreground leading-tight">{p.name}</div>
                <div className="text-[10px] text-muted-foreground font-mono">{p.modelName}</div>
              </td>
              <td><span className="badge badge-neutral">{p.category}</span></td>
              <td className="text-right font-mono font-semibold text-amber-500">{p.stock.toLocaleString()}</td>
              <td className="text-right font-mono text-muted-foreground">{fmtIDR(p.stockValue)}</td>
              <td className="text-right font-mono text-foreground">{p.daysInStock}d</td>
              <td><span className={`badge ${riskClass}`}>{risk}</span></td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProductSection() {
  const { qs } = useReportsContext()
  const [data, setData] = useState<{ byVolume: ProductItem[]; byProfit: ProductItem[]; slowMovers: SlowMover[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [view, setView] = useState<'volume' | 'profit' | 'slow'>('volume')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/reports/products?${qs}`)
      if (!res.ok) throw new Error()
      setData(await res.json())
    } catch {
      setError('Failed to load product data.')
    } finally {
      setLoading(false)
    }
  }, [qs])

  useEffect(() => { load() }, [load])

  if (error) {
    return (
      <div className="alert-error mb-4">
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {error}
      </div>
    )
  }

  if (loading) return <div className="h-64 animate-pulse bg-muted/10 rounded card" />

  if (!data) return null

  const views = [
    { id: 'volume', label: 'Best Sellers by Volume' },
    { id: 'profit', label: 'Best Sellers by Profit' },
    { id: 'slow', label: 'Slow Movers' },
  ] as const

  return (
    <div>
      <div className="flex gap-1 mb-4">
        {views.map((v) => (
          <button
            key={v.id}
            id={`product-tab-${v.id}`}
            onClick={() => setView(v.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors ${
              view === v.id
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {view === 'volume' && (
          <>
            <div className="px-5 py-3.5 border-b border-border bg-muted/5">
              <h2 className="text-xs font-bold text-foreground">Top 10 by Sales Volume</h2>
              <p className="text-[10px] text-muted-foreground mt-0.5">Products ranked by total units sold in the selected period</p>
            </div>
            {data.byVolume.length === 0
              ? <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">No sales recorded for this period.</div>
              : <BestSellerTable items={data.byVolume} rankBy="volume" />}
          </>
        )}
        {view === 'profit' && (
          <>
            <div className="px-5 py-3.5 border-b border-border bg-muted/5">
              <h2 className="text-xs font-bold text-foreground">Top 10 by Gross Profit Contribution</h2>
              <p className="text-[10px] text-muted-foreground mt-0.5">Products ranked by (Revenue — COGS) for the selected period</p>
            </div>
            {data.byProfit.length === 0
              ? <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">No sales recorded for this period.</div>
              : <BestSellerTable items={data.byProfit} rankBy="profit" />}
          </>
        )}
        {view === 'slow' && (
          <>
            <div className="px-5 py-3.5 border-b border-border bg-muted/5">
              <h2 className="text-xs font-bold text-foreground">Slow-Moving Stock</h2>
              <p className="text-[10px] text-muted-foreground mt-0.5">In-stock items with no sales during the selected period, sorted by age</p>
            </div>
            {data.slowMovers.length === 0
              ? <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">All in-stock items sold at least once during this period.</div>
              : <SlowMoversTable items={data.slowMovers} />}
          </>
        )}
      </div>
    </div>
  )
}
