import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export const revalidate = 43200

function slugify(value: unknown): string {
  const normalized = String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || 'unknown'
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE_URL = 'https://valifye.com'

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/ideas`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ]

  try {
    const [
      ideasRes,
      verdictRes,
      industryHubRes,
      localSeoRes,
      localCityHubRes,
    ] = await Promise.all([
      supabase
        .from('market_data')
        .select('slug, updated_at')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(45000),
      supabase
        .from('verdict_reports')
        .select('slug, published_at')
        .eq('is_published', true),
      supabase
        .from('verdict_industry_hubs')
        .select('industry_name'),
      supabase
        .from('public_seo_reports')
        .select('slug, published_at')
        .eq('is_published', true),
      supabase
        .from('local_city_hubs')
        .select('city_name'),
    ])

    if (ideasRes.error) throw ideasRes.error
    if (verdictRes.error) throw verdictRes.error
    if (industryHubRes.error) throw industryHubRes.error
    if (localSeoRes.error) throw localSeoRes.error
    if (localCityHubRes.error) throw localCityHubRes.error

    const now = new Date()

    const ideaPages: MetadataRoute.Sitemap = (ideasRes.data || []).map((page) => ({
      url: `${BASE_URL}/ideas/${page.slug}`,
      lastModified: page.updated_at ? new Date(page.updated_at) : now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    // Data quarantine: keep local SEO slugs out of /reports/ URLs
    const verdictPages: MetadataRoute.Sitemap = (verdictRes.data || [])
      .filter((page) => typeof page.slug === 'string' && !page.slug.includes('-market-audit'))
      .map((page) => ({
        url: `${BASE_URL}/reports/${page.slug}`,
        lastModified: page.published_at ? new Date(page.published_at) : now,
        changeFrequency: 'weekly',
        priority: 0.5,
      }))

    const verdictIndustryHubs: MetadataRoute.Sitemap = (industryHubRes.data || [])
      .filter((hub) => !!hub.industry_name)
      .map((hub) => {
        const sectorSlug = slugify(hub.industry_name as string)
        return {
          url: `${BASE_URL}/reports/industry/${sectorSlug}`,
          lastModified: now,
          changeFrequency: 'daily',
          priority: 0.9,
        }
      })

    const localSeoPages: MetadataRoute.Sitemap = (localSeoRes.data || []).map((page) => ({
      url: `${BASE_URL}/local-reports/report/${page.slug}`,
      lastModified: page.published_at ? new Date(page.published_at) : now,
      changeFrequency: 'weekly',
      priority: 0.5,
    }))

    const localCityHubs: MetadataRoute.Sitemap = (localCityHubRes.data || [])
      .filter((hub) => !!hub.city_name)
      .map((hub) => {
        const citySlug = slugify(hub.city_name as string)
        return {
          url: `${BASE_URL}/local-reports/city/${citySlug}`,
          lastModified: now,
          changeFrequency: 'daily',
          priority: 0.9,
        }
      })

    return [
      ...staticRoutes,
      ...ideaPages,
      ...verdictPages,
      ...verdictIndustryHubs,
      ...localSeoPages,
      ...localCityHubs,
    ]
  } catch (err) {
    console.error('Sitemap generation failed:', err)
    return staticRoutes
  }
}