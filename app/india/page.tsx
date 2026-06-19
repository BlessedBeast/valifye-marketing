import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Crosshair, Globe, MapPin } from 'lucide-react'

import { MarketingShell } from '@/components/MarketingShell'
import { buildCanonical, SITE_URL } from '@/lib/seo'

const PAGE_TITLE =
  'Valifye India — Business & SaaS Validation for the Indian Market'
const PAGE_DESCRIPTION =
  'India-specific forensic market intelligence for founders — local business feasibility scans across Tier 1 and Tier 2 cities, plus SaaS and software validation for Indian verticals. Validate before you build.'

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: buildCanonical('/india')
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    type: 'website',
    url: buildCanonical('/india'),
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 }]
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION
  }
}

const HUB_CARDS = [
  {
    href: '/india/local-market-scout',
    icon: MapPin,
    accentTag: 'text-amber-400/90',
    accentBorder: 'hover:border-amber-500/40',
    accentGlow: 'bg-amber-500/5',
    accentCta: 'text-amber-400',
    accentHoverTitle: 'group-hover:text-amber-400',
    subtext: 'Should I open this business, here, in India?',
    title: 'Local Market Scout',
    description:
      'Café, gym, clinic, turf, and franchise feasibility scans for Indian cities — regulatory roadmaps, local competition, and unit economics.',
    cta: 'Explore Local Scout'
  },
  {
    href: '/india/digital-battlefield',
    icon: Crosshair,
    accentTag: 'text-cyan-400/90',
    accentBorder: 'hover:border-cyan-500/40',
    accentGlow: 'bg-cyan-500/5',
    accentCta: 'text-cyan-400',
    accentHoverTitle: 'group-hover:text-cyan-400',
    subtext: 'Should I build this software, for India?',
    title: 'Digital Battlefield',
    description:
      'SaaS and software market validation specific to Indian verticals — society management, coaching platforms, GST billing, and more.',
    cta: 'Explore Digital Battlefield'
  }
] as const

const STAT_STRIP = [
  '6 SaaS verticals',
  '5 business categories',
  'Tier 1 & Tier 2 cities'
] as const

export default function IndiaHubPage() {
  return (
    <MarketingShell className="max-w-6xl gap-12">
      <header className="space-y-5 border-b border-zinc-800/80 pb-10">
        <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-400/90">
          <Globe className="h-3.5 w-3.5" aria-hidden />
          Valifye India
        </p>
        <h1 className="max-w-4xl font-serif text-3xl font-black tracking-tight text-zinc-50 md:text-5xl">
          Validate Before You Build — India Edition
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-zinc-400 md:text-base">
          Valifye now covers India-specific market intelligence for both digital and local
          business validation — forensic scans tuned to Indian cities, regulation, GST
          dynamics, and vertical demand before you commit capital or sign a lease.
        </p>
      </header>

      <section aria-labelledby="india-hubs-heading" className="space-y-6">
        <h2 id="india-hubs-heading" className="sr-only">
          India intelligence hubs
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {HUB_CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={`group relative block overflow-hidden rounded-2xl border border-zinc-800 bg-[#0d0d0d] p-7 transition-all duration-200 hover:bg-[#111111] ${card.accentBorder}`}
            >
              <div
                className={`pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full blur-2xl ${card.accentGlow}`}
                aria-hidden
              />
              <div className="relative mb-4 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950">
                  <card.icon className={`h-4 w-4 ${card.accentTag}`} aria-hidden />
                </span>
                <p
                  className={`font-mono text-[10px] font-semibold uppercase tracking-[0.2em] ${card.accentTag}`}
                >
                  {card.subtext}
                </p>
              </div>
              <h3
                className={`relative mb-3 text-2xl font-black text-zinc-50 transition-colors ${card.accentHoverTitle}`}
              >
                {card.title}
              </h3>
              <p className="relative mb-6 text-sm leading-relaxed text-zinc-500">
                {card.description}
              </p>
              <div
                className={`relative inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] ${card.accentCta}`}
              >
                {card.cta}
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section
        aria-label="India coverage summary"
        className="rounded-xl border border-zinc-800/90 bg-zinc-950/80 px-5 py-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] md:px-6"
      >
        <p className="text-center font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500 md:text-[11px]">
          Covering{' '}
          {STAT_STRIP.map((item, index) => (
            <span key={item}>
              {index > 0 ? (
                <span aria-hidden className="mx-2 text-zinc-700">
                  ·
                </span>
              ) : null}
              <span className="text-zinc-400">{item}</span>
            </span>
          ))}
        </p>
      </section>
    </MarketingShell>
  )
}
