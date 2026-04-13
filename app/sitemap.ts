import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

// Keeping cache at 0 for now to ensure the fix goes live immediately
export const revalidate = 0

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
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/ideas`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
  ]

  try {
    const [ideasRes, verdictRes, industryHubRes, localSeoRes, localCityHubRes] = await Promise.all([
      supabase.from('market_data').select('slug, updated_at').eq('status', 'published').limit(10000),
      supabase.from('verdict_reports').select('slug, published_at').eq('is_published', true).limit(10000),
      supabase.from('verdict_industry_hubs').select('industry_name').limit(1000),
      supabase.from('public_seo_reports').select('slug, published_at').eq('is_published', true).limit(10000),
      supabase.from('local_city_hubs').select('city_name').limit(5000),
    ])

    const now = new Date()

    // 1. Blueprints (Engine 1)
    const ideaPages: MetadataRoute.Sitemap = (ideasRes.data || []).map((p) => ({
      url: `${BASE_URL}/ideas/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    // 2. Verdicts (Engine 2) - REMOVED THE FILTER TRAP
    const verdictPages: MetadataRoute.Sitemap = (verdictRes.data || []).map((p) => ({
      url: `${BASE_URL}/reports/${p.slug}`,
      lastModified: p.published_at ? new Date(p.published_at) : now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    // 3. Industry Hubs
    const verdictIndustryHubs: MetadataRoute.Sitemap = (industryHubRes.data || []).map((h) => ({
      url: `${BASE_URL}/reports/industry/${slugify(h.industry_name)}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    }))

    // 4. Local SEO Reports (Engine 3)
    const localSeoPages: MetadataRoute.Sitemap = (localSeoRes.data || []).map((p) => ({
      url: `${BASE_URL}/local-reports/report/${p.slug}`,
      lastModified: p.published_at ? new Date(p.published_at) : now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    // 5. City Hubs
    const localCityHubs: MetadataRoute.Sitemap = (localCityHubRes.data || []).map((h) => ({
      url: `${BASE_URL}/local-reports/city/${slugify(h.city_name)}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    }))

    const allEntries = [...staticRoutes, ...ideaPages, ...verdictPages, ...verdictIndustryHubs, ...localSeoPages, ...localCityHubs]

    // Final Deduplication
    const uniqueUrlSet = new Set<string>()
    return allEntries.filter((entry) => {
      if (uniqueUrlSet.has(entry.url)) return false
      uniqueUrlSet.add(entry.url)
      return true
    })

  } catch (err) {
    console.error('Sitemap failed:', err)
    return staticRoutes
  }
}