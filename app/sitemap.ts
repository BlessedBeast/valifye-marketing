import type { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/server'

// We revalidate every 12 hours instead of 24 to catch new "morning shift" niches faster
export const revalidate = 43200

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient()
  const BASE_URL = 'https://valifye.com'
  
  // 1. Static Routes
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
      changeFrequency: 'daily', // Changed to daily because data changes every day now
      priority: 0.9,
    },
  ]

  try {
    // 2. Fetch only Published Slugs (Optimized)
    // We only need slug and updated_at. No need to select '*'
    const { data, error } = await supabase
      .from('market_data')
      .select('slug, updated_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(45000) // Google sitemap limit is 50k; we leave room for growth

    if (error) throw error

    const ideaPages: MetadataRoute.Sitemap = (data || []).map((page) => ({
      url: `${BASE_URL}/ideas/${page.slug}`,
      lastModified: page.updated_at ? new Date(page.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.7, // Individual niches are slightly lower priority than hubs
    }))

    return [...staticRoutes, ...ideaPages]
    
  } catch (err) {
    console.error('Sitemap generation failed:', err)
    return staticRoutes // Return at least the home and archive pages on failure
  }
}