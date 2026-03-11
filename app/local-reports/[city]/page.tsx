import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft, BarChart3, ChevronRight, MapPin, Search } from 'lucide-react'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { ValifyeFooter } from '@/components/valifye-footer'
import { getCityHubBySlug } from '@/lib/localCityHubs'
import { CityReportsList } from './CityReportsList'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = { params: Promise<{ city: string }> }

function slugToDisplay(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params
  const hub = await getCityHubBySlug(city)
  if (!hub) {
    return { title: 'City Not Found | Valifye' }
  }
  const title = `${hub.city_name}${hub.region ? `, ${hub.region}` : ''} | Local Market Intelligence | Valifye`
  const description = `Forensic market audit for ${hub.city_name}. ${hub.report_count} local market reports. High-conviction opportunities and full directory.`
  return {
    title,
    description,
  }
}

export default async function LocalReportsCityPage({ params }: Props) {
  const { city: citySlug } = await params
  const hub = await getCityHubBySlug(citySlug)

  if (!hub) {
    notFound()
  }

  const topSlugs = new Set((hub.top_reports ?? []).map((r) => r.slug))
  const otherSlugs = (hub.all_slugs ?? []).filter((s) => !topSlugs.has(s))

  return (
    <div className="flex min-h-screen flex-col bg-background font-mono text-foreground">
      <ValifyeNavbar />

      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 border-b border-border pb-4 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <Link
            href="/local-reports"
            className="inline-flex items-center gap-1 transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-3 w-3" />
            Local Reports
          </Link>
          <ChevronRight className="h-3 w-3 opacity-60" />
          <span className="text-foreground">{hub.city_name}</span>
        </nav>

        {/* Hero */}
        <header className="border border-border bg-card px-6 py-8 shadow-[4px_4px_0_0_hsl(var(--primary))]">
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {hub.city_name}
              {hub.region ? ` · ${hub.region}` : ''}
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-black uppercase tracking-[0.2em] text-foreground sm:text-4xl">
            {hub.city_name} Local Market Audit
          </h1>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted-foreground">
            Forensic intelligence hub for {hub.city_name}. High-conviction reports and full directory below.
          </p>
        </header>

        {/* Market Overview */}
        <section className="border border-border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-foreground">
            <BarChart3 className="h-4 w-4 text-primary" />
            Market Overview
          </h2>
          <div className="flex flex-wrap items-baseline gap-6">
            <div>
              <span className="block text-3xl font-black tabular-nums text-foreground">
                {hub.report_count}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Total Reports
              </span>
            </div>
          </div>
        </section>

        {/* High Conviction cards */}
        {Array.isArray(hub.top_reports) && hub.top_reports.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
              High Conviction
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {hub.top_reports.map((report) => (
                <article
                  key={report.slug}
                  className="flex flex-col justify-between border border-border bg-card p-5 transition-colors hover:border-primary/60 hover:shadow-[4px_4px_0_0_hsl(var(--primary)/0.3)]"
                >
                  <div className="mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground line-clamp-2">
                      {report.title || slugToDisplay(report.slug)}
                    </h3>
                    <div className="mt-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      <span>Logic Score</span>
                      <span className="tabular-nums text-foreground">
                        {report.score != null ? Number(report.score) : '—'}/100
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/local-reports/${report.slug}`}
                    className="inline-flex items-center gap-1 border border-border bg-background px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    View Full Audit
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* All other reports – searchable list */}
        {otherSlugs.length > 0 && (
          <section className="space-y-4 border border-border bg-card p-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
              All Reports
            </h2>
            <CityReportsList slugs={otherSlugs} />
          </section>
        )}

        {otherSlugs.length === 0 && (!hub.top_reports || hub.top_reports.length === 0) && (
          <section className="border border-border bg-card p-6 text-center text-xs text-muted-foreground">
            No individual reports listed yet.
          </section>
        )}
      </main>

      <ValifyeFooter />
    </div>
  )
}
