import type { Metadata } from 'next'
import Link from 'next/link'

import { MarketingShell } from '@/components/MarketingShell'
import { getRecentBpkAudits } from '@/lib/bpkAudits'
import { buildCanonical } from '@/lib/seo'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://valifye.com'

const META_TITLE =
  'Forensic Blueprints: 2026 Startup Market Intelligence Repository'
const META_DESCRIPTION =
  'Browse our library of data-driven startup audits. Real-world analysis on demand, risks, and monetization for micro-SaaS founders.'

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESCRIPTION,
  alternates: {
    canonical: buildCanonical('/blueprints')
  },
  openGraph: {
    title: META_TITLE,
    description: META_DESCRIPTION,
    type: 'website',
    url: `${SITE_URL}/blueprints`
  },
  twitter: {
    card: 'summary_large_image',
    title: META_TITLE,
    description: META_DESCRIPTION
  },
  robots: { index: true, follow: true }
}

function truncateIdea(text: string | null, maxLen: number): string {
  if (text == null || text.trim().length === 0) return '—'
  const t = text.trim().replace(/\s+/g, ' ')
  if (t.length <= maxLen) return t
  return `${t.slice(0, Math.max(0, maxLen - 1))}…`
}

function formatAuditDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  })
}

function verdictTone(
  status: string | null
): 'build' | 'pivot' | 'kill' | 'neutral' {
  const s = (status ?? '').toUpperCase()
  if (s.includes('BUILD')) return 'build'
  if (s.includes('PIVOT')) return 'pivot'
  if (s.includes('KILL')) return 'kill'
  return 'neutral'
}

function VerdictBadge({ status }: { status: string | null }) {
  const tone = verdictTone(status)
  const label = (status ?? 'PENDING').toUpperCase().slice(0, 24)
  const styles =
    tone === 'build'
      ? 'border-emerald-500/45 bg-emerald-500/10 text-emerald-200'
      : tone === 'pivot'
        ? 'border-orange-500/45 bg-orange-500/10 text-orange-200'
        : tone === 'kill'
          ? 'border-rose-500/45 bg-rose-500/10 text-rose-200'
          : 'border-zinc-600/50 bg-zinc-900/40 text-zinc-400'

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em]',
        styles
      )}
    >
      {label}
    </span>
  )
}

export default async function BlueprintsIndexPage() {
  const audits = await getRecentBpkAudits(50)

  return (
    <MarketingShell className="max-w-5xl gap-12 text-zinc-400">
      <article className="space-y-10 pb-8 md:space-y-14 md:pb-12">
        <header className="space-y-5 border-b border-zinc-800/90 pb-10">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-emerald-400/90">
            Repository · pSEO index
          </p>
          <h1 className="font-serif text-4xl font-black tracking-tight text-zinc-50 md:text-5xl lg:text-6xl">
            Forensic Blueprints
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-zinc-400 md:text-lg">
            Unauthorized access to these market signals is prohibited. Use these
            records to identify patterns in 2026 consumer behavior.
          </p>
        </header>

        <section aria-label="Latest forensic startup audits">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-zinc-800/80 pb-4">
            <h2 className="font-serif text-xl font-bold tracking-tight text-zinc-100 md:text-2xl">
              Latest audits
            </h2>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              {audits.length} record{audits.length === 1 ? '' : 's'} · bpk_audits
            </p>
          </div>

          {audits.length === 0 ? (
            <div
              className="rounded-lg border border-dashed border-zinc-700/80 bg-zinc-950/60 p-8 font-mono text-sm text-zinc-500"
              role="status"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-600">
                /// NO ROWS RETURNED
              </p>
              <p className="mt-3 leading-relaxed">
                The bpk_audits table returned zero rows, or the query failed (check
                RLS and NEXT_PUBLIC_SUPABASE_* env).
              </p>
            </div>
          ) : (
            <ul className="grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2">
              {audits.map((row) => (
                <li key={row.slug}>
                  <Link
                    href={`/blueprints/${encodeURIComponent(row.slug)}`}
                    className={cn(
                      'group flex h-full flex-col gap-3 rounded-lg border border-zinc-800/90 bg-zinc-900/50 p-5 transition-colors',
                      'hover:border-emerald-500/35 hover:bg-zinc-900/70 hover:shadow-[0_0_40px_-20px_rgba(16,185,129,0.12)]'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <VerdictBadge status={row.verdict_status} />
                      <time
                        dateTime={row.created_at || undefined}
                        className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-zinc-500"
                      >
                        {formatAuditDate(row.created_at)}
                      </time>
                    </div>
                    <p className="font-mono text-sm leading-relaxed text-zinc-300 group-hover:text-zinc-200">
                      {truncateIdea(row.idea_input, 160)}
                    </p>
                    <p className="font-mono text-[10px] text-zinc-600">
                      slug:{' '}
                      <span className="text-emerald-500/80">{row.slug}</span>
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </article>
    </MarketingShell>
  )
}
