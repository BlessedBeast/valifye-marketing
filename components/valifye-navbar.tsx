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

  const logoSrc =
    !mounted || resolvedTheme !== 'light'
      ? '/logo-dark.png'
      : '/logo-light.png'

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6 font-mono">
      <Link href="/" className="flex items-center gap-2 font-black uppercase tracking-widest text-foreground">
        <Image
          src={logoSrc}
          alt="Valifye logo"
          width={32}
          height={32}
          className="h-8 w-8"
          priority
        />
        Valifye
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
        <ThemeToggle />
      </nav>
    </header>
  )
}