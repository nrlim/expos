'use client'

import { useState, useCallback, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip } from 'recharts'
import type { PaymentBucket } from '../types'
import { useReportsContext } from './ReportsContext'
import { useContainerSize } from './useContainerSize'

function fmtIDRFull(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n)
}

function fmtIDR(n: number) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}K`
  return `Rp ${n}`
}

const METHOD_COLORS: Record<string, string> = {
  CASH: '#0d9488',
  QRIS: '#334155',
  DEBIT: '#1e3a5f',
  CREDIT: '#64748b',
  UNKNOWN: '#94a3b8',
}

const METHOD_LABELS: Record<string, string> = {
  CASH: 'Cash',
  QRIS: 'QRIS',
  DEBIT: 'Debit Card',
  CREDIT: 'Credit Card',
  UNKNOWN: 'Not Specified',
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const d = payload[0].payload as PaymentBucket
    return (
      <div className="bg-card border border-border p-3 rounded-sm shadow-xl">
        <p className="text-[10px] font-bold text-muted-foreground mb-1">
          {METHOD_LABELS[d.method] ?? d.method}
        </p>
        <p className="text-sm font-bold text-foreground">{fmtIDRFull(d.amount)}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{d.pct}% · {d.count} transactions</p>
      </div>
    )
  }
  return null
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PaymentSection() {
  const { qs } = useReportsContext()
  const [data, setData] = useState<{ distribution: PaymentBucket[]; totalRevenue: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { ref: chartRef, size: chartSize } = useContainerSize()

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/reports/payments?${qs}`)
      if (!res.ok) throw new Error()
      setData(await res.json())
    } catch {
      setError('Failed to load payment data.')
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="h-72 animate-pulse bg-muted/10 rounded card" />
        <div className="h-72 animate-pulse bg-muted/10 rounded card" />
      </div>
    )
  }

  if (!data || data.distribution.length === 0) {
    return (
      <div className="card flex items-center justify-center h-48 text-xs text-muted-foreground">
        No payment data available. Ensure transactions include a payment method.
      </div>
    )
  }

  const { distribution, totalRevenue } = data
  const pieData = distribution.map((d) => ({
    ...d,
    name: METHOD_LABELS[d.method] ?? d.method,
    fill: METHOD_COLORS[d.method] ?? '#94a3b8',
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5">
      {/* Donut Chart */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border bg-muted/5">
          <h2 className="text-xs font-bold text-foreground">Distribution</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">By total revenue share</p>
        </div>
        <div className="p-5">
          {/* chart container — measured by useContainerSize */}
          <div ref={chartRef} className="h-64 w-full relative">
            {!chartSize ? (
              <div className="h-full animate-pulse bg-muted/10 rounded" />
            ) : (
              <>
                <PieChart width={chartSize.width} height={chartSize.height}>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={Math.floor(chartSize.height * 0.27)}
                    outerRadius={Math.floor(chartSize.height * 0.39)}
                    paddingAngle={3}
                    dataKey="amount"
                    strokeWidth={0}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
                {/* Center label — absolutely positioned overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total</p>
                  <p className="text-lg font-bold text-foreground">{fmtIDR(totalRevenue)}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border bg-muted/5">
          <h2 className="text-xs font-bold text-foreground">Payment Method Breakdown</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">Cash flow visibility by payment channel</p>
        </div>
        <div className="p-5 space-y-4">
          {distribution.map((d) => {
            const color = METHOD_COLORS[d.method] ?? '#94a3b8'
            const label = METHOD_LABELS[d.method] ?? d.method
            return (
              <div key={d.method}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-[2px] shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-xs font-semibold text-foreground">{label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-muted-foreground">{d.count} txns</span>
                    <span className="text-xs font-bold" style={{ color }}>{d.pct}%</span>
                    <span className="text-xs font-semibold text-foreground w-28 text-right">
                      {fmtIDRFull(d.amount)}
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${d.pct}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
        <div className="px-5 py-3 border-t border-border bg-muted/5 flex items-center justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Revenue</span>
          <span className="text-sm font-bold text-foreground">{fmtIDRFull(totalRevenue)}</span>
        </div>
      </div>
    </div>
  )
}
