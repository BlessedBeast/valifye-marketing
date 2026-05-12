'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'

const solutionFooterLinks = [
  { href: '/solutions/before-signing-lease', label: 'Before Signing a Lease' },
  { href: '/solutions/pre-burn-saas-audit', label: 'Pre-Burn SaaS Audit' }
] as const

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
      <div className="mx-auto flex max-w-[1280px] flex-col gap-10 px-6 py-8">
        <div className="flex flex-col items-center gap-3 text-center">
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
        </div>

        <div className="grid w-full grid-cols-1 gap-10 border-t border-zinc-800/50 pt-10 sm:grid-cols-2 md:grid-cols-3 md:gap-12">
          <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-400/90">
              Solutions
            </p>
            <ul className="flex flex-col gap-3">
              {solutionFooterLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-400/90">
              Explore
            </p>
            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  href="/local-reports"
                  className="text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
                >
                  Local Reports
                </Link>
              </li>
              <li>
                <Link
                  href="/ideas"
                  className="text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
                >
                  Market Database
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500">
              Legal
            </p>
            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  href="/privacy"
                  className="text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <a
                  href="mailto:hello@valifye.com"
                  className="text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800/50 pt-8 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
          © {new Date().getFullYear()} Valifye. All systems operational.
        </div>
      </div>
    </footer>
  )
}