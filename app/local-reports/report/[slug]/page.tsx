import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  MapPin,
} from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { ValifyeFooter } from '@/components/valifye-footer'

type Props = { params: Promise<{ slug: string }> }

type PublicSeoReportRow = {
  slug: string
  idea_title: string | null
  business_type: string | null
  location_label: string | null
  logic_score: number | null
  report_type: string | null
  report_data: Record<string, any> | null
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function LocalSeoReportPage({ params }: Props) {
  const { slug } = await params
  const supabase = createClient()

  const { data, error } = await supabase
    .from('public_seo_reports')
    .select('slug, idea_title, business_type, location_label, logic_score, report_type, report_data')
    .eq('slug', slug)
    .maybeSingle<PublicSeoReportRow>()

  if (error) {
    console.error('Supabase Fetch Error (public_seo_reports):', error)
  }

  if (!data) {
    notFound()
  }

  const report = data
  const score =
    typeof report.logic_score === 'number' && Number.isFinite(report.logic_score)
      ? Math.round(report.logic_score)
      : null

  const [rawCity, rawRegion] = (report.location_label || '')
    .split(',')
    .map((s) => s.trim())

  const cityPart = rawCity || null
  const regionPart = rawRegion || null

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 font-mono text-zinc-100">
      <ValifyeNavbar />

      <div className="sticky top-0 z-30 border-b border-border bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-3 px-4 py-3 text-[10px] uppercase tracking-[0.25em] text-zinc-400 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3 w-3 text-amber-400" />
            <span className="hidden sm:inline">
              Cached programmatic SEO audit. Always rerun a live scan before operating decisions.
            </span>
            <span className="sm:hidden">Cached pSEO audit.</span>
          </div>
          <a
            href="https://app.valifye.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-primary/40 bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-primary-foreground shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-colors hover:bg-primary/90"
          >
            Run Live 800m Scan
            <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Back nav */}
        <div className="mb-6 flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-zinc-500">
          <Link
            href="/local-reports"
            className="inline-flex items-center gap-2 text-zinc-500 transition-colors hover:text-zinc-100"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Local Market Database
          </Link>
          {report.location_label && (
            <span className="hidden sm:inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {report.location_label}
            </span>
          )}
        </div>

        {/* Hero */}
        <section className="mb-8 border border-zinc-800 bg-zinc-950 px-6 py-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                <MapPin className="h-3 w-3" />
                Local Market SEO Audit
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-50 sm:text-3xl">
                {report.idea_title || 'Unnamed Local Market Audit'}
              </h1>
              {report.location_label && (
                <p className="max-w-2xl text-xs leading-relaxed text-zinc-300">
                  Cached forensic pSEO report for{' '}
                  <span className="font-semibold text-zinc-50">
                    {cityPart}
                    {regionPart ? `, ${regionPart}` : null}
                  </span>
                  . Generated to support search engines and founders exploring this specific local market.
                </p>
              )}
            </div>

            {score !== null && (
              <div className="flex flex-col items-end gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                  Logic Score
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black tabular-nums text-zinc-50 sm:text-5xl">
                    {score}
                  </span>
                  <span className="text-sm font-bold text-zinc-600">/100</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* High-level metrics shell, if present in report_data */}
        {report.report_data && typeof report.report_data === 'object' && (
          <section className="mb-8 border border-zinc-800 bg-zinc-950 px-6 py-5 shadow-[4px_4px_0_0_rgba(var(--primary-rgb),1)]">
            <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">
              <BarChart3 className="h-4 w-4" />
              Market Snapshot
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(report.report_data).map(([rawKey, value]) => {
                const label = rawKey.replace(/_/g, ' ')
                const isArray = Array.isArray(value)
                const isPrimitive =
                  typeof value === 'string' ||
                  typeof value === 'number' ||
                  typeof value === 'boolean'

                return (
                  <div
                    key={rawKey}
                    className="border border-zinc-800 bg-black/40 p-4"
                  >
                    <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                      {label}
                    </div>
                    {isArray ? (
                      <ul className="space-y-1 text-[11px] leading-relaxed text-zinc-200">
                        {(value as any[]).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="mt-[2px] text-emerald-400">›</span>
                            <span>
                              {typeof item === 'string' || typeof item === 'number'
                                ? String(item)
                                : JSON.stringify(item)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : isPrimitive ? (
                      <p className="text-[11px] leading-relaxed text-zinc-200">
                        {String(value)}
                      </p>
                    ) : (
                      <p className="text-[11px] leading-relaxed text-zinc-300">
                        {value === null
                          ? 'No data'
                          : JSON.stringify(value, null, 2)}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        <section className="mb-4 border border-zinc-800 bg-black px-6 py-4 text-[11px] leading-relaxed text-zinc-400">
          <p>
            This page is rendered from a cached JSON snapshot in <code>public_seo_reports</code>. The live Valifye
            engine re-scans inventory, pricing, and reviews every run. For operational decisions, always rerun a live
            800m scan for your exact address.
          </p>
        </section>
      </main>

      <ValifyeFooter />
    </div>
  )
}

