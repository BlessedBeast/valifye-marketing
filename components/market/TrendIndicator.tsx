import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { TrendType } from '@/lib/ideaData'

interface TrendIndicatorProps {
  trend: TrendType
  pct: number
  niche: string
  city: string
}

const TREND_CONFIG: Record<
  TrendType,
  {
    icon: typeof TrendingUp
    color: string
    bg: string
    label: string
    arrow: string
    desc: string
  }
> = {
  growing: {
    icon: TrendingUp,
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
    label: 'Growing',
    arrow: '↑',
    desc: 'accelerating'
  },
  stable: {
    icon: Minus,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
    label: 'Stable',
    arrow: '→',
    desc: 'holding steady'
  },
  declining: {
    icon: TrendingDown,
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
    label: 'Declining',
    arrow: '↓',
    desc: 'contracting'
  }
}

export function TrendIndicator({
  trend,
  pct,
  niche,
  city
}: TrendIndicatorProps) {
  const c = TREND_CONFIG[trend]
  const Icon = c.icon

  return (
    <div
      className={`inline-flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${c.bg}`}
    >
      <Icon size={16} className={c.color} />
      <div>
        <span className={`font-bold ${c.color}`}>
          {c.label} {c.arrow} {pct}% YoY
        </span>
        <span className="ml-2 text-xs text-muted-foreground">
          Demand for {niche} in {city} is {c.desc}
        </span>
      </div>
    </div>
  )
}

