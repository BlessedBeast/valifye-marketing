import {
  Briefcase,
  Database,
  ShoppingBag,
  GraduationCap,
  AlertTriangle,
  TrendingUp
} from 'lucide-react'
import type { BusinessShape } from '@/lib/ideaData'

const SHAPE_CONFIG: Record<
  BusinessShape,
  {
    icon: typeof Briefcase
    color: string
    bg: string
    border: string
    strength: string
    suck: string
    strategy: string
  }
> = {
  Service: {
    icon: Briefcase,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    strength: 'High margins and low startup capital.',
    suck: 'Hiring is your bottleneck. You are the engine — if you stop, the business stops.',
    strategy:
      'Focus on standardizing operations so you can hire talent in {city} quickly.'
  },
  SaaS: {
    icon: Database,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    strength: 'Infinite scalability and high retention.',
    suck: 'Slowest start. High upfront cost and the Boulder effect — hard to get moving.',
    strategy:
      'Prioritize Product-Market Fit over growth. Once it rolls, it is unstoppable.'
  },
  'E-commerce': {
    icon: ShoppingBag,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    strength: 'Fast early growth and low operational friction.',
    suck: 'Inventory is a cash-flow killer. High dependency on shipping and supply chains.',
    strategy:
      'Master your unit economics and inventory turnover to survive growth spikes.'
  },
  Info: {
    icon: GraduationCap,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    strength: 'Highest speed to profit. No inventory or overhead.',
    suck: 'Zero retention. You are constantly creating your own competition by teaching them.',
    strategy:
      'Build a community layer to fix the retention leak and maintain authority.'
  }
}

interface Props {
  shape: BusinessShape
  niche: string
  city: string
}

export function BusinessDNA({ shape, niche, city }: Props) {
  const config = SHAPE_CONFIG[shape] || SHAPE_CONFIG.Service
  const Icon = config.icon

  return (
    <div
      className={`space-y-5 rounded-xl border ${config.border} ${config.bg} p-6`}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className={`rounded-lg border border-border bg-background/50 p-2.5 ${config.color}`}
        >
          <Icon size={22} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Business DNA
          </p>
          <p className="text-xl font-bold text-foreground">{shape} Shape</p>
        </div>
      </div>

      {/* Win / Suck grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex gap-3 rounded-xl border border-border/60 bg-background/30 p-4">
          <TrendingUp className="mt-0.5 shrink-0 text-green-400" size={18} />
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="mb-1 block font-bold text-green-400">
              The Win
            </span>
            {config.strength}
          </p>
        </div>
        <div className="flex gap-3 rounded-xl border border-border/60 bg-background/30 p-4">
          <AlertTriangle className="mt-0.5 shrink-0 text-red-400" size={18} />
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="mb-1 block font-bold text-red-400">
              The Suck
            </span>
            {config.suck}
          </p>
        </div>
      </div>

      {/* Strategic Verdict */}
      <div className="rounded-xl border border-border/60 bg-background/30 p-4">
        <p className="text-sm leading-relaxed italic text-muted-foreground">
          <span className="not-italic font-semibold text-foreground">
            Strategic Verdict:{' '}
          </span>
          {config.strategy.replace('{city}', city)}
        </p>
      </div>
    </div>
  )
}

