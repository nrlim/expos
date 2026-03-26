'use client'

import { useCallback, useRef, useState, useEffect } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

interface ChartData {
  date: string
  revenue: number
  transactions: number
}

interface Props {
  data: ChartData[]
}

const STROKE = '#818cf8'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded-lg shadow-xl shadow-black/20">
        <p className="text-xs font-bold text-muted-foreground mb-2">{label}</p>
        <p className="text-sm font-bold text-[#818cf8]">
          Rp {payload[0].value.toLocaleString()}
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">
          {payload[1]?.value || 0} transactions
        </p>
      </div>
    )
  }
  return null
}

export default function RevenueChart({ data }: Props) {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null)
  const observerRef = useRef<ResizeObserver | null>(null)

  const containerRef = useCallback((el: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }
    if (!el) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          setSize({ width: Math.floor(width), height: Math.floor(height) })
        }
      }
    })
    observer.observe(el)
    observerRef.current = observer

    const rect = el.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      setSize({ width: Math.floor(rect.width), height: Math.floor(rect.height) })
    }
  }, [])

  useEffect(() => () => { observerRef.current?.disconnect() }, [])

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[280px] sm:h-[320px] flex items-center justify-center flex-col gap-2">
        <div className="w-10 h-10 rounded-full bg-muted/10 border border-border flex items-center justify-center text-muted-foreground">
          <svg className="w-5 h-5 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <p className="text-xs text-muted-foreground font-semibold">Not enough data to display sales timeframe.</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full h-[280px] sm:h-[320px]">
      {size && (
        <AreaChart
          width={size.width}
          height={size.height}
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={STROKE} stopOpacity={0.3} />
              <stop offset="95%" stopColor={STROKE} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            dy={10}
            minTickGap={20}
          />
          <YAxis
            yAxisId="left"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickFormatter={(value) => `Rp${value / 1000}k`}
            dx={0}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            hide={true}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            stroke={STROKE}
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorRevenue)"
            activeDot={{ r: 5, fill: STROKE, stroke: '#0f172a', strokeWidth: 2 }}
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="transactions"
            stroke="none"
            fill="none"
            activeDot={false}
          />
        </AreaChart>
      )}
    </div>
  )
}
