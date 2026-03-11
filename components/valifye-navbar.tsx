'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { ThemeToggle } from '@/components/theme-toggle'

export function ValifyeNavbar() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = !mounted || resolvedTheme !== 'light'
  const logoSrc = isDark ? '/logo-dark.png' : '/logo-light.png'

  return (
    <header className="relative z-40 flex h-16 items-center justify-between border-b border-border bg-background px-6 font-mono">
      <Link
        href="/"
        className="flex items-center gap-3 font-black uppercase text-foreground"
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
        <span className="text-xl font-black uppercase tracking-widest text-foreground">
          Valifye
        </span>
      </Link>

      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center gap-6">
        <Link href="/#how-it-works" className="text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary">
          How it Works
        </Link>
        <Link href="/#pricing" className="text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary">
          Pricing
        </Link>
        <Link href="/#faq" className="text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary">
          FAQ
        </Link>
        <Link href="/ideas" className="border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:text-primary/80">
          Database
        </Link>
        <Link href="/local-reports" className="border border-border bg-card px-3 py-1 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary hover:text-primary">
          Local Reports
        </Link>
        <Link href="/reports" className="border border-border bg-card px-3 py-1 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary hover:text-primary">
          Validation Reports
        </Link>
        <ThemeToggle />
      </nav>
    </header>
  )
}