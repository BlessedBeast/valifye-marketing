'use client'

import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { HEAT_CONFIG, type HeatType } from '@/lib/ideaData'

export interface ValifyeBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Heat variant uses HEAT_CONFIG styles; 'default' uses primary theme */
  variant?: 'default' | HeatType
  /** Show a small dot indicator (w-1.5 h-1.5 rounded-full) inside the badge */
  showDot?: boolean
  children: React.ReactNode
}

const DEFAULT_CLASSES = 'bg-primary/10 text-primary border-primary/20'

function ValifyeBadge({
  className,
  variant = 'default',
  showDot = false,
  children,
  ...props
}: ValifyeBadgeProps) {
  const isHeat = variant !== 'default' && variant in HEAT_CONFIG
  const config = isHeat ? HEAT_CONFIG[variant as HeatType] : null
  const badgeClass = config ? config.badgeClass : DEFAULT_CLASSES
  const dotClass = config ? config.dotClass : 'bg-primary'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold',
        badgeClass,
        className
      )}
      {...props}
    >
      {showDot && (
        <span
          className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotClass)}
          aria-hidden
        />
      )}
      {children}
    </span>
  )
}

export { ValifyeBadge }
