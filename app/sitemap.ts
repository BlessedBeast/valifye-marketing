import type { MetadataRoute } from 'next'

import { SITE_URL } from '@/lib/seo'
import { buildMarketPath } from '@/lib/slugify'
import { extractGlobalRegionHubCode } from '@/lib/marketsStateHub'
import { createClient } from '@/utils/supabase/server'

export const revalidate = 3600
export const dynamic = 'force-static'

/**
 * Dynamic sitemap engine.
 *
 * Sub-sitemaps are served at /sitemap/0.xml ... /sitemap/8.xml
 * (Next.js generateSitemaps does NOT emit an index file — the index lives
 * in app/sitemap.xml/route.ts).
 *
 * Section map (tables verified against the live route pages — the original
 * spec's table names `ideas`, `reports`, `markets`, etc. do not exist):
 *   0 — static marketing pages (no DB)
 *   1 — /ideas/{slug}                       <- market_data (status = 'published')
 *   2 — /reports/{slug}                     <- verdict_reports (is_published = true)
 *   3 — /local-reports/report/{slug}        <- public_seo_reports (is_published = true)
 *   4 — /markets/{region}/{sector}/{model}  <- local_business_blueprints (status = 'published')
 *       /markets/state/{code}               <- derived from region_key hub codes
 *   5 — /solutions/{slug}                   <- solution_pillars
 *   6 — /showcase/{slug}                    <- marketing_showcase
 *   7 — /tools/* (static routes) + /blueprints/{slug} <- bpk_audits + aeo_scans
 *   8 — /community/{slug}                   <- posts (status active/archived only)
 */

const SECTION_IDS = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const

/** Sitemap protocol hard limit per file. */
const MAX_URLS_PER_SECTION = 50_000

/** PostgREST caps a single response (default 1000 rows); page to avoid silent truncation. */
const PAGE_SIZE = 1000

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: `${SITE_URL}/`, lastModified: new Date().toISOString(), changeFrequency: 'daily', priority: 1.0 },
  { url: `${SITE_URL}/community`, lastModified: new Date().toISOString(), changeFrequency: 'always', priority: 0.9 },
  { url: `${SITE_URL}/solutions`, lastModified: new Date().toISOString(), changeFrequency: 'weekly', priority: 0.8 },
  { url: `${SITE_URL}/showcase`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.8 },
  { url: `${SITE_URL}/tools`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.75 },
  { url: `${SITE_URL}/blueprints`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.75 },
  { url: `${SITE_URL}/compare`, lastModified: new Date().toISOString(), changeFrequency: 'weekly', priority: 0.8 },
  { url: `${SITE_URL}/local-market-scout`, lastModified: new Date().toISOString(), changeFrequency: 'weekly', priority: 0.8 },
]

export async function generateSitemaps() {
  return SECTION_IDS.map((id) => ({ id }))
}

export default async function sitemap(props: {
  id: Promise<string>
}): Promise<MetadataRoute.Sitemap> {
  // Next.js 16: id arrives as a promise resolving to a string.
  const sectionId = Number(await props.id)

  switch (sectionId) {
    case 0:
      // No DB dependency — must never fail.
      return STATIC_PAGES
    case 1:
      try {
        return await fetchIdeasSitemap()
      } catch (error) {
        console.error('[sitemap] Section 1 failed:', error)
        return []
      }
    case 2:
      try {
        return await fetchReportsSitemap()
      } catch (error) {
        console.error('[sitemap] Section 2 failed:', error)
        return []
      }
    case 3:
      try {
        return await fetchLocalReportsSitemap()
      } catch (error) {
        console.error('[sitemap] Section 3 failed:', error)
        return []
      }
    case 4:
      try {
        return await fetchMarketsSitemap()
      } catch (error) {
        console.error('[sitemap] Section 4 failed:', error)
        return []
      }
    case 5:
      try {
        return await fetchSolutionsSitemap()
      } catch (error) {
        console.error('[sitemap] Section 5 failed:', error)
        return []
      }
    case 6:
      try {
        return await fetchShowcaseSitemap()
      } catch (error) {
        console.error('[sitemap] Section 6 failed:', error)
        return []
      }
    case 7:
      try {
        return await fetchToolsAndBlueprintsSitemap()
      } catch (error) {
        console.error('[sitemap] Section 7 failed:', error)
        return []
      }
    case 8:
      try {
        return await fetchCommunityThreadsSitemap()
      } catch (error) {
        console.error('[sitemap] Section 8 failed:', error)
        return []
      }
    default:
      return []
  }
}

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

interface PageResult<Row> {
  data: Row[] | null
  error: { message: string } | null
}

/**
 * Drains a query page-by-page so sections larger than the PostgREST
 * max-rows cap (default 1000) are not silently truncated.
 * Callers MUST apply a stable .order() inside fetchPage.
 */
