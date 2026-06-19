import { icons, Lock, type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

export type LockedModuleCardSize = 'default' | 'compact'

export interface LockedModuleCardProps {
  moduleNumber: number
  moduleName: string
  teaserLine: string
  icon: string
  size?: LockedModuleCardSize
  className?: string
}

function resolveLucideIcon(name: string): LucideIcon {
  const Icon = icons[name as keyof typeof icons]
  if (Icon && typeof Icon === 'function') {
    return Icon as LucideIcon
  }
  return Lock
}

function formatModuleLabel(moduleNumber: number): string {
  const padded = String(Math.max(0, Math.floor(moduleNumber))).padStart(2, '0')
  return `MODULE ${padded}`
}

export function LockedModuleCard({
  moduleNumber,
  moduleName,
  teaserLine,
  icon,
  size = 'default',
  className
}: LockedModuleCardProps) {
  const ModuleIcon = resolveLucideIcon(icon)
  const moduleLabel = formatModuleLabel(moduleNumber)
  const isCompact = size === 'compact'

  return (
    <article
      aria-label={`${moduleName} — locked module`}
      className={cn(
        'relative overflow-hidden border border-zinc-800 bg-black',
        'shadow-[inset_0_0_0_1px_rgba(245,158,11,0.08),inset_0_0_32px_-20px_rgba(245,158,11,0.18)]',
        isCompact ? 'px-4 py-5' : 'px-5 py-6 md:px-6 md:py-8',
        className
      )}
    >
      {!isCompact ? (
        <span
          aria-hidden
          className="pointer-events-none absolute -right-1 top-2 select-none font-mono text-6xl font-black leading-none tracking-tight text-zinc-900/80 md:text-7xl"
        >
          {String(Math.max(0, Math.floor(moduleNumber))).padStart(2, '0')}
        </span>
      ) : null}

      <Lock
        aria-hidden
        className={cn(
          'absolute text-primary/80',
          isCompact ? 'right-3 top-3 h-4 w-4' : 'right-4 top-4 h-5 w-5 md:h-6 md:w-6'
        )}
      />

      <div className={cn('relative space-y-3', !isCompact && 'pr-10')}>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
          {moduleLabel}
        </p>

        <div className="flex items-start gap-3">
          <span
            className={cn(
              'flex shrink-0 items-center justify-center rounded-sm border border-zinc-800 bg-zinc-950 text-primary/90',
              isCompact ? 'h-8 w-8' : 'h-9 w-9'
            )}
          >
            <ModuleIcon
              aria-hidden
              className={cn(isCompact ? 'h-4 w-4' : 'h-4 w-4 md:h-5 md:w-5')}
            />
          </span>

          <div className="min-w-0 space-y-2 opacity-80">
            <h3
              className={cn(
                'font-mono font-bold uppercase tracking-[0.12em] text-zinc-200',
                isCompact ? 'text-xs' : 'text-sm md:text-base'
              )}
            >
              {moduleName}
            </h3>
            <p
              className={cn(
                'leading-relaxed text-zinc-400',
                isCompact ? 'text-xs' : 'text-sm'
              )}
            >
              {teaserLine}
            </p>
          </div>
        </div>
      </div>

      <p
        className={cn(
          'relative mt-4 border-t border-zinc-800/90 pt-3 font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-primary/70',
          isCompact && 'mt-3 pt-2 text-[8px] tracking-[0.24em]'
        )}
      >
        UNLOCK IN FULL REPORT
      </p>
    </article>
  )
}
