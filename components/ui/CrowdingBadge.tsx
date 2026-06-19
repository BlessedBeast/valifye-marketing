import { cn } from '@/lib/utils'

export type CrowdingIntensity = 'Low' | 'Medium' | 'High' | 'Extreme'
export type CrowdingBadgeSize = 'sm' | 'md' | 'lg'

export interface CrowdingBadgeProps {
  intensity: CrowdingIntensity
  label: string
  size?: CrowdingBadgeSize
  className?: string
}

const INTENSITY_STYLES: Record<CrowdingIntensity, string> = {
  Low: 'border-emerald-500/40 bg-emerald-500/[0.08] text-emerald-200',
  Medium: 'border-amber-500/40 bg-amber-500/[0.08] text-amber-200',
  High: 'border-orange-500/40 bg-orange-500/[0.08] text-orange-200',
  Extreme: 'border-red-500/40 bg-red-500/[0.08] text-red-200'
}

const INTENSITY_DOT: Record<CrowdingIntensity, string> = {
  Low: 'bg-emerald-500 shadow-[0_0_8px_-2px_rgba(16,185,129,0.65)]',
  Medium: 'bg-amber-500 shadow-[0_0_8px_-2px_rgba(245,158,11,0.65)]',
  High: 'bg-orange-500 shadow-[0_0_8px_-2px_rgba(249,115,22,0.65)]',
  Extreme: 'bg-red-500 shadow-[0_0_8px_-2px_rgba(239,68,68,0.65)]'
}

const SIZE_STYLES: Record<CrowdingBadgeSize, { badge: string; dot: string }> = {
  sm: {
    badge:
      'gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide',
    dot: 'h-1.5 w-1.5 rounded-full'
  },
  md: {
    badge:
      'gap-2 rounded-md border px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide',
    dot: 'h-2 w-2 rounded-full'
  },
  lg: {
    badge:
      'gap-2.5 rounded-md border px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.16em]',
    dot: 'h-2.5 w-2.5 rounded-full'
  }
}

export function CrowdingBadge({
  intensity,
  label,
  size = 'md',
  className
}: CrowdingBadgeProps) {
  const styles = SIZE_STYLES[size]

  return (
    <span
      role="status"
      aria-label={`${intensity} crowding: ${label}`}
      className={cn(
        'inline-flex max-w-full items-center',
        styles.badge,
        INTENSITY_STYLES[intensity],
        className
      )}
    >
      <span
        aria-hidden
        className={cn('shrink-0', styles.dot, INTENSITY_DOT[intensity])}
      />
      <span>{label}</span>
    </span>
  )
}
