'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
    </nav>
  )
}
