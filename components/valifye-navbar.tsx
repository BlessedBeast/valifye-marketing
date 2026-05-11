'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown, Library, MapPin, Shield } from 'lucide-react'
import { useTheme } from 'next-themes'
import { ThemeToggle } from '@/components/theme-toggle'

const vaultLinks = [
  {
    href: '/local-market-scout',
    label: 'Local Market Scout',
    description: 'Brick & Mortar Business Audits.',
    Icon: MapPin,
    accent: 'text-amber-300'
  },
  {
    href: '/digital-battlefield',
    label: 'Digital Battlefield',
    description: 'SaaS & AI Competitive Intel.',
    Icon: Shield,
    accent: 'text-cyan-300'
  },
  {
    href: '/reports',
    label: 'The Vault Home',
    description: 'Browse all Forensic Intelligence.',
    Icon: Library,
    accent: 'text-emerald-300'
  }
]

export function ValifyeNavbar() {
  const { resolvedTheme } = useTheme()

  const isDark = resolvedTheme !== 'light'
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
        <div className="group relative">
          <button
            type="button"
            className="inline-flex items-center gap-2 border border-border bg-card px-3 py-1 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary hover:text-primary group-focus-within:border-primary group-focus-within:text-primary"
            aria-haspopup="true"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Forensic Vault
            <ChevronDown className="h-3 w-3 transition-transform group-hover:rotate-180 group-focus-within:rotate-180" />
          </button>

          <div className="invisible absolute right-0 top-full z-50 mt-3 w-[340px] translate-y-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
            <div className="overflow-hidden rounded-lg border border-zinc-800/90 bg-slate-950/90 p-2 shadow-[0_20px_80px_-24px_rgba(0,0,0,0.9),0_0_40px_-18px_rgba(16,185,129,0.45)] backdrop-blur-xl">
              <div className="border-b border-zinc-800/80 px-3 py-2">
                <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Live Intelligence
                </p>
              </div>

              <div className="py-2">
                {vaultLinks.map(({ href, label, description, Icon, accent }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group/item flex items-start gap-3 rounded-md px-3 py-3 transition-colors hover:bg-white/[0.04] focus:bg-white/[0.04] focus:outline-none"
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900/80">
                      <Icon className={`h-4 w-4 ${accent}`} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-bold uppercase tracking-[0.18em] text-zinc-100 transition-colors group-hover/item:text-primary">
                        {label}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-zinc-500">
                        {description}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
        <ThemeToggle />
      </nav>
    </header>
  )
}