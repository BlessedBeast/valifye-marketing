import { cn } from '@/lib/utils'

export type FeasibilityZone = 'Opportunity' | 'Caution' | 'Saturated' | 'Avoid'
export type FeasibilityZoneBadgeSize = 'sm' | 'md' | 'lg'

export interface FeasibilityZoneBadgeProps {
  zone: FeasibilityZone
  size?: FeasibilityZoneBadgeSize
  className?: string
}

const ZONE_STYLES: Record<FeasibilityZone, string> = {
  Opportunity: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200',
  Caution: 'border-amber-500/50 bg-amber-500/10 text-amber-200',
  Saturated: 'border-orange-500/50 bg-orange-500/10 text-orange-200',
  Avoid: 'border-red-500/50 bg-red-500/10 text-red-200'
}

const ZONE_GLOW: Record<FeasibilityZone, string> = {
  Opportunity: 'shadow-[0_0_60px_-12px_rgba(16,185,129,0.55)]',
  Caution: 'shadow-[0_0_56px_-12px_rgba(245,158,11,0.45)]',
  Saturated: 'shadow-[0_0_56px_-12px_rgba(249,115,22,0.45)]',
  Avoid: 'shadow-[0_0_56px_-12px_rgba(239,68,68,0.45)]'
}

const SIZE_STYLES: Record<FeasibilityZoneBadgeSize, string> = {
  sm: 'rounded border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em]',
  md: 'rounded border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.24em]',
  lg: 'rounded border-2 px-6 py-3 font-mono text-xl font-black uppercase tracking-[0.35em] md:text-2xl md:tracking-[0.42em]'
}

export function FeasibilityZoneBadge({
  zone,
  size = 'md',
  className
}: FeasibilityZoneBadgeProps) {
  return (
    <span
      role="status"
      className={cn(
        'inline-flex shrink-0 items-center justify-center',
        SIZE_STYLES[size],
        ZONE_STYLES[zone],
        size === 'lg' && ZONE_GLOW[zone],
        className
      )}
    >
      {zone}
    </span>
  )
}
