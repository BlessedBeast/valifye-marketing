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
      <Link
        href="/"
        className="flex items-center gap-2 font-black uppercase text-foreground"
      >
        <Image
          src={logoSrc}
          alt="Valifye logo"
          width={64}
          height={64}
          className="-my-1 h-10 w-10 object-contain"
          priority
        />
        <span className="text-xl font-black uppercase tracking-[0.2em] text-foreground">
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
        <ThemeToggle />
      </nav>
    </header>
  )
}