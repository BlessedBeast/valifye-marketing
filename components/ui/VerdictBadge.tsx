import { cn } from '@/lib/utils'

export type VerdictType = 'BUILD' | 'PIVOT' | 'KILL'
export type VerdictBadgeSize = 'sm' | 'md' | 'lg'

export interface VerdictBadgeProps {
  verdict: VerdictType
  size?: VerdictBadgeSize
  className?: string
}

const VERDICT_STYLES: Record<VerdictType, string> = {
  BUILD: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200',
  PIVOT: 'border-amber-500/50 bg-amber-500/10 text-amber-200',
  KILL: 'border-red-500/50 bg-red-500/10 text-red-200'
}

const VERDICT_GLOW: Record<VerdictType, string> = {
  BUILD: 'shadow-[0_0_60px_-12px_rgba(16,185,129,0.55)]',
  PIVOT: 'shadow-[0_0_56px_-12px_rgba(245,158,11,0.45)]',
  KILL: 'shadow-[0_0_56px_-12px_rgba(239,68,68,0.45)]'
}

const SIZE_STYLES: Record<VerdictBadgeSize, string> = {
  sm: 'rounded border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em]',
  md: 'rounded border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.24em]',
  lg: 'rounded border-2 px-6 py-3 font-mono text-xl font-black uppercase tracking-[0.35em] md:text-2xl md:tracking-[0.42em]'
}

export function VerdictBadge({
  verdict,
  size = 'md',
  className
}: VerdictBadgeProps) {
  return (
    <span
      role="status"
      className={cn(
        'inline-flex shrink-0 items-center justify-center',
        SIZE_STYLES[size],
        VERDICT_STYLES[verdict],
        size === 'lg' && VERDICT_GLOW[verdict],
        className
      )}
    >
      {verdict}
    </span>
  )
}
