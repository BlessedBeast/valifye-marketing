import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Crosshair, MapPin } from 'lucide-react'

import { MarketingShell } from '@/components/MarketingShell'
import {
  deriveHubTitleFromRows,
  extractGlobalRegionHubCode,
  formatSectorLabel
} from '@/lib/marketsStateHub'
import { buildCanonical } from '@/lib/seo'
import { buildMarketPath } from '@/lib/slugify'
import { createClient } from '@/utils/supabase/server'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type BlueprintRow = {
  region_key: string
  region_label: string | null
  sector: string
  business_model: string
  meta_title: string
}

type Props = { params: Promise<{ state_code: string }> }

/** URL segment: 2–3 letter region code (e.g. tx, on, lnd, dxb). */
function normalizeHubParam(raw: string): string | null {
  const s = decodeURIComponent(raw ?? '')
    .trim()
    .toUpperCase()
  if (!/^[A-Z]{2,3}$/.test(s)) return null
  return s
}

async function fetchBlueprintsForHub(
  hubCodeUpper: string
): Promise<BlueprintRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('local_business_blueprints')
    .select('region_key, region_label, sector, business_model, meta_title')
    .eq('status', 'published')
    .limit(10000)

  if (error) {
    console.error('[markets/state] fetch:', error.message)
    return []
  }
  const rows = Array.isArray(data) ? (data as BlueprintRow[]) : []
  return rows.filter((r) => extractGlobalRegionHubCode(r.region_key) === hubCodeUpper)
}

function sectionGroupKey(row: BlueprintRow): string {
  const label = row.region_label?.trim()
  return label || row.region_key
}

function groupByLabelOrRegionKey(rows: BlueprintRow[]): Map<string, BlueprintRow[]> {
  const map = new Map<string, BlueprintRow[]>()
  for (const row of rows) {
    const key = sectionGroupKey(row)
    const list = map.get(key)
    if (list) list.push(row)
    else map.set(key, [row])
  }
  for (const [, list] of map) {
    list.sort((a, b) => a.meta_title.localeCompare(b.meta_title))
  }
  return map
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state_code } = await params
  const hub = normalizeHubParam(state_code)
  if (!hub) {
    return { title: 'Market hubs | Valifye' }
  }
  const rows = await fetchBlueprintsForHub(hub)
  const hubTitle = deriveHubTitleFromRows(rows, hub)
  const title = `${hubTitle} Market Intelligence | Valifye`
  const description = `Forensic local business blueprints and market intelligence indexed for ${hubTitle}.`
  const path = `/markets/state/${hub.toLowerCase()}`
  const canonical = buildCanonical(path)
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonical
    }
  }
}

