import type { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/server'

export const revalidate = 86400

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient()
  const ideaPages: MetadataRoute.Sitemap = []

  try {
    const { data, error } = await supabase
      .from('market_data')
      .select('slug, updated_at')
      .eq('status', 'published')

    if (!error && data) {
      for (const page of data as { slug: string; updated_at: string | null }[]) {
        ideaPages.push({
          url: `https://valifye.com/ideas/${page.slug}`,
          lastModified: page.updated_at ? new Date(page.updated_at) : new Date(),
          changeFrequency: 'monthly',
          priority: 0.8
        })
      }
    }
  } catch {
    // Swallow errors — sitemap should still return static routes
  }

  return [
    {
      url: 'https://valifye.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0
    },
    {
      url: 'https://valifye.com/ideas',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9
    },
    ...ideaPages
  ]
}
