import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

// 🚨 TEMPORARY CACHE FLUSH: Set to 0 to force Next.js to pull all 2,198+ pages.
// Once the audit passes, change this back to 43200 (12 hours) and push again.
export const revalidate = 0

/**
 * Standardizes strings into SEO-friendly slugs.
 * Used here to ensure City Hubs and Industry Hubs match the URL structure 
 * expected by the frontend.
 */
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

  // 1. Define Static Routes
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
    // 2. Fetch all dynamic data in parallel with Hardened Limits
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
        .limit(10000), // Hardened
      supabase
        .from('verdict_reports')
        .select('slug, published_at')
        .eq('is_published', true)
        .limit(5000),  // Hardened
      supabase
        .from('verdict_industry_hubs')
        .select('industry_name')
        .limit(1000), 
      supabase
        .from('public_seo_reports')
        .select('slug, published_at')
        .eq('is_published', true)
        .limit(10000), // CRITICAL: This was previously capped at 1000!
      supabase
        .from('local_city_hubs')
        .select('city_name')
        .limit(5000),  // Hardened
    ])

    if (ideasRes.error) throw ideasRes.error
    if (verdictRes.error) throw verdictRes.error
    if (industryHubRes.error) throw industryHubRes.error
    if (localSeoRes.error) throw localSeoRes.error
    if (localCityHubRes.error) throw localCityHubRes.error

    const now = new Date()

    // 3. Map Database Rows to Sitemap Objects
    const ideaPages: MetadataRoute.Sitemap = (ideasRes.data || []).map((page) => ({
      url: `${BASE_URL}/ideas/${page.slug}`,
      lastModified: page.updated_at ? new Date(page.updated_at) : now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

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

    // 4. THE DEDUPLICATION ENGINE
    const allEntries: MetadataRoute.Sitemap = [
      ...staticRoutes,
      ...ideaPages,
      ...verdictPages,
      ...verdictIndustryHubs,
      ...localSeoPages,
      ...localCityHubs,
    ]

    const uniqueUrlSet = new Set<string>()
    
    const finalSitemap = allEntries.filter((entry) => {
      if (uniqueUrlSet.has(entry.url)) {
        console.warn(`Sitemap duplicate filtered: ${entry.url}`)
        return false
      }
      uniqueUrlSet.add(entry.url)
      return true
    })

    return finalSitemap

  } catch (err) {
    console.error('Sitemap generation failed:', err)
    return staticRoutes
  }
}