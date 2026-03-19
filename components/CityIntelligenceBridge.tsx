import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

type Props = {
  currentCity: string
  excludeSlug: string
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

type VerdictRow = {
  slug: string
  idea_title: string
  overall_integrity_score: number | null
  aeo_meta?: { city?: string | null } | null
}

function formatScore(score: number | null | undefined) {
  return score != null && Number.isFinite(score) ? `${Math.round(score)}/100` : '—'
}

export async function CityIntelligenceBridge({ currentCity, excludeSlug }: Props) {
  const city = (currentCity || '').trim()
  if (!city) {
    return null
  }

  const supabase = createClient()

  const [ideasRes, localRes, verdictRes] = await Promise.all([
    supabase
      .from('market_data')
      .select('slug, niche, city, opportunity_score')
      .eq('city', city)
      .neq('slug', excludeSlug)
      .limit(3),
    supabase
      .from('public_seo_reports')
      .select('slug, idea_title, location_label, logic_score')
      .ilike('location_label', `%${city}%`)
      .neq('slug', excludeSlug)
      .limit(3),
    supabase
      .from('verdict_reports')
      .select('slug, idea_title, overall_integrity_score, aeo_meta')
      .or(
        `aeo_meta->>city.ilike.%${city.toLowerCase()}%,idea_title.ilike.%${city.toLowerCase()}%`,
      )
      .neq('slug', excludeSlug)
      .limit(3),
  ])

  const ideas = (ideasRes.data as IdeaRow[] | null) || []
  const locals = (localRes.data as LocalReportRow[] | null) || []
  const verdicts = (verdictRes.data as VerdictRow[] | null) || []

  if (!ideas.length && !locals.length && !verdicts.length) {
    return null
  }

  return (
    <section className="mt-10 border-t border-zinc-800 pt-8">
      <h2 className="mb-6 text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
        {city} Economic Intelligence
      </h2>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Ideas / Market Blueprints */}
        <div className="space-y-3">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-400">
            Market Blueprints
          </h3>
          <div className="space-y-3">
            {ideas.map((idea) => (
              <Link
                key={idea.slug}
                href={`/ideas/${idea.slug}`}
                className="block border border-zinc-800 bg-zinc-950/60 p-4 text-xs transition-colors hover:border-amber-400"
              >
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Blueprint · {idea.city}
                </div>
                <p className="line-clamp-2 text-[12px] font-semibold text-zinc-100">
                  {idea.niche}
                </p>
                <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                  <span>Opportunity</span>
                  <span className="text-zinc-100">
                    {formatScore(idea.opportunity_score)}
                  </span>
                </div>
              </Link>
            ))}
            {!ideas.length && (
              <div className="border border-zinc-800 bg-zinc-950/40 p-3 text-[11px] text-zinc-500">
                No blueprints yet for this city.
              </div>
            )}
          </div>
        </div>

        {/* Local pSEO Audits */}
        <div className="space-y-3">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-400">
            Local Forensic Audits
          </h3>
          <div className="space-y-3">
            {locals.map((report) => (
              <Link
                key={report.slug}
                href={`/local-reports/report/${report.slug}`}
                className="block border border-zinc-800 bg-zinc-950/60 p-4 text-xs transition-colors hover:border-amber-400"
              >
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Local Audit
                  {report.location_label ? ` · ${report.location_label}` : null}
                </div>
                <p className="line-clamp-2 text-[12px] font-semibold text-zinc-100">
                  {report.idea_title || report.slug}
                </p>
                <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                  <span>Logic Score</span>
                  <span className="text-zinc-100">
                    {formatScore(report.logic_score)}
                  </span>
                </div>
              </Link>
            ))}
            {!locals.length && (
              <div className="border border-zinc-800 bg-zinc-950/40 p-3 text-[11px] text-zinc-500">
                No local audits indexed yet.
              </div>
            )}
          </div>
        </div>

        {/* Verdict Reports */}
        <div className="space-y-3">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-400">
            Forensic Verdicts
          </h3>
          <div className="space-y-3">
            {verdicts.map((vr) => (
              <Link
                key={vr.slug}
                href={`/reports/${vr.slug}`}
                className="block border border-zinc-800 bg-zinc-950/60 p-4 text-xs transition-colors hover:border-amber-400"
              >
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Verdict
                </div>
                <p className="line-clamp-2 text-[12px] font-semibold text-zinc-100">
                  {vr.idea_title}
                </p>
                <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                  <span>Integrity</span>
                  <span className="text-zinc-100">
                    {formatScore(vr.overall_integrity_score)}
                  </span>
                </div>
              </Link>
            ))}
            {!verdicts.length && (
              <div className="border border-zinc-800 bg-zinc-950/40 p-3 text-[11px] text-zinc-500">
                No verdicts yet tied to this city.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

