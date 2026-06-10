'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Settings } from 'lucide-react'

import { cn } from '@/lib/utils'

export type CommunityNavItem = {
  href: string
  label: string
}

type CommunitySidebarNavProps = {
  items: CommunityNavItem[]
}

function isNavActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false
  if (href === '/community') return pathname === '/community'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function CommunitySidebarNav({ items }: CommunitySidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-0.5 p-3">
      {items.map((item) => {
        const active = isNavActive(pathname, item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'rounded-lg px-3 py-2.5 font-mono text-xs uppercase tracking-wide transition-colors duration-150',
              active
                ? 'bg-amber-500/10 font-bold text-amber-500'
                : 'text-zinc-500 hover:bg-zinc-900/60 hover:text-amber-500'
            )}
          >
            {item.label}
          </Link>
        )
      })}

      <div className="my-1.5 border-t border-zinc-900" aria-hidden />

      <Link
        href="/community/settings"
        className={cn(
          'flex items-center gap-2 rounded-lg px-3 py-2.5 font-mono text-xs uppercase tracking-wide transition-colors duration-150',
          isNavActive(pathname, '/community/settings')
            ? 'bg-amber-500/10 font-bold text-amber-500'
            : 'text-zinc-500 hover:bg-zinc-900/60 hover:text-amber-500'
        )}
      >
        <Settings className="h-3.5 w-3.5" aria-hidden />
        Settings
      </Link>
    </nav>
  )
}
