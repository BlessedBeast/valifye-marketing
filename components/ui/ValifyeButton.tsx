'use client'

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ValifyeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const ValifyeButton = forwardRef<HTMLButtonElement, ValifyeButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none',
        variant === 'default' &&
          'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20',
        variant === 'outline' &&
          'border border-border text-foreground hover:bg-card bg-transparent',
        variant === 'ghost' &&
          'text-muted-foreground hover:text-foreground hover:bg-muted/30',
        size === 'sm' && 'h-9 px-4 text-sm',
        size === 'md' && 'h-11 px-5 text-sm',
        size === 'lg' && 'h-14 px-8 text-base',
        className
      )}
      {...props}
    />
  )
)

ValifyeButton.displayName = 'ValifyeButton'

export { ValifyeButton }
