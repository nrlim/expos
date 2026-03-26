'use client'

import { useState } from 'react'
import type { DateRange } from '../types'

// ─── Preset Definitions ───────────────────────────────────────────────────────

function fmt(d: Date) {
  return d.toISOString().slice(0, 10)
}

const PRESETS: { id: string; label: string; range: () => { from: string; to: string } }[] = [
  {
    id: 'today',
    label: 'Today',
    range: () => {
      const n = new Date()
      return { from: fmt(n), to: fmt(n) }
    },
  },
  {
    id: 'week',
    label: 'Last 7 Days',
    range: () => {
      const n = new Date()
      const s = new Date(n)
      s.setDate(n.getDate() - 6)
      return { from: fmt(s), to: fmt(n) }
    },
  },
  {
    id: 'mtd',
    label: 'This Month',
    range: () => {
      const n = new Date()
      const s = new Date(n.getFullYear(), n.getMonth(), 1)
      const e = new Date(n.getFullYear(), n.getMonth() + 1, 0)
      return { from: fmt(s), to: fmt(e) }
    },
  },
  {
    id: 'last30',
    label: 'Last 30 Days',
    range: () => {
      const n = new Date()
      const s = new Date(n)
      s.setDate(n.getDate() - 29)
      return { from: fmt(s), to: fmt(n) }
    },
  },
  {
    id: 'quarter',
    label: 'This Quarter',
    range: () => {
      const n = new Date()
      const q = Math.floor(n.getMonth() / 3)
      const s = new Date(n.getFullYear(), q * 3, 1)
      const e = new Date(n.getFullYear(), q * 3 + 3, 0)
      return { from: fmt(s), to: fmt(e) }
    },
  },
  {
    id: 'ytd',
    label: 'Year to Date',
    range: () => {
      const n = new Date()
      return { from: `${n.getFullYear()}-01-01`, to: fmt(n) }
    },
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  value: DateRange
  onChange: (range: DateRange) => void
}

export default function DateRangePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [customFrom, setCustomFrom] = useState(value.from)
  const [customTo, setCustomTo] = useState(value.to)

  function applyPreset(preset: (typeof PRESETS)[0]) {
    const r = preset.range()
    onChange({ from: r.from, to: r.to, label: preset.label })
    setCustomFrom(r.from)
    setCustomTo(r.to)
    setOpen(false)
  }

  function applyCustom() {
    if (!customFrom || !customTo || customFrom > customTo) return
    onChange({ from: customFrom, to: customTo, label: 'Custom Range' })
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        id="date-range-trigger"
        onClick={() => setOpen((o) => !o)}
        className="btn-ghost border border-border h-8 gap-2 flex items-center"
      >
        <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-xs font-semibold">{value.label}</span>
        <svg className="w-3 h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-40 w-72 card shadow-xl p-3 flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Presets</p>
            <div className="grid grid-cols-2 gap-1">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  id={`preset-${preset.id}`}
                  onClick={() => applyPreset(preset)}
                  className={`text-left px-2 py-1.5 text-xs font-semibold rounded-sm transition-colors ${
                    value.label === preset.label
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="border-t border-border pt-2 mt-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Custom Range</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="field-label">From</label>
                  <input
                    type="date"
                    className="field-input"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">To</label>
                  <input
                    type="date"
                    className="field-input"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                  />
                </div>
              </div>
              <button
                id="apply-custom-range"
                onClick={applyCustom}
                disabled={!customFrom || !customTo || customFrom > customTo}
                className="btn-primary w-full mt-2"
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
