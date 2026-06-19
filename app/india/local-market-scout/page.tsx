import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin } from 'lucide-react'

import { MarketingShell } from '@/components/MarketingShell'
import { FeasibilityZoneBadge } from '@/components/ui/FeasibilityZoneBadge'
import {
  getIndiaLocalFeasibilityHubRows,
  indiaLocalFeasibilityPath
} from '@/lib/indiaLocalFeasibilityData'
import { buildCanonical } from '@/lib/seo'

const PAGE_TITLE = 'India Local Market Scout Reports'
const PAGE_DESCRIPTION =
  'Forensic local business feasibility scans for Indian cities — café, gym, clinic, turf, and franchise viability with regulatory context, crowding signals, and category benchmarks.'

export const revalidate = 3600

export const metadata: Metadata = {
  title: `${PAGE_TITLE} | Valifye`,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: buildCanonical('/india/local-market-scout')
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    type: 'website',
    url: buildCanonical('/india/local-market-scout')
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION
  }
}

export default async function IndiaLocalMarketScoutHubPage() {
  const rows = await getIndiaLocalFeasibilityHubRows()

  return (
    <MarketingShell className="max-w-6xl gap-10">
      <header className="space-y-4">
        <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-amber-400/90">
          <MapPin className="h-3.5 w-3.5" aria-hidden />
          Valifye India · Local Intelligence
        </p>
        <h1 className="text-3xl font-black text-white md:text-4xl">
          India Local Market Scout Reports
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-500 md:text-base">
          {PAGE_DESCRIPTION}
        </p>
        <p className="font-mono text-[11px] text-zinc-600">
          {rows.length} published {rows.length === 1 ? 'report' : 'reports'}
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950 px-6 py-10 text-center text-sm text-zinc-500">
          No published India local feasibility reports yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => {
            const location = row.state_or_region
              ? `${row.city_name}, ${row.state_or_region}`
              : row.city_name

            return (
              <Link
                key={row.slug}
                href={indiaLocalFeasibilityPath(row.slug)}
                className="group block rounded-xl border border-zinc-800 bg-zinc-950 p-5 transition-all hover:border-amber-500/40 hover:bg-zinc-900"
              >
                <div className="mb-3">
                  <FeasibilityZoneBadge zone={row.feasibility_zone} size="sm" />
                </div>
                <h2 className="mb-1 text-base font-bold text-zinc-50 transition-colors group-hover:text-amber-400">
                  {row.business_type}
                </h2>
                <p className="text-sm leading-relaxed text-zinc-500">{location}</p>
                <span className="mt-4 inline-flex items-center gap-1 font-mono text-[11px] tracking-wide text-amber-400">
                  VIEW REPORT
                  <span
                    className="transition-transform group-hover:translate-x-1"
                    aria-hidden
                  >
                    →
                  </span>
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </MarketingShell>
  )
}
