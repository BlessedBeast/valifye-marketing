import Link from 'next/link'
import { unstable_noStore as noStore } from 'next/cache'
import { ArrowRight, Crosshair, MapPin } from 'lucide-react'

import {
  dossierTextWrapClass,
  formatBusinessModelLabel,
  formatDossierTitle,
  formatSectorLabel
} from '@/lib/marketsStateHub'
import { createClient } from '@/utils/supabase/server'
import { cn } from '@/lib/utils'

const POOL_LIMIT = 64
const AEO_PREVIEW_MAX = 200

type BlueprintPreviewRow = {
  region_key: string
  sector: string
  business_model: string
  meta_title: string
  executive_verdict: unknown
  aeo_summary: string | null
}

function slugifyPart(value: string): string {
  const s = (value ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
  return s || 'unknown'
}

function blueprintHref(row: Pick<BlueprintPreviewRow, 'region_key' | 'sector' | 'business_model'>): string {
  return `/markets/${slugifyPart(row.region_key)}/${slugifyPart(row.sector)}/${slugifyPart(row.business_model)}`
}

function parseVerdictScore(value: unknown): number | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const raw = (value as { score?: unknown }).score
    if (typeof raw === 'number' && Number.isFinite(raw)) {
      return Math.max(0, Math.min(100, Math.round(raw)))
    }
  }
  if (typeof value === 'string') {
    try {
      const o = JSON.parse(value) as { score?: unknown }
      if (typeof o.score === 'number' && Number.isFinite(o.score)) {
        return Math.max(0, Math.min(100, Math.round(o.score)))
      }
    } catch {
      return null
    }
  }
  return null
}

function truncateAeo(text: string, max = AEO_PREVIEW_MAX): { text: string; truncated: boolean } {
  const t = text.trim()
  if (t.length <= max) return { text: t, truncated: false }
  return { text: `${t.slice(0, max).trim()}…`, truncated: true }
}

function pickFeaturedCount(poolLength: number): number {
  if (poolLength <= 0) return 0
  if (poolLength < 3) return poolLength
  if (poolLength === 3) return 3
  return Math.random() < 0.5 ? 3 : 4
}

function shufflePick<T>(items: T[], n: number): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy.slice(0, Math.min(n, copy.length))
}

function scorePresentation(score: number | null): {
  display: string
  ring: string
  fill: string
  text: string
} {
  if (score == null) {
    return {
      display: '—',
      ring: 'border-zinc-600',
      fill: 'bg-zinc-900/80',
      text: 'text-zinc-500'
    }
  }
  // >80 emerald · 60–80 amber · <60 rose
  if (score > 80) {
    return {
      display: String(score),
      ring: 'border-emerald-500/75',
      fill: 'bg-emerald-500/[0.1]',
      text: 'text-emerald-200'
    }
  }
  if (score >= 60) {
    return {
      display: String(score),
      ring: 'border-amber-500/70',
      fill: 'bg-amber-500/[0.08]',
      text: 'text-amber-100'
    }
  }
  return {
    display: String(score),
    ring: 'border-rose-500/65',
    fill: 'bg-rose-500/[0.08]',
    text: 'text-rose-100'
  }
}

async function fetchBlueprintPool(): Promise<BlueprintPreviewRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('local_business_blueprints')
    .select('region_key, sector, business_model, meta_title, executive_verdict, aeo_summary')
    .eq('status', 'published')
    .limit(POOL_LIMIT)

  if (error) {
    console.error('[MarketIntelligencePreview]', error.message)
    return []
  }
  return Array.isArray(data) ? (data as BlueprintPreviewRow[]) : []
}