export default async function MarketsStateHubPage({ params }: Props) {
  const { state_code } = await params
  const hub = normalizeHubParam(state_code)
  if (!hub) {
    notFound()
  }

  const rows = await fetchBlueprintsForHub(hub)
  const bySection = groupByLabelOrRegionKey(rows)
  const sectionKeys = [...bySection.keys()].sort((a, b) => a.localeCompare(b))
  const uniqueRegionKeys = new Set(rows.map((r) => r.region_key)).size
  const hubTitle = deriveHubTitleFromRows(rows, hub)

  return (
    <MarketingShell className="max-w-4xl gap-12 px-4 py-10 md:px-8 md:py-14">
      <div className="mx-auto w-full max-w-4xl space-y-10">
        <nav className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          <Link href="/markets" className="text-zinc-400 hover:text-amber-500/90">
            Markets
          </Link>
          <span className="mx-2 text-zinc-700">/</span>
          <span className="text-zinc-300">{hubTitle}</span>
        </nav>

        <header className="space-y-6 border-b border-zinc-800/80 pb-10">
          <p className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500">
            <Crosshair className="h-3.5 w-3.5 text-amber-500/90" aria-hidden />
            Regional intelligence hub
          </p>
          <div className="space-y-3">
            <h1 className="font-serif text-3xl font-black leading-tight tracking-tight text-zinc-50 md:text-4xl">
              {hubTitle} Market Intelligence
            </h1>
            <p className="max-w-2xl font-serif text-sm leading-relaxed text-zinc-500 md:text-[15px]">
              Answer-engine ready dossiers grouped by metro. Each card links to a full forensic
              blueprint for a specific business model.
            </p>
          </div>
          <p className="font-mono text-xs text-zinc-600">
            {rows.length} blueprint{rows.length === 1 ? '' : 's'} · {uniqueRegionKeys} metro
            {uniqueRegionKeys === 1 ? '' : 's'}
            {sectionKeys.length !== uniqueRegionKeys ? (
              <>
                {' '}
                · {sectionKeys.length} group{sectionKeys.length === 1 ? '' : 's'}
              </>
            ) : null}
          </p>
        </header>

        {sectionKeys.length === 0 ? (
          <div
            className="rounded-xl border border-zinc-800/90 bg-[#09090b] p-8 text-center shadow-[0_0_60px_-24px_rgba(245,158,11,0.1)]"
            role="status"
          >
            <p className="font-serif text-sm text-zinc-400">
              No published blueprints for this region yet.
            </p>
            <Link
              href="/markets"
              className="mt-4 inline-block font-mono text-xs font-bold uppercase tracking-widest text-amber-500/90 hover:text-amber-400"
            >
              ← All market hubs
            </Link>
          </div>
        ) : (
          <div className="space-y-14">
            {sectionKeys.map((sectionKey, idx) => {
              const items = bySection.get(sectionKey) ?? []
              const regionKeysInSection = [
                ...new Set(items.map((r) => r.region_key))
              ].sort((a, b) => a.localeCompare(b))
              const regionHeadingId = `state-section-${idx}`
              return (
                <section
                  key={sectionKey}
                  aria-labelledby={regionHeadingId}
                  className="space-y-5"
                >
                  <div className="flex flex-wrap items-end justify-between gap-3 border-b border-zinc-800/60 pb-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <MapPin
                        className="h-4 w-4 shrink-0 text-amber-500/80"
                        aria-hidden
                      />
                      <div>
                        <h2
                          id={regionHeadingId}
                          className="font-serif text-xl font-black leading-[1.15] tracking-tight text-zinc-50 md:text-2xl"
                        >
                          {sectionKey}
                        </h2>
                        <p className="mt-1.5 max-w-xl font-mono text-[10px] font-semibold uppercase leading-relaxed tracking-[0.28em] text-zinc-500">
                          {regionKeysInSection.length > 1
                            ? regionKeysInSection.join(' · ')
                            : regionKeysInSection[0] ?? sectionKey}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                      {items.length} blueprint{items.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <ul className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
                    {items.map((row) => (
                      <li
                        key={`${row.region_key}|${row.sector}|${row.business_model}`}
                      >
                        <Link
                          href={buildMarketPath(
                            row.region_key,
                            row.sector,
                            row.business_model
                          )}
                          className={cn(
                            'group flex h-full flex-col justify-between gap-4 rounded-lg border border-zinc-800/90 bg-[#09090b] p-5',
                            'shadow-[0_0_48px_-20px_rgba(245,158,11,0.08)] transition-colors',
                            'hover:border-amber-500/25 hover:bg-zinc-950/80',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40'
                          )}
                        >
                          <div className="min-w-0 space-y-2">
                            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                              {formatSectorLabel(row.sector)}
                              <span className="text-zinc-700"> · </span>
                              {row.business_model.replace(/_/g, ' ')}
                            </p>
                            <p className="font-serif text-base font-semibold leading-snug text-zinc-100 md:text-[17px]">
                              {row.meta_title}
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-amber-500/90">
                            Open dossier
                            <ArrowRight
                              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                              aria-hidden
                            />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </MarketingShell>
  )
}
