'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { ThemeToggle } from '@/components/theme-toggle'

const navLinks = [
  { href: '/ideas', label: 'Ideas' },
  { href: '/reports', label: 'Reports' },
  { href: '/markets', label: 'Markets' },
  { href: '/tools/delivery-calculator', label: 'Tools' }
]

export function ValifyeNavbar() {
  const { resolvedTheme } = useTheme()
  const pathname = usePathname()

  const isDark = resolvedTheme !== 'light'
  const logoSrc = isDark ? '/logo-dark.png' : '/logo-light.png'

  return (
    <header className="relative z-40 border-b border-zinc-800/95 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 font-black uppercase tracking-tighter text-foreground"
        >
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden">
            <Image
              src={logoSrc}
              alt="Valifye logo"
              width={48}
              height={48}
              className={`h-10 w-10 object-cover object-center translate-y-[-1px] ${
                isDark ? 'mix-blend-screen' : 'mix-blend-multiply'
              }`}
              priority
            />
          </span>
          <span className="text-xl font-black uppercase tracking-tighter text-foreground">
            Valifye
          </span>
        </Link>

        <nav className="hidden items-center gap-3 md:flex">
          {navLinks.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(`${item.href}/`))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 font-mono text-xs font-bold uppercase tracking-[0.22em] transition-colors ${
                  isActive
                    ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-[0_0_18px_-6px_rgba(16,185,129,0.85)]'
                    : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                {item.label}
              </Link>
            )
          })}

          <Link
            href="/audit"
            className="ml-1 inline-flex items-center gap-2 rounded-md border border-emerald-400/70 bg-emerald-400 px-4 py-2 font-mono text-xs font-extrabold uppercase tracking-[0.18em] text-zinc-950 shadow-[0_0_28px_-6px_rgba(16,185,129,0.8)] transition-colors hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70"
          >
            Audit Your Idea
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}