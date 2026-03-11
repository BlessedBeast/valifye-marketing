'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'

export function ValifyeFooter() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = !mounted || resolvedTheme !== 'light'
  const logoSrc = isDark ? '/logo-dark.png' : '/logo-light.png'

  return (
    <footer className="border-t border-border bg-card py-12 font-mono">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-6 px-6 py-8">
        <div className="flex items-center gap-3 font-black uppercase tracking-widest text-muted-foreground">
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden">
            <Image
              src={logoSrc}
              alt="Valifye logo"
              width={48}
              height={48}
              className={`h-10 w-10 object-cover object-center translate-y-[-1px] ${
                isDark ? 'mix-blend-screen' : 'mix-blend-multiply'
              }`}
            />
          </span>
          Valifye Intelligence
        </div>

        <nav className="flex flex-wrap justify-center gap-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <Link href="/local-reports" className="transition-colors hover:text-primary">
            Local Reports
          </Link>
          <Link href="/ideas" className="transition-colors hover:text-primary">
            Market Database
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-primary">
            Privacy Policy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-primary">
            Terms of Service
          </Link>
          <a href="mailto:hello@valifye.com" className="transition-colors hover:text-primary">
            Contact
          </a>
        </nav>

        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
          © {new Date().getFullYear()} Valifye. All systems operational.
        </div>
      </div>
    </footer>
  )
}