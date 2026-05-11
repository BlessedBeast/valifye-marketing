import type { ReactNode } from 'react'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { ValifyeFooter } from '@/components/valifye-footer'
import { cn } from '@/lib/utils'

type MarketingShellProps = {
  children: ReactNode
  className?: string
}

export function MarketingShell({ children, className }: MarketingShellProps) {
  return (
    <div className="min-h-screen bg-background font-mono text-foreground">
      <ValifyeNavbar />
      <main
        className={cn(
          'mx-auto flex max-w-[1280px] flex-col gap-20 px-4 py-10 md:px-10 md:py-16 lg:py-20',
          className
        )}
      >
        {children}
      </main>
      <ValifyeFooter />
    </div>
  )
}