async function fetchAllRows<Row>(
  fetchPage: (from: number, to: number) => PromiseLike<PageResult<Row>>
): Promise<Row[]> {
  const rows: Row[] = []
  for (let from = 0; from < MAX_URLS_PER_SECTION; from += PAGE_SIZE) {
    const { data, error } = await fetchPage(from, from + PAGE_SIZE - 1)
    if (error) throw new Error(error.message)
    const batch = data ?? []
    rows.push(...batch)
    if (batch.length < PAGE_SIZE) break
  }
  return rows
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

/* ------------------------------------------------------------------ */
/* Section 1: Idea blueprints -> /ideas/{slug}                         */
/* ------------------------------------------------------------------ */

interface IdeaRow {
  slug: string
  updated_at: string | null
  published_at: string | null
}

async function fetchIdeasSitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase: SupabaseClient = await createClient()

  const rows = await fetchAllRows<IdeaRow>((from, to) =>
    supabase
      .from('market_data')
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .order('slug', { ascending: true })
      .range(from, to)
  )

  return rows
    .filter((row) => isNonEmptyString(row.slug))
    .map((row) => ({
      url: `${SITE_URL}/ideas/${row.slug}`,
      lastModified: row.updated_at ?? row.published_at ?? undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
}

/* ------------------------------------------------------------------ */
/* Section 2: Forensic verdicts -> /reports/{slug}                     */
/* ------------------------------------------------------------------ */

interface ReportRow {
  slug: string
  created_at: string | null
}

async function fetchReportsSitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase: SupabaseClient = await createClient()

  // NEEDS VERIFICATION: verdict_reports has no updated_at referenced anywhere
  // in the codebase — created_at is used as lastmod until one is confirmed.
  const rows = await fetchAllRows<ReportRow>((from, to) =>
    supabase
      .from('verdict_reports')
      .select('slug, created_at')
      .eq('is_published', true)
      .order('slug', { ascending: true })
      .range(from, to)
  )

  return rows
    .filter((row) => isNonEmptyString(row.slug))
    .map((row) => ({
      url: `${SITE_URL}/reports/${row.slug}`,
      lastModified: row.created_at ?? undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
}

/* ------------------------------------------------------------------ */
/* Section 3: Local SEO dossiers -> /local-reports/report/{slug}       */
/* ------------------------------------------------------------------ */

interface LocalReportRow {
  slug: string
  published_at: string | null
}

async function fetchLocalReportsSitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase: SupabaseClient = await createClient()

  const rows = await fetchAllRows<LocalReportRow>((from, to) =>
    supabase
      .from('public_seo_reports')
      .select('slug, published_at')
      .eq('is_published', true)
      .order('slug', { ascending: true })
      .range(from, to)
  )

  return rows
    .filter((row) => isNonEmptyString(row.slug))
    .map((row) => ({
      url: `${SITE_URL}/local-reports/report/${row.slug}`,
      lastModified: row.published_at ?? undefined,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
}

/* ------------------------------------------------------------------ */
/* Section 4: Market blueprints + state hubs                           */
/*   /markets/{region}/{sector}/{model} + /markets/state/{code}        */
/* ------------------------------------------------------------------ */

interface BlueprintRow {
  region_key: string
  sector: string
  business_model: string
}

async function fetchMarketsSitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase: SupabaseClient = await createClient()

  // NEEDS VERIFICATION: no timestamp column on local_business_blueprints is
  // referenced anywhere in the codebase, so lastModified is omitted (valid
  // per the sitemap protocol) rather than guessing a column name.
  const rows = await fetchAllRows<BlueprintRow>((from, to) =>
    supabase
      .from('local_business_blueprints')
      .select('region_key, sector, business_model')
      .eq('status', 'published')
      .order('region_key', { ascending: true })
      .range(from, to)
  )

  const detailUrls = new Set<string>()
  const hubCodes = new Set<string>()

  for (const row of rows) {
    if (
      !isNonEmptyString(row.region_key) ||
      !isNonEmptyString(row.sector) ||
      !isNonEmptyString(row.business_model)
    ) {
      continue
    }
    // Same path builder the route pages use, so sitemap URLs always match.
    detailUrls.add(
      `${SITE_URL}${buildMarketPath(row.region_key, row.sector, row.business_model)}`
    )
    const hub = extractGlobalRegionHubCode(row.region_key)
    if (hub) hubCodes.add(hub.toLowerCase())
  }

  const hubEntries: MetadataRoute.Sitemap = [...hubCodes].sort().map((code) => ({
    url: `${SITE_URL}/markets/state/${code}`,
    changeFrequency: 'weekly' as const,
    priority: 0.95,
  }))

  const detailEntries: MetadataRoute.Sitemap = [...detailUrls].map((url) => ({
    url,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }))

  return [...hubEntries, ...detailEntries]
}

/* ------------------------------------------------------------------ */
/* Section 5: Solution pillars -> /solutions/{slug}                    */
/* ------------------------------------------------------------------ */

interface SolutionRow {
  slug: string
}

async function fetchSolutionsSitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase: SupabaseClient = await createClient()

  // NEEDS VERIFICATION: production list queries (lib/solutionData.ts) apply no
  // status filter on solution_pillars, so none is applied here. lastModified
  // omitted — updated_at is read via select('*') in the lib but never named in
  // a query, so its existence is unconfirmed.
  const { data, error } = await supabase
    .from('solution_pillars')
    .select('slug')
    .order('slug', { ascending: true })
    .limit(500)

  if (error) throw new Error(error.message)

  return ((data ?? []) as SolutionRow[])
    .filter((row) => isNonEmptyString(row.slug))
    .map((row) => ({
      url: `${SITE_URL}/solutions/${row.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    }))
}

/* ------------------------------------------------------------------ */
/* Section 6: Marketing showcase -> /showcase/{slug}                   */
/* ------------------------------------------------------------------ */

interface ShowcaseRow {
  slug: string
  created_at: string | null
}

async function fetchShowcaseSitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase: SupabaseClient = await createClient()

  const { data, error } = await supabase
    .from('marketing_showcase')
    .select('slug, created_at')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) throw new Error(error.message)

  return ((data ?? []) as ShowcaseRow[])
    .filter((row) => isNonEmptyString(row.slug))
    .map((row) => ({
      url: `${SITE_URL}/showcase/${row.slug}`,
      lastModified: row.created_at ?? undefined,
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    }))
}

/* ------------------------------------------------------------------ */
/* Section 7: Tools (static routes) + Blueprints (bpk_audits +         */
/* aeo_scans) -> /tools/{slug} and /blueprints/{slug}                  */
/* ------------------------------------------------------------------ */

/** Filesystem routes under app/tools — not database-driven. */
const TOOL_ROUTES = [
  'aeo-scanner',
  'build-pivot-kill',
  'delivery-calculator',
  'franchise-profit-simulator',
  'local-scout',
  'sba-loan-scanner',
  'uk-vat-cliff-scanner',
] as const

interface BlueprintSlugRow {
  slug: string
  created_at: string | null
}

async function fetchToolsAndBlueprintsSitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase: SupabaseClient = await createClient()

  const toolEntries: MetadataRoute.Sitemap = TOOL_ROUTES.map((slug) => ({
    url: `${SITE_URL}/tools/${slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }))

  // /blueprints/[slug] resolves from BOTH tables (see app/blueprints/[slug]/page.tsx).
  // Each query degrades independently so one failure never blanks the other.
  let blueprintRows: BlueprintSlugRow[] = []
  try {
    const { data, error } = await supabase
      .from('bpk_audits')
      .select('slug, created_at')
      .order('created_at', { ascending: false })
      .limit(500)
    if (error) throw new Error(error.message)
    blueprintRows = blueprintRows.concat((data ?? []) as BlueprintSlugRow[])
  } catch (error) {
    console.error('[sitemap] Section 7 (bpk_audits) failed:', error)
  }

  try {
    const { data, error } = await supabase
      .from('aeo_scans')
      .select('slug, created_at')
      .order('created_at', { ascending: false })
      .limit(500)
    if (error) throw new Error(error.message)
    blueprintRows = blueprintRows.concat((data ?? []) as BlueprintSlugRow[])
  } catch (error) {
    console.error('[sitemap] Section 7 (aeo_scans) failed:', error)
  }

  const seen = new Set<string>()
  const blueprintEntries: MetadataRoute.Sitemap = []
  for (const row of blueprintRows) {
    if (!isNonEmptyString(row.slug) || seen.has(row.slug)) continue
    seen.add(row.slug)
    blueprintEntries.push({
      url: `${SITE_URL}/blueprints/${row.slug}`,
      lastModified: row.created_at ?? undefined,
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    })
  }

  return [...toolEntries, ...blueprintEntries]
}

/* ------------------------------------------------------------------ */
/* Section 8: Community threads -> /community/{slug}                   */
/* ------------------------------------------------------------------ */

interface PostRow {
  slug: string
  status: 'active' | 'archived'
  created_at: string | null
}

async function fetchCommunityThreadsSitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase: SupabaseClient = await createClient()

  // Threads live at /community/{slug} (app/community/[slug]/page.tsx) — the
  // spec's /community/thread/{id} route does not exist in this app.
  // 'removed' posts are excluded at the query level and can never leak through.
  // NEEDS VERIFICATION: posts has NO updated_at column (types/supabase.ts), so
  // created_at is the lastmod source and the sort key.
  const rows = await fetchAllRows<PostRow>((from, to) =>
    supabase
      .from('posts')
      .select('slug, status, created_at')
      .in('status', ['active', 'archived'])
      .order('created_at', { ascending: false })
      .range(from, to)
  )

  return rows
    .filter((row) => isNonEmptyString(row.slug))
    .map((row) => ({
      url: `${SITE_URL}/community/${row.slug}`,
      lastModified: row.created_at ?? undefined,
      changeFrequency: row.status === 'active' ? ('daily' as const) : ('monthly' as const),
      priority: row.status === 'active' ? 0.7 : 0.4,
    }))
}
