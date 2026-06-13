'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

import { cn } from '@/lib/utils'

export type NavDropdownItem = {
  label: string
  href: string
  description: string
  icon: string
  /** Forensic Noir: emerald hover/active instead of default amber. */
  accent?: 'emerald'
}

export const INTELLIGENCE_NAV_ITEMS: NavDropdownItem[] = [
  {
    label: 'Ideas',
    href: '/ideas',
    description: 'Browse 500+ validated niches',
    icon: '🔍'
  },
  {
    label: 'Verdict Reports',
    href: '/reports',
    description: 'Full forensic audit results',
    icon: '📊'
  },
  {
    label: 'Local Reports',
    href: '/local-reports',
    description: 'City-level opportunity maps',
    icon: '🗺️'
  },
  {
    label: 'Compare',
    href: '/compare',
    description: 'Head-to-head market comparison',
    icon: '⚖️'
  },
  {
    label: 'Niche Profitability',
    href: '/profitable-niches',
    description: 'Cost-to-fee monetization viability scans',
    icon: '💰'
  },
  {
    label: 'Market Saturation Checks',
    href: '/market-saturation',
    description: 'Crowding density and defensive positioning',
    icon: '📉'
  },
  {
    label: 'Build/Kill Frameworks',
    href: '/build-verdicts',
    description: 'Core risk assessments before you ship',
    icon: '🎯'
  }
]

export const RESOURCES_NAV_ITEMS: NavDropdownItem[] = [
  {
    label: 'Forensic Blueprints',
    href: '/blueprints',
    description: 'A repository of scanned market signals and startup audits.',
    icon: '📐',
    accent: 'emerald'
  },
  {
    label: 'Showcase',
    href: '/showcase',
    description: 'Live report examples',
    icon: '🏆'
  },
  {
    label: 'Solutions',
    href: '/solutions',
    description: 'Use-case playbooks',
    icon: '💡'
  },
  {
    label: 'Markets',
    href: '/markets',
    description: 'Blueprint by region & sector',
    icon: '🗾'
  },
  {
    label: 'SaaS Verticals',
    href: '/saas-verticals',
    description: 'Sub-niche ideas by industry friction',
    icon: '🧩'
  },
  {
    label: 'Validation Guides',
    href: '/validation-guides',
    description: 'Smoke tests, landing pages, and pre-sales',
    icon: '📋'
  },
  {
    label: 'Hyper-Local Blueprints',
    href: '/local-opportunities',
    description: 'Regional demand gaps and cluster maps',
    icon: '📍'
  }
]

function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) return false
  if (pathname === href) return true
  if (href !== '/' && pathname.startsWith(`${href}/`)) return true
  return false
}

function DropdownItemLink({
  item,
  pathname
}: {
  item: NavDropdownItem
  pathname: string | null
}) {
  const active = isActivePath(pathname, item.href)
  const emerald = item.accent === 'emerald'
  return (
    <Link
      href={item.href}
      className={cn(
        'group flex gap-3 border-l-2 border-transparent px-3 py-3 transition-colors',
        'hover:bg-[#1a1a1a]',
        emerald
          ? 'hover:border-emerald-500/50'
          : 'hover:border-[#f5a623]'
      )}
    >
      <span className="shrink-0 text-base leading-none" aria-hidden>
        {item.icon}
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            'block font-mono text-xs font-bold uppercase tracking-wide transition-colors',
            active
              ? emerald
                ? 'text-emerald-400'
                : 'text-[#f5a623]'
              : cn(
                  'text-white',
                  emerald ? 'group-hover:text-emerald-400' : 'group-hover:text-[#f5a623]'
                )
          )}
        >
          {item.label}
        </span>
        <span className="mt-0.5 block font-mono text-[11px] leading-snug text-zinc-500 transition-colors group-hover:text-zinc-400">
          {item.description}
        </span>
      </span>
    </Link>
  )
}

export type NavbarDropdownProps = {
  label: string
  variant: 'mega' | 'simple'
  items: NavDropdownItem[]
  pathname: string | null
  align?: 'left' | 'right'
}

/**
 * Desktop dropdown: open on hover, animated panel.
 * Used inside a `relative` wrapper in the navbar.
 */
export function NavbarDropdown({
  label,
  variant,
  items,
  pathname,
  align = 'left'
}: NavbarDropdownProps) {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }, [])

  const scheduleClose = useCallback(() => {
    clearClose()
    closeTimer.current = setTimeout(() => setOpen(false), 120)
  }, [clearClose])

  useEffect(() => () => clearClose(), [clearClose])

  const engines = variant === 'mega' ? items.slice(0, 2) : items
  const analysis = variant === 'mega' ? items.slice(2) : []

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        clearClose()
        setOpen(true)
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          'inline-flex h-11 min-h-[44px] items-center gap-1.5 rounded-lg px-3 font-mono text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors',
          'hover:text-[#f5a623] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5a623]/40'
        )}
      >
        {label}
        <ChevronDown
          className={cn('h-3.5 w-3.5 shrink-0 transition-transform duration-200', open && 'rotate-180')}
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute top-full z-[70] mt-2 overflow-hidden rounded-xl border border-[#1f2937] bg-[#111111] shadow-2xl shadow-black/50',
              align === 'right' ? 'right-0' : 'left-0',
              variant === 'mega' ? 'w-[min(100vw-2rem,560px)]' : 'w-[min(100vw-2rem,320px)]'
            )}
          >
            {variant === 'mega' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2">
                <div className="border-b border-[#1f2937] p-3 sm:border-b-0 sm:border-r sm:p-4">
                  <p className="px-3 pb-2 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#6b7280]">
                    Engines
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {engines.map((item) => (
                      <DropdownItemLink key={item.href} item={item} pathname={pathname} />
                    ))}
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <p className="px-3 pb-2 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#6b7280]">
                    Analysis
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {analysis.map((item) => (
                      <DropdownItemLink key={item.href} item={item} pathname={pathname} />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-0.5 p-2">
                {items.map((item) => (
                  <DropdownItemLink key={item.href} item={item} pathname={pathname} />
                ))}
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
