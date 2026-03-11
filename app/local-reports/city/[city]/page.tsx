import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Activity, ArrowRight } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { ValifyeFooter } from '@/components/valifye-footer'

type Props = { params: Promise<{ city: string }> }

type LocalCityHubRow = {
  city_name: string
  region: string | null
  report_count: number | null
  top_reports: any
  all_slugs: string[] | null
}

function slugToCityName(slug: string): string {
  if (!slug) return ''
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function LocalCityHubPage({ params }: Props) {
  const { city } = await params
  const decoded = decodeURIComponent(city || '')
  const formattedCityName = slugToCityName(decoded)

  if (!formattedCityName) {
    notFound()
  }

  const supabase = createClient()

  const { data, error } = await supabase
    .from('local_city_hubs')
    .select('city_name, region, report_count, top_reports, all_slugs')
    .ilike('city_name', formattedCityName)
    .maybeSingle<LocalCityHubRow>()

  if (error) {
    console.error('Supabase Fetch Error (local city hub):', error)
  }

  if (!data) {
    notFound()
  }

  // Normalize top_reports if it comes back as a stringified JSON blob
  let topReports = data.top_reports
  if (typeof topReports === 'string') {
    try {
      topReports = JSON.parse(topReports)
    } catch (e) {
      console.error('Failed to parse top_reports JSON for city hub:', data.city_name, e)
      topReports = []
    }
  }

  const normalizedCount =
    typeof data.report_count === 'number' && Number.isFinite(data.report_count)
      ? data.report_count
      : (Array.isArray(data.all_slugs) ? data.all_slugs.length : 0)

  const hub: LocalCityHubRow = {
    city_name: data.city_name,
    region: data.region,
    report_count: normalizedCount,
    top_reports: topReports,
    all_slugs: data.all_slugs,
  }

  const cityLabel = hub.city_name || formattedCityName
  const reports = Array.isArray(hub.top_reports) ? hub.top_reports : []

  return (
    <div className="min-h-screen bg-background font-mono text-foreground">
      <ValifyeNavbar />

      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        {/* Command bar */}
        <header className="flex flex-col justify-between gap-3 border border-border bg-card px-4 py-3 text-xs uppercase tracking-[0.18em] shadow-[4px_4px_0_0_hsl(var(--primary))] sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Link
              href="/local-reports"
              className="inline-flex items-center gap-2 border border-border bg-background px-3 py-1 text-[11px] font-semibold hover:border-primary hover:text-primary"
            >
              <ArrowRight className="h-3 w-3 rotate-180" />
              Back to Local Database
            </Link>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-semibold">
            <span className="inline-flex items-center gap-1 border border-border bg-background px-2 py-0.5">
              <MapPin className="h-3 w-3" />
              CITY HUB
            </span>
            <span className="inline-flex items-center gap-2 border border-border bg-background px-3 py-1 text-primary">
              {cityLabel}
              {hub.region ? `, ${hub.region}` : null}
            </span>
          </div>
        </header>

        {/* Hero */}
        <section className="grid gap-4 border border-border bg-card p-5 text-xs shadow-[4px_4px_0_0_hsl(var(--primary))] sm:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)]">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 border border-border bg-background px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
              <Activity className="h-3 w-3" />
              Local Forensic Hub
            </p>
            <h1 className="text-2xl font-bold uppercase tracking-[0.16em]">
              Programmatic SEO audits for {cityLabel}
            </h1>
            <p className="max-w-xl text-[11px] leading-relaxed text-muted-foreground">
              Each card below is a cached pSEO market audit generated from live local signals. Use this hub to scan
              where Valifye has already run forensic analysis before triggering new 800m scans.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col justify-between border border-border bg-background p-3 shadow-[4px_4px_0_0_hsl(var(--primary))]">
              <span className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em]">
                <span>Audits Indexed</span>
                <Activity className="h-3 w-3" />
              </span>
              <span className="mt-3 text-2xl font-bold">{hub.report_count}</span>
            </div>
          </div>
        </section>

        {/* Grid of audits */}
        <section className="space-y-3">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em]">
            <span>Cached audits in {cityLabel}</span>
            <span className="text-muted-foreground">{hub.report_count} files</span>
          </div>

          {reports.length === 0 ? (
            <div className="border border-border bg-card p-6 text-sm text-muted-foreground">
              No highlighted audits yet. Run the local pSEO pipeline to generate city-level hubs.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reports.map((report) => (
                <article
                  key={report.slug}
                  className="flex flex-col justify-between border border-border bg-card p-4 text-xs shadow-[4px_4px_0_0_hsl(var(--primary))] transition-all hover:-translate-y-1 hover:border-primary hover:shadow-[4px_4px_0_0_hsl(var(--primary))]"
                >
                  <header className="mb-3 space-y-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Forensic pSEO audit
                    </p>
                    <h2 className="text-sm font-semibold uppercase tracking-[0.16em] line-clamp-2">
                      {report.title}
                    </h2>
                  </header>

                  <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {typeof report.score === 'number' && Number.isFinite(report.score)
                        ? `Score ${report.score}/100`
                        : 'Score pending'}
                    </span>
                    <Link
                      href={`/local-reports/report/${report.slug}`}
                      className="inline-flex items-center gap-1 border border-border bg-background px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] hover:border-primary hover:text-primary"
                    >
                      Open audit
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <ValifyeFooter />
    </div>
  )
}

