import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

/** Route prefix for public_seo_reports (local pSEO audits). Never use /reports/ for these. */
const LOCAL_REPORT_PATH_PREFIX = '/local-reports/report'

type Props = {
  currentCity: string
  excludeSlug: string
  currentNiche?: string
}

type IdeaRow = {
  slug: string
  niche: string
  city: string
  opportunity_score: number | null
}

type LocalReportRow = {
  slug: string
  idea_title: string | null
  location_label: string | null
  logic_score: number | null
}

function formatScore(score: number | null | undefined) {
  return score != null && Number.isFinite(score) ? `${Math.round(score)}/100` : '—'
}

export async function CityIntelligenceBridge({ currentCity, excludeSlug, currentNiche }: Props) {
  const city = (currentCity || '').trim()
  const niche = (currentNiche || '').trim()
  if (!city) {
    console.log('City Intelligence Debug:', {
      city,
      reason: 'empty-city-param',
    })
    return null
  }

  const supabase = createClient()

  const [ideasRes, localRes] = await Promise.all([
    supabase
      .from('market_data')
      .select('slug, niche, city, opportunity_score')
      .ilike('city', `%${city}%`)
      .ilike('niche', niche ? `%${niche}%` : '%')
      .neq('slug', excludeSlug)
      .limit(3),
    supabase
      .from('public_seo_reports')
      .select('slug, idea_title, location_label, logic_score')
      .or(
        [
          `location_label.ilike.%${city}%`,
          niche ? `idea_title.ilike.%${niche}%` : '',
        ]
          .filter(Boolean)
          .join(','),
      )
      .neq('slug', excludeSlug)
      .limit(3),
  ])

  const ideas = (ideasRes.data as IdeaRow[] | null) || []
  const locals = (localRes.data as LocalReportRow[] | null) || []

  console.log('City Intelligence Debug:', {
    city,
    niche,
    ideasCount: ideas.length,
    localsCount: locals.length,
  })

  return (
    <section className="mt-10 border-t border-border pt-8">
      <h2 className="mb-6 text-xs font-bold uppercase tracking-[0.3em] text-primary">
        {city} Economic Intelligence
      </h2>

      {!ideas.length && !locals.length && (
        <p className="mb-4 text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
          Scanning for {city} intelligence...
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Ideas / Market Blueprints */}
        <div className="space-y-3">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
            Market Blueprints
          </h3>
          <div className="space-y-3">
            {ideas.map((idea) => (
              <Link
                key={idea.slug}
                href={`/ideas/${idea.slug}`}
                className="block border border-border bg-card p-4 text-xs transition-colors hover:border-primary"
              >
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Blueprint · {idea.city}
                </div>
                <p className="line-clamp-2 text-[12px] font-semibold text-foreground">
                  {idea.niche}
                </p>
                <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                  <span>Opportunity</span>
                  <span className="text-foreground">
                    {formatScore(idea.opportunity_score)}
                  </span>
                </div>
                <p className="mt-2 text-[10px] text-primary">
                  View related local audits for {idea.city} below.
                </p>
              </Link>
            ))}
            {!ideas.length && (
              <div className="border border-border bg-card p-3 text-[11px] text-muted-foreground">
                No blueprints yet for this city.
              </div>
            )}
          </div>
        </div>

        {/* Local pSEO Audits — from public_seo_reports only; must link to /local-reports/report/ */}
        <div className="space-y-3">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
            Local Forensic Audits
          </h3>
          <div className="space-y-3">
            {locals.map((report) => (
              <Link
                key={report.slug}
                href={`${LOCAL_REPORT_PATH_PREFIX}/${report.slug}`}
                className="block border border-border bg-card p-4 text-xs transition-colors hover:border-primary"
              >
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Local Audit
                  {report.location_label ? ` · ${report.location_label}` : null}
                </div>
                <p className="line-clamp-2 text-[12px] font-semibold text-foreground">
                  {report.idea_title || report.slug}
                </p>
                <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                  <span>Logic Score</span>
                  <span className="text-foreground">
                    {formatScore(report.logic_score)}
                  </span>
                </div>
                <p className="mt-2 text-[10px] text-primary">
                  Explore blueprint-level economics and demand for this city in the market ideas
                  engine.
                </p>
              </Link>
            ))}
            {!locals.length && (
              <div className="border border-border bg-card p-3 text-[11px] text-muted-foreground">
                No local audits indexed yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

