'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { TrendType } from '@/lib/ideaData'

interface TrendIndicatorProps {
  trend: TrendType
  pct: number
  niche?: string
  city?: string
}

const TREND_CONFIG: Record<
  TrendType,
  {
    icon: typeof TrendingUp
    bg: string
    border: string
    text: string
    label: string
    arrow: string
    desc: string
  }
> = {
  growing: {
    icon: TrendingUp,
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    text: 'text-green-600 dark:text-green-400',
    label: 'Growing',
    arrow: '↑',
    desc: 'accelerating'
  },
  stable: {
    icon: Minus,
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    text: 'text-yellow-600 dark:text-yellow-400',
    label: 'Stable',
    arrow: '→',
    desc: 'holding steady'
  },
  declining: {
    icon: TrendingDown,
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    text: 'text-red-600 dark:text-red-400',
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
      className={`inline-flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${c.bg} ${c.border}`}
    >
      <Icon size={16} className={c.text} />
      <div>
        <span className={`font-bold ${c.text}`}>
          {c.label} {c.arrow} {pct}% YoY
        </span>
        {niche && city && (
          <span className="ml-2 text-xs text-muted-foreground">
            Demand for {niche} in {city} is {c.desc}
          </span>
        )}
      </div>
    </div>
  )
}
