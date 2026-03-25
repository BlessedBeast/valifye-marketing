import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowRight, Database, Globe, ShieldAlert, Zap, Activity } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { IdeasSearch, type IdeasSortKey } from '@/components/IdeasSearch'

export const revalidate = 1800 // Revalidate every 30 mins

type ArchiveIdea = {
  slug: string
  niche: string
  city: string
  opportunity_score: number | null
  difficulty_score: number | null
}

/** Sidebar rows from `local_city_hubs` */
type LocalCityHubSidebarRow = {
  city_name: string
  report_count: number | null
}

function firstSearchParam(v: string | string[] | undefined): string {
  if (typeof v === 'string') return v
  if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'string') return v[0]
  return ''
}

function parseSortKey(raw: string): IdeasSortKey {
  if (raw === 'opp_high' || raw === 'diff_low' || raw === 'alpha' || raw === 'newest') {
    return raw
  }
  return 'newest'
}

/** Reduce LIKE metacharacter issues in ilike patterns */
function sanitizeIlikeTerm(term: string): string {
  return term.replace(/[%_,]/g, ' ').trim()
}

type Props = {
  searchParams: Promise<{ q?: string | string[]; sort?: string | string[] }>
}

export default async function IdeasArchivePage({ searchParams }: Props) {
  const sp = await searchParams
  const qRaw = sanitizeIlikeTerm(firstSearchParam(sp.q))
  const sortKey = parseSortKey(firstSearchParam(sp.sort).trim())

  let query = supabase
    .from('market_data')
    .select('slug, niche, city, opportunity_score, difficulty_score, published_at')
    .eq('status', 'published')

  if (qRaw.length > 0) {
    const pattern = `%${qRaw}%`
    query = query.or(`niche.ilike.${pattern},city.ilike.${pattern}`)
  }

  switch (sortKey) {
    case 'newest':
      query = query.order('published_at', { ascending: false })
      break
    case 'opp_high':
      query = query.order('opportunity_score', { ascending: false, nullsFirst: false })
      break
    case 'diff_low':
      query = query.order('difficulty_score', { ascending: true, nullsFirst: false })
      break
    case 'alpha':
      query = query.order('niche', { ascending: true })
      break
    default:
      query = query.order('published_at', { ascending: false })
  }

  const { data, error } = await query.limit(100)

  const { data: localCityHubData, error: localCityHubError } = await supabase
    .from('local_city_hubs')
    .select('city_name, report_count')
    .order('report_count', { ascending: false })
    .limit(12)

  if (localCityHubError) {
    console.error('Supabase Fetch Error (local_city_hubs sidebar):', localCityHubError)
  }

  if (error) {
    console.error('Supabase Fetch Error (ideas archive):', error)
  }

  const ideas: ArchiveIdea[] = !error && data ? (data as ArchiveIdea[]) : []
  const topCities: LocalCityHubSidebarRow[] =
    !localCityHubError && localCityHubData
      ? (localCityHubData as LocalCityHubSidebarRow[])
      : []

  const formatScore = (score: number | null | undefined) =>
    typeof score === 'number' && Number.isFinite(score) ? score : '—'

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 pt-6 font-mono text-foreground md:flex-row md:items-start">
      {/* LEFT SIDEBAR: City hubs */}
      <aside className="w-full shrink-0 space-y-6 md:w-64 lg:w-72">
        <div className="border border-border bg-card p-5 shadow-[4px_4px_0_0_hsl(var(--primary))]">
          <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
            <Globe className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Active Hubs</h2>
          </div>

          <ul className="space-y-3">
            {topCities.length > 0 ? (
              topCities.map((hub) => (
                <li key={String(hub.city_name)} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{hub.city_name}</span>
                  <span className="font-bold text-primary">{hub.report_count ?? '—'}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-muted-foreground">
                No city hub stats yet. Populate <span className="font-mono text-primary">local_city_hubs</span> in Supabase.
              </li>
            )}
          </ul>
        </div>

        <div className="border border-border bg-card p-5">
          <div className="mb-2 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Validator Note</h2>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Scores are calculated based on local friction, regulatory walls, and 2026 capital availability. Proceed with caution.
          </p>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 space-y-8">
        <header className="flex flex-col gap-4 border border-border bg-card px-6 py-6 shadow-[4px_4px_0_0_hsl(var(--primary))] md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center border border-border bg-background">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Live Database</p>
              <h1 className="text-2xl font-black uppercase tracking-tighter md:text-3xl">Forensic Blueprints</h1>
            </div>
          </div>

          <Suspense
            fallback={
              <div className="h-10 w-full max-w-md animate-pulse rounded border border-border bg-card sm:max-w-lg" />
            }
          >
            <IdeasSearch />
          </Suspense>
        </header>

        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <span>{ideas.length} Blueprints Indexed</span>
            <span className="inline-flex items-center gap-2 text-primary">
              <Zap className="h-3 w-3" /> System Live
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {ideas.map((idea) => (
              <Link
                key={idea.slug}
                href={`/ideas/${idea.slug}`}
                className="group relative flex flex-col justify-between border border-border bg-card p-5 text-left transition-all hover:-translate-y-1 hover:border-primary hover:shadow-[4px_4px_0_0_hsl(var(--primary))]"
              >
                <div className="mb-6 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-sm bg-muted px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      <Globe className="h-3 w-3" />
                      {idea.city}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">Opp:</span>
                      <span
                        className={`text-xs font-black ${idea.opportunity_score && idea.opportunity_score > 70 ? 'text-green-500' : 'text-amber-500'}`}
                      >
                        {formatScore(idea.opportunity_score)}
                      </span>
                    </div>
                  </div>

                  <h2 className="line-clamp-3 text-sm font-bold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary">
                    {idea.niche}
                  </h2>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span>Diff:</span>
                    <span className="text-red-500">{formatScore(idea.difficulty_score)}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-primary">
                    Open File
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {ideas.length === 0 && (
            <p className="border border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
              No blueprints match your query. Try another niche, city, or sort order.
            </p>
          )}
        </section>
      </main>
    </div>
  )
}
