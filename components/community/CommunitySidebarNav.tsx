'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Settings } from 'lucide-react'

import type { CommunitySpaceId } from '@/lib/community/constants'
import {
  getSettingsNavLinkClass,
  getSpaceNavLinkClass,
} from '@/lib/community/space-theme'

export type CommunityNavItem = {
  href: string
  label: string
  spaceId?: CommunitySpaceId
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
            className={getSpaceNavLinkClass(item.spaceId, active)}
          >
            {item.label}
          </Link>
        )
      })}

      <div className="my-1.5 border-t border-zinc-900" aria-hidden />

      <Link
        href="/community/settings"
        className={getSettingsNavLinkClass(isNavActive(pathname, '/community/settings'))}
      >
        <Settings className="h-3.5 w-3.5" aria-hidden />
        Settings
      </Link>
    </nav>
  )
}
