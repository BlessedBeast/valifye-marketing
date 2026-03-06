import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase' // 🎯 Use Singleton

export const revalidate = 43200

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 🚨 createClient() REMOVED.
  
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
      priority: 0.9,
    },
  ]

  try {
    const { data, error } = await supabase
      .from('market_data')
      .select('slug, updated_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(45000) 

    if (error) throw error

    const ideaPages: MetadataRoute.Sitemap = (data || []).map((page) => ({
      url: `${BASE_URL}/ideas/${page.slug}`,
      lastModified: page.updated_at ? new Date(page.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    return [...staticRoutes, ...ideaPages]
    
  } catch (err) {
    console.error('Sitemap generation failed:', err)
    return staticRoutes
  }
}