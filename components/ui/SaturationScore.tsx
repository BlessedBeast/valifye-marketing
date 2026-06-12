import { cn } from '@/lib/utils'

export type SaturationScoreSize = 'sm' | 'md' | 'lg'

export interface SaturationScoreProps {
  score: number
  size?: SaturationScoreSize
  className?: string
  label?: string
}

type ScoreBand = 'low' | 'mid' | 'high'

function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0
  return Math.min(10, Math.max(0, score))
}

function formatScore(score: number): string {
  return (Math.round(clampScore(score) * 10) / 10).toFixed(1)
}

/** Higher saturation = worse for entrants → red at high scores. */
function getScoreBand(score: number): ScoreBand {
  const clamped = clampScore(score)
  if (clamped < 4) return 'low'
  if (clamped < 7) return 'mid'
  return 'high'
}

const BAND_BAR_CLASS: Record<ScoreBand, string> = {
  low: 'bg-emerald-500 shadow-[0_0_24px_-4px_rgba(16,185,129,0.65)]',
  mid: 'bg-amber-500 shadow-[0_0_24px_-4px_rgba(245,158,11,0.65)]',
  high: 'bg-red-500 shadow-[0_0_24px_-4px_rgba(239,68,68,0.65)]'
}

const BAND_TEXT_CLASS: Record<ScoreBand, string> = {
  low: 'text-emerald-200',
  mid: 'text-amber-200',
  high: 'text-red-200'
}

const SIZE_STYLES: Record<
  SaturationScoreSize,
  { score: string; suffix: string; bar: string; label: string }
> = {
  sm: {
    score: 'text-sm font-black',
    suffix: 'text-[10px] font-semibold text-zinc-500',
    bar: 'h-1.5',
    label: 'text-[9px] tracking-[0.2em]'
  },
  md: {
    score: 'text-xl font-black md:text-2xl',
    suffix: 'text-sm font-semibold text-zinc-500',
    bar: 'h-2.5',
    label: 'text-[10px] tracking-[0.28em]'
  },
  lg: {
    score: 'text-2xl font-black md:text-3xl',
    suffix: 'text-base font-semibold text-zinc-500',
    bar: 'h-3',
    label: 'text-[11px] tracking-[0.32em]'
  }
}

export function SaturationScore({
  score,
  size = 'md',
  className,
  label = 'Saturation score'
}: SaturationScoreProps) {
  const clamped = clampScore(score)
  const band = getScoreBand(clamped)
  const display = formatScore(clamped)
  const pct = (clamped / 10) * 100
  const styles = SIZE_STYLES[size]

  return (
    <div className={cn('space-y-2', className)} aria-label={label}>
      <div className="flex items-end justify-between gap-3">
        <p
          className={cn(
            'font-mono font-bold uppercase text-zinc-500',
            styles.label
          )}
        >
          {label}
        </p>
        <p className="font-mono tabular-nums">
          <span className={cn(styles.score, BAND_TEXT_CLASS[band])}>
            {display}
          </span>
          <span className={styles.suffix}> / 10</span>
        </p>
      </div>
      <div
        className={cn(
          'overflow-hidden rounded-sm border border-zinc-800/90 bg-zinc-950',
          styles.bar
        )}
        role="meter"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={10}
        aria-label={`${label}: ${display} out of 10`}
      >
        <div
          className={cn(
            'h-full transition-[width] duration-500',
            BAND_BAR_CLASS[band]
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
