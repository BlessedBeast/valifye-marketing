import { cn } from '@/lib/utils'

export type MetricsBadgeVariant = 'positive' | 'neutral' | 'negative'

export interface MetricsBadgeProps {
  label: string
  value: string
  variant: MetricsBadgeVariant
  className?: string
}

const VARIANT_STYLES: Record<MetricsBadgeVariant, string> = {
  positive: 'border-emerald-500/40 bg-emerald-500/[0.08] text-emerald-200',
  neutral: 'border-zinc-600/40 bg-zinc-800/60 text-zinc-300',
  negative: 'border-red-500/40 bg-red-500/[0.08] text-red-200'
}

export function MetricsBadge({
  label,
  value,
  variant,
  className
}: MetricsBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide',
        VARIANT_STYLES[variant],
        className
      )}
    >
      <span className="text-zinc-500">{label}</span>
      <span aria-hidden className="text-zinc-600">
        ·
      </span>
      <span>{value}</span>
    </span>
  )
}
