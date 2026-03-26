'use client'

import { useState, useCallback, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import type { StoreMetric } from '../types'
import { useReportsContext } from './ReportsContext'
import { useContainerSize } from './useContainerSize'

function fmtIDR(n: number) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}K`
  return `Rp ${n}`
}

function fmtIDRFull(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n)
}

const COLORS = { sales: '#0d9488', profit: '#334155' }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border p-3 rounded-sm shadow-xl">
        <p className="text-[10px] font-bold text-muted-foreground mb-2">{label}</p>
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center gap-2 text-xs font-semibold" style={{ color: p.fill }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
            {p.name}: {fmtIDRFull(p.value)}
          </div>
        ))}
      </div>
    )
  }
  return null
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props { qs?: string }

export default function StoreSection() {
  const { qs } = useReportsContext()
  const [stores, setStores] = useState<StoreMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { ref: chartRef, size: chartSize } = useContainerSize()

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/reports/stores?${qs}`)
      if (!res.ok) throw new Error()
      setStores((await res.json()).stores)
    } catch {
      setError('Failed to load store data.')
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

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-64 animate-pulse bg-muted/10 rounded card" />
        <div className="h-48 animate-pulse bg-muted/10 rounded card" />
      </div>
    )
  }

  if (stores.length === 0) {
    return (
      <div className="card flex items-center justify-center h-48 text-xs text-muted-foreground">
        No store data available for this period.
      </div>
    )
  }

  const totalGross = stores.reduce((s, x) => s + x.grossSales, 0)
  const chartData = stores.map((s) => ({
    name: s.storeName.length > 14 ? s.storeName.slice(0, 13) + '…' : s.storeName,
    'Gross Sales': s.grossSales,
    'Net Profit': s.netProfit,
  }))

  return (
    <div className="space-y-5">
      {/* Ranking table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border bg-muted/5">
          <h2 className="text-xs font-bold text-foreground">Store Ranking</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Ranked by gross sales — period total: {fmtIDRFull(totalGross)}
          </p>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Store</th>
              <th>Location</th>
              <th className="text-right">Gross Sales</th>
              <th className="text-right">COGS</th>
              <th className="text-right">Net Profit</th>
              <th className="text-right">Margin</th>
              <th className="text-right">Transactions</th>
              <th>Share</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((s, i) => {
              const share = totalGross > 0 ? (s.grossSales / totalGross) * 100 : 0
              return (
                <tr key={s.storeId}>
                  <td>
                    <span className={`font-bold text-xs ${i === 0 ? 'text-teal-500' : i === 1 ? 'text-slate-400' : 'text-muted-foreground'}`}>
                      #{i + 1}
                    </span>
                  </td>
                  <td className="font-semibold text-foreground">{s.storeName}</td>
                  <td className="text-muted-foreground">{s.location || '—'}</td>
                  <td className="text-right font-mono font-semibold text-teal-500">{fmtIDR(s.grossSales)}</td>
                  <td className="text-right font-mono text-muted-foreground">{fmtIDR(s.cogs)}</td>
                  <td className={`text-right font-mono font-semibold ${s.netProfit >= 0 ? 'text-foreground' : 'text-destructive'}`}>
                    {fmtIDR(s.netProfit)}
                  </td>
                  <td className="text-right">
                    <span className={`badge ${s.margin >= 20 ? 'badge-success' : s.margin >= 5 ? 'badge-warning' : 'badge-danger'}`}>
                      {s.margin.toFixed(1)}%
                    </span>
                  </td>
                  <td className="text-right text-muted-foreground">{s.txCount.toLocaleString()}</td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden w-16">
                        <div className="h-full bg-teal-500 rounded-full" style={{ width: `${share.toFixed(1)}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{share.toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Bar Chart */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border bg-muted/5 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-foreground">Revenue vs. Profit by Store</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">Side-by-side comparison</p>
          </div>
          <div className="flex items-center gap-3">
            {Object.entries(COLORS).map(([key, color]) => (
              <span key={key} className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: color }} />
                {key === 'sales' ? 'Gross Sales' : 'Net Profit'}
              </span>
            ))}
          </div>
        </div>
        <div className="p-5">
          <div ref={chartRef} className="h-64 w-full">
            {!chartSize ? (
              <div className="h-full animate-pulse bg-muted/10 rounded" />
            ) : (
              <BarChart
                width={chartSize.width}
                height={chartSize.height}
                data={chartData}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                barCategoryGap="30%"
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} tickFormatter={(v) => fmtIDR(v)} width={60} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.4 }} />
                <Bar dataKey="Gross Sales" fill={COLORS.sales} radius={[2, 2, 0, 0]} />
                <Bar dataKey="Net Profit" fill={COLORS.profit} radius={[2, 2, 0, 0]} />
              </BarChart>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
