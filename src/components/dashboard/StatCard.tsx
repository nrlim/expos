interface Props {
  label: string
  value: string
  delta?: string
  color?: 'brand' | 'success' | 'neutral' | 'accent' | 'warning' | 'danger'
}

const colorMap = {
  brand:   { dot: 'bg-indigo-500', value: 'text-indigo-400' },
  success: { dot: 'bg-emerald-500', value: 'text-emerald-400' },
  neutral: { dot: 'bg-slate-500', value: 'text-slate-300' },
  accent:  { dot: 'bg-cyan-500', value: 'text-cyan-400' },
  warning: { dot: 'bg-amber-500', value: 'text-amber-400' },
  danger:  { dot: 'bg-red-500', value: 'text-red-400' },
}

export default function StatCard({ label, value, delta, color = 'neutral' }: Props) {
  const { dot, value: valueColor } = colorMap[color]
  return (
    <div className="stat-card">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        <span className="stat-label">{label}</span>
      </div>
      <p className={`stat-value mt-1 ${valueColor}`}>{value}</p>
      {delta && <p className="stat-delta">{delta}</p>}
    </div>
  )
}
