import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

// FIX 1: The official Next.js way to force live data without breaking the build
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Strict Type for Next.js Sitemap
type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

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
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'daily' as ChangeFreq, priority: 1.0 },
    { url: `${BASE_URL}/ideas`, lastModified: now, changeFrequency: 'daily' as ChangeFreq, priority: 1.0 },
  ]

  try {
    const [ideasRes, verdictRes, industryHubRes, localSeoRes, localCityHubRes] = await Promise.all([
      supabase.from('market_data').select('slug, updated_at').eq('status', 'published').limit(10000),
      supabase.from('verdict_reports').select('slug, published_at').eq('is_published', true).limit(5000),
      supabase.from('verdict_industry_hubs').select('industry_name').limit(1000),
      supabase.from('public_seo_reports').select('slug, published_at').eq('is_published', true).limit(10000),
      supabase.from('local_city_hubs').select('city_name').limit(5000),
    ])

    // FIX 2: Defensive filtering against null slugs that crash the router
    const ideaPages: MetadataRoute.Sitemap = (ideasRes.data || [])
      .filter((p) => p && typeof p.slug === 'string' && p.slug.trim() !== '')
      .map((p) => ({
        url: `${BASE_URL}/ideas/${p.slug}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : now,
        changeFrequency: 'weekly' as ChangeFreq,
        priority: 0.8,
      }))

    const verdictPages: MetadataRoute.Sitemap = (verdictRes.data || [])
      .filter((p) => p && typeof p.slug === 'string' && p.slug.trim() !== '')
      .map((p) => ({
        url: `${BASE_URL}/reports/${p.slug}`,
        lastModified: p.published_at ? new Date(p.published_at) : now,
        changeFrequency: 'weekly' as ChangeFreq,
        priority: 0.8,
      }))

    const localSeoPages: MetadataRoute.Sitemap = (localSeoRes.data || [])
      .filter((p) => p && typeof p.slug === 'string' && p.slug.trim() !== '')
      .map((p) => ({
        url: `${BASE_URL}/local-reports/report/${p.slug}`,
        lastModified: p.published_at ? new Date(p.published_at) : now,
        changeFrequency: 'weekly' as ChangeFreq,
        priority: 0.7,
      }))

    const industryHubs: MetadataRoute.Sitemap = (industryHubRes.data || [])
      .filter((h) => h && h.industry_name)
      .map((h) => ({
        url: `${BASE_URL}/reports/industry/${slugify(h.industry_name)}`,
        lastModified: now,
        changeFrequency: 'daily' as ChangeFreq,
        priority: 0.6,
      }))

    const cityHubs: MetadataRoute.Sitemap = (localCityHubRes.data || [])
      .filter((h) => h && h.city_name)
      .map((h) => ({
        url: `${BASE_URL}/local-reports/city/${slugify(h.city_name)}`,
        lastModified: now,
        changeFrequency: 'daily' as ChangeFreq,
        priority: 0.6,
      }))

    const allEntries: MetadataRoute.Sitemap = [
      ...staticRoutes,
      ...ideaPages,
      ...verdictPages,
      ...localSeoPages,
      ...industryHubs,
      ...cityHubs,
    ]

    // FIX 3: Safe Deduplication that maintains the exact Next.js Type
    const uniqueUrls = new Set<string>()
    const finalSitemap: MetadataRoute.Sitemap = []

    for (const entry of allEntries) {
      if (!uniqueUrls.has(entry.url)) {
        uniqueUrls.add(entry.url)
        finalSitemap.push(entry)
      }
    }

    return finalSitemap

  } catch (err) {
    console.error('Sitemap Error (Fallback triggered):', err)
    return staticRoutes
  }
}