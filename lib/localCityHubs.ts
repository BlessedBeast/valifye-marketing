import { supabase } from '@/lib/supabase'

export interface TopReportSummary {
  slug: string
  title: string
  score: number
}

export interface LocalCityHub {
  city_name: string
  region: string
  report_count: number
  top_reports: TopReportSummary[]
  all_slugs: string[]
}

const TABLE_NAME = 'local_city_hubs'

/**
 * Convert URL slug to display/city_name form (e.g. "new-york" -> "New York").
 */
function slugToCityName(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
}

/**
 * Fetch a single city hub by URL slug (e.g. "denver", "new-york").
 * Matches against city_name (case-insensitive via slugToCityName).
 */
export async function getCityHubBySlug(slug: string): Promise<LocalCityHub | null> {
  const cityName = slugToCityName(slug)
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('city_name, region, report_count, top_reports, all_slugs')
    .eq('city_name', cityName)
    .maybeSingle()

  if (error) {
    console.error('Local city hub fetch error:', error)
    return null
  }

  if (!data) return null

  const topReports = Array.isArray(data.top_reports) ? data.top_reports : []
  const allSlugs = Array.isArray(data.all_slugs) ? data.all_slugs : []

  return {
    city_name: data.city_name ?? '',
    region: data.region ?? '',
    report_count: Number(data.report_count) ?? 0,
    top_reports: topReports as TopReportSummary[],
    all_slugs: allSlugs as string[],
  }
}