export async function MarketIntelligencePreview() {
  noStore()
  const pool = await fetchBlueprintPool()
  const n = pickFeaturedCount(pool.length)
  const featured = shufflePick(pool, n)

  return (
    <section
      className="relative overflow-hidden border-2 border-border bg-[#09090b] px-6 py-10 text-foreground shadow-[0_0_0_1px_hsl(var(--primary)/0.35),0_0_80px_-28px_rgba(245,158,11,0.18)] md:px-10 md:py-12"
      aria-labelledby="market-intel-preview-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(245,158,11,0.12),transparent)]"
        aria-hidden
      />

      <div className="relative space-y-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <p className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500">
              <Crosshair className="h-3.5 w-3.5 text-amber-500/90" aria-hidden />
              Local market blueprints
            </p>
            <h2
              id="market-intel-preview-heading"
              className="font-serif text-2xl font-black leading-tight tracking-tight text-zinc-50 md:text-3xl lg:text-4xl"
            >
              Forensic Market Intelligence for Local Founders.
            </h2>
            <p className="max-w-2xl font-mono text-xs leading-relaxed text-zinc-500 md:text-sm">
              Evidence-bound dossiers across{' '}
              <span className="font-bold text-amber-400/95">500+</span> U.S. cities and metros — sector
              benchmarks, friction maps, and verdict scores you can cite before you sign a lease or wire capex.
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-1 border border-amber-500/25 bg-amber-500/[0.06] px-5 py-4 font-mono lg:items-end lg:text-right">
            <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-amber-500/90">Coverage</span>
            <span className="text-3xl font-black tabular-nums tracking-tight text-zinc-50 md:text-4xl">500+</span>
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">cities & corridors indexed</span>
          </div>
        </div>

        {featured.length === 0 ? (
          <p className="font-mono text-sm text-zinc-500" role="status">
            Market blueprints are syncing.{' '}
            <Link href="/markets" className="text-primary underline-offset-4 hover:underline">
              Browse the directory
            </Link>{' '}
            as soon as dossiers publish.
          </p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {featured.map((row) => {
              const score = parseVerdictScore(row.executive_verdict)
              const tone = scorePresentation(score)
              const aeoRaw = (row.aeo_summary ?? '').trim() || 'AEO summary pending for this dossier.'
              const aeo = truncateAeo(aeoRaw)
              const href = blueprintHref(row)

              return (
                <li key={`${row.region_key}|${row.sector}|${row.business_model}`}>
                  <article
                    className={cn(
                      'flex h-[440px] flex-col rounded-lg border-[0.5px] border-emerald-500/45 bg-zinc-950/60 p-6',
                      'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_0_40px_-16px_rgba(16,185,129,0.12)]'
                    )}
                  >
                    <div className="flex shrink-0 items-start gap-4">
                      <div className="min-w-0 flex-1 space-y-3 pr-1">
                        <div>
                          <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
                            Location
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 font-mono text-[11px] font-medium leading-snug text-zinc-200">
                            <MapPin className="h-3 w-3 shrink-0 text-amber-500/85" aria-hidden />
                            <span className="truncate" title={row.region_key}>
                              {row.region_key}
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                            Business model
                          </p>
                          <p
                            className={cn(
                              'mt-1 font-mono text-[11px] leading-snug text-zinc-400',
                              dossierTextWrapClass
                            )}
                          >
                            <span className="font-normal text-zinc-500">
                              {formatSectorLabel(row.sector)}
                            </span>
                            <span className="text-zinc-700"> · </span>
                            <span className="text-zinc-300">
                              {formatBusinessModelLabel(row.business_model)}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div
                        className={cn(
                          'flex h-[7.25rem] w-[7.25rem] shrink-0 items-center justify-center rounded-full border-[3px] font-mono',
                          tone.ring,
                          tone.fill
                        )}
                        aria-label={score != null ? `Verdict score ${score} out of 100` : 'Verdict score unavailable'}
                      >
                        <div className="flex flex-col items-center justify-center gap-0.5 px-2 text-center">
                          <span
                            className={cn(
                              'text-3xl font-black tabular-nums leading-none tracking-tight',
                              tone.text
                            )}
                          >
                            {tone.display}
                          </span>
                          <span className="font-mono text-[8px] font-bold uppercase tracking-widest text-zinc-500">
                            /100
                          </span>
                        </div>
                      </div>
                    </div>

                    <h3
                      className={cn(
                        'mt-5 shrink-0 font-serif text-sm font-semibold leading-snug text-zinc-100 line-clamp-2',
                        dossierTextWrapClass
                      )}
                    >
                      {formatDossierTitle(row.meta_title)}
                    </h3>
                    <p
                      className="mt-3 min-h-0 flex-1 overflow-hidden font-serif text-[13px] leading-relaxed text-zinc-400 line-clamp-5"
                      title={aeo.truncated ? aeoRaw : undefined}
                    >
                      {aeo.text}
                    </p>

                    <Link
                      href={href}
                      className={cn(
                        'mt-auto inline-flex w-full shrink-0 items-center justify-center gap-2 border border-zinc-700 bg-zinc-900/80 py-2.5',
                        'font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-200 transition-colors',
                        'hover:border-amber-500/40 hover:bg-zinc-900 hover:text-amber-100',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50'
                      )}
                    >
                      View Full Blueprint
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </article>
                </li>
              )
            })}
          </ul>
        )}

        <div className="flex flex-col items-stretch gap-4 border-t border-zinc-800/80 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] text-zinc-600">
            Every card is a live published dossier — refreshed as new regions enter the matrix.
          </p>
          <Link
            href="/markets"
            className="inline-flex items-center justify-center gap-2 border-2 border-primary bg-primary px-8 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] transition-all hover:bg-primary/90 sm:shrink-0"
          >
            Browse All Markets
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
