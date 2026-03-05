import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Activity, Database, ArrowRight, ShieldAlert, Globe } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'

type Props = { params: Promise<{ slug: string }> }

type CityBlueprintRow = {
  slug: string
  niche: string
  city: string
  opportunity_score: number | null
  difficulty_score: number | null
  published_at: string | null
}

function slugToCityName(slug: string): string {
  if (!slug) return ''
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

function formatScore(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
  return `${value.toFixed(0)}/100`
}

export default async function CityHubPage({ params }: Props) {
  const resolvedParams = await params
  const slug = resolvedParams.slug

  const formattedCityName = slugToCityName(slug)
  if (!formattedCityName) {
    notFound()
  }

  const supabase = createClient()

  const { data, error } = await supabase
    .from('market_data')
    .select('slug, niche, city, opportunity_score, difficulty_score, published_at')
    .ilike('city', formattedCityName)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Supabase Fetch Error (city hub):', error)
  }

  const rows: CityBlueprintRow[] = Array.isArray(data) ? (data as CityBlueprintRow[]) : []

  if (!rows.length) {
    notFound()
  }

  const activeCount = rows.length

  const numericOpportunity = rows
    .map((r) => (typeof r.opportunity_score === 'number' ? r.opportunity_score : NaN))
    .filter((v) => Number.isFinite(v)) as number[]

  const numericDifficulty = rows
    .map((r) => (typeof r.difficulty_score === 'number' ? r.difficulty_score : NaN))
    .filter((v) => Number.isFinite(v)) as number[]

  const avgOpportunity =
    numericOpportunity.length > 0
      ? numericOpportunity.reduce((sum, v) => sum + v, 0) / numericOpportunity.length
      : NaN

  const avgDifficulty =
    numericDifficulty.length > 0
      ? numericDifficulty.reduce((sum, v) => sum + v, 0) / numericDifficulty.length
      : NaN

  return (
    <div className="min-h-screen bg-background font-mono text-foreground">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-4 py-10 md:px-8 md:py-14">
        {/* Command Bar */}
        <header className="flex flex-col justify-between gap-3 border border-border bg-card px-4 py-3 text-xs uppercase tracking-[0.18em] shadow-[4px_4px_0_0_hsl(var(--primary))] sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Link
              href="/ideas/directory"
              className="inline-flex items-center gap-2 border border-border bg-background px-3 py-1 text-[11px] font-semibold hover:border-primary hover:text-primary"
            >
              <ArrowRight className="h-3 w-3 rotate-180" />
              Back to Database
            </Link>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-semibold">
            <span className="inline-flex items-center gap-1 border border-border bg-background px-2 py-0.5">
              <Globe className="h-3 w-3" />
              TARGET ZONE:
            </span>
            <span className="inline-flex items-center gap-2 border border-border bg-background px-3 py-1 text-primary">
              <MapPin className="h-3 w-3" />
              <span>{formattedCityName}</span>
            </span>
          </div>
        </header>

        {/* Hero */}
        <section className="grid gap-4 border border-border bg-card p-5 text-xs shadow-[4px_4px_0_0_hsl(var(--primary))] sm:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)]">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 border border-border bg-background px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
              <Database className="h-3 w-3" />
              City Forensic Lab
            </p>
            <h1 className="text-2xl font-bold uppercase tracking-[0.16em]">
              Blueprint activity report for {formattedCityName}
            </h1>
            <p className="max-w-xl text-[11px] leading-relaxed text-muted-foreground">
              Every card below is a live validation file. This dashboard shows how many blueprints are active in this
              city and the average signal strength across opportunity and difficulty.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex flex-col justify-between border border-border bg-background p-3 shadow-[4px_4px_0_0_hsl(var(--primary))]">
              <span className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em]">
                <span>Active Blueprints</span>
                <Activity className="h-3 w-3" />
              </span>
              <span className="mt-3 text-2xl font-bold">{activeCount}</span>
            </div>

            <div className="flex flex-col justify-between border border-border bg-background p-3 shadow-[4px_4px_0_0_hsl(var(--primary))]">
              <span className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em]">
                <span>Avg Opportunity</span>
                <Activity className="h-3 w-3" />
              </span>
              <span className="mt-3 text-2xl font-bold">
                {Number.isFinite(avgOpportunity) ? `${avgOpportunity.toFixed(1)}/100` : '—'}
              </span>
            </div>

            <div className="flex flex-col justify-between border border-border bg-background p-3 shadow-[4px_4px_0_0_hsl(var(--primary))]">
              <span className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em]">
                <span>Avg Difficulty</span>
                <ShieldAlert className="h-3 w-3" />
              </span>
              <span className="mt-3 text-2xl font-bold">
                {Number.isFinite(avgDifficulty) ? `${avgDifficulty.toFixed(1)}/100` : '—'}
              </span>
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="space-y-3">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em]">
            <span>Blueprint Files in {formattedCityName}</span>
            <span className="text-muted-foreground">
              Sorted by latest publish date · {activeCount} files
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rows.map((row) => {
              const opp = typeof row.opportunity_score === 'number' ? row.opportunity_score : NaN
              const diff = typeof row.difficulty_score === 'number' ? row.difficulty_score : NaN

              const oppColor =
                Number.isFinite(opp) && opp > 70 ? 'text-emerald-400' : 'text-amber-300'

              const diffColor = 'text-red-300'

              return (
                <article
                  key={row.slug}
                  className="flex flex-col justify-between border border-border bg-card p-4 text-xs shadow-[4px_4px_0_0_hsl(var(--primary))] transition-all hover:-translate-y-1 hover:border-primary hover:shadow-[4px_4px_0_0_hsl(var(--primary))]"
                >
                  <header className="mb-3 space-y-1">
                    <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{row.city}</span>
                    </p>
                    <h2 className="text-sm font-semibold uppercase tracking-[0.16em]">
                      {row.niche}
                    </h2>
                  </header>

                  <div className="mt-auto space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        Opportunity
                      </span>
                      <span className={`text-sm font-semibold ${oppColor}`}>
                        {formatScore(row.opportunity_score)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        Difficulty
                      </span>
                      <span className={`text-sm font-semibold ${diffColor}`}>
                        {formatScore(row.difficulty_score)}
                      </span>
                    </div>
                    <div className="pt-2">
                      <Link
                        href={`/ideas/${row.slug}`}
                        className="inline-flex items-center gap-1 border border-border bg-background px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] hover:border-primary hover:text-primary"
                      >
                        Open File
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}

