'use client'

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ValifyeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'cyan' | 'destructive'
  size?: 'sm' | 'md' | 'lg' | 'xl'
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
        variant === 'cyan' &&
          'bg-cyan-500 text-zinc-950 hover:bg-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.45)] ring-1 ring-cyan-300/40',
        variant === 'destructive' &&
          'bg-rose-600 text-zinc-50 hover:bg-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.5)] ring-1 ring-rose-400/40',
        size === 'sm' && 'h-9 px-4 text-sm',
        size === 'md' && 'h-11 px-5 text-sm',
        size === 'lg' && 'h-14 px-8 text-base',
        size === 'xl' && 'h-16 px-10 text-base tracking-wide',
        className
      )}
      {...props}
    />
  )
)

ValifyeButton.displayName = 'ValifyeButton'

export { ValifyeButton }
