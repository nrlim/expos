'use client'

import { useState, useCallback, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import type { SummaryData } from '../types'
import { useReportsContext } from './ReportsContext'
import { useContainerSize } from './useContainerSize'

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function DeltaBadge({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-[10px] text-muted-foreground">vs. prev. period</span>
  const up = pct >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${up ? 'text-success' : 'text-destructive'}`}>
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={up ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
      </svg>
      {Math.abs(pct).toFixed(1)}% vs. prev. period
    </span>
  )
}

function SkeletonCard() {
  return (
    <div className="stat-card animate-pulse">
      <div className="h-2 w-20 bg-muted-foreground/10 rounded mb-3" />
      <div className="h-6 w-32 bg-muted-foreground/10 rounded mb-2" />
      <div className="h-2 w-24 bg-muted-foreground/10 rounded" />
    </div>
  )
}

const KPI_COLOR = '#0d9488'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border p-3 rounded-sm shadow-xl">
        <p className="text-[10px] font-bold text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-bold" style={{ color: KPI_COLOR }}>{fmtIDRFull(payload[0]?.value ?? 0)}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{payload[1]?.value ?? 0} transactions</p>
      </div>
    )
  }
  return null
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SummarySection() {
  const { qs } = useReportsContext()
  const [data, setData] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { ref: chartRef, size: chartSize } = useContainerSize()

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/reports/summary?${qs}`)
      if (!res.ok) throw new Error()
      setData(await res.json())
    } catch {
      setError('Failed to load summary data.')
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

  const kpiCards = [
    {
      label: 'Gross Sales',
      value: data ? fmtIDR(data.grossSales) : '—',
      extra: <DeltaBadge pct={data?.salesDeltaPct ?? null} />,
      borderColor: 'border-l-teal-500',
      dot: 'bg-teal-500',
    },
    {
      label: 'Net Profit',
      value: data ? fmtIDR(data.netProfit) : '—',
      extra: data ? <span className="text-[10px] text-muted-foreground">Margin: {data.margin}%</span> : null,
      borderColor: 'border-l-slate-500',
      dot: 'bg-slate-500',
    },
    {
      label: 'Total Transactions',
      value: data ? data.txCount.toLocaleString() : '—',
      extra: <DeltaBadge pct={data?.countDeltaPct ?? null} />,
      borderColor: 'border-l-sky-500',
      dot: 'bg-sky-500',
    },
    {
      label: 'Avg. Order Value',
      value: data ? fmtIDR(data.aov) : '—',
      extra: null,
      borderColor: 'border-l-violet-500',
      dot: 'bg-violet-500',
    },
    {
      label: 'Total COGS (HPP)',
      value: data ? fmtIDR(data.totalCOGS) : '—',
      extra: data && data.grossSales > 0
        ? <span className="text-[10px] text-muted-foreground">{((data.totalCOGS / data.grossSales) * 100).toFixed(1)}% of gross</span>
        : null,
      borderColor: 'border-l-amber-500',
      dot: 'bg-amber-500',
    },
  ]

  return (
    <div>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          : kpiCards.map((kpi) => (
              <div key={kpi.label} className={`stat-card border-l-2 ${kpi.borderColor}`}>
                <div className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${kpi.dot}`} />
                  <span className="stat-label">{kpi.label}</span>
                </div>
                <p className="stat-value text-xl">{kpi.value}</p>
                <div className="stat-delta">{kpi.extra}</div>
              </div>
            ))}
      </div>

      {/* Revenue Timeline */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border bg-muted/5 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-foreground">Revenue Timeline</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">Daily gross sales for the selected period</p>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
            <span className="w-3 h-[2px] rounded-full" style={{ backgroundColor: KPI_COLOR }} />
            Revenue
          </span>
        </div>
        <div className="p-5 bg-card">
          {/* chart container — measured by useContainerSize */}
          <div ref={chartRef} className="h-64 w-full">
            {loading || !chartSize ? (
              <div className="h-full animate-pulse bg-muted/10 rounded" />
            ) : !data || data.timeline.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                No transaction data for this period.
              </div>
            ) : (
              <AreaChart
                width={chartSize.width}
                height={chartSize.height}
                data={data.timeline}
                margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={KPI_COLOR} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={KPI_COLOR} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis
                  dataKey="date"
                  axisLine={false} tickLine={false}
                  tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
                  tickFormatter={(v) => {
                    const d = new Date(v + 'T00:00:00')
                    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                  }}
                  minTickGap={24} dy={8}
                />
                <YAxis
                  axisLine={false} tickLine={false}
                  tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
                  tickFormatter={(v) => fmtIDR(v)}
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border)', strokeWidth: 1 }} />
                <Area
                  type="monotone" dataKey="revenue"
                  stroke={KPI_COLOR} strokeWidth={2}
                  fillOpacity={1} fill="url(#revGrad)"
                  activeDot={{ r: 4, fill: KPI_COLOR, stroke: 'var(--card)', strokeWidth: 2 }}
                />
              </AreaChart>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
