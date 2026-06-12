import { createClient } from '@/utils/supabase/server'

const FALLBACK_SLUGS = {
  profitable: 'saas',
  vertical: 'saas',
  saturation: 'marketing',
  shouldBuild: 'saas',
  validation: 'marketing',
  local: 'retail',
} as const

async function fetchLatestPublishedSlug(
  table: string,
  fallback: string
): Promise<string> {
  try {
    const supabase = await createClient()

    const byUpdated = await supabase
      .from(table)
      .select('slug')
      .eq('is_published', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!byUpdated.error && typeof byUpdated.data?.slug === 'string' && byUpdated.data.slug.trim()) {
      return byUpdated.data.slug.trim()
    }

    const byCreated = await supabase
      .from(table)
      .select('slug')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!byCreated.error && typeof byCreated.data?.slug === 'string' && byCreated.data.slug.trim()) {
      return byCreated.data.slug.trim()
    }

    return fallback
  } catch {
    return fallback
  }
}

export async function getLatestProfitableNicheSlug(): Promise<string> {
  try {
    return await fetchLatestPublishedSlug('profitable_niche_pages', FALLBACK_SLUGS.profitable)
  } catch {
    return FALLBACK_SLUGS.profitable
  }
}

export async function getLatestSaasVerticalSlug(): Promise<string> {
  try {
    return await fetchLatestPublishedSlug('saas_ideas_vertical_pages', FALLBACK_SLUGS.vertical)
  } catch {
    return FALLBACK_SLUGS.vertical
  }
}

export async function getLatestMarketSaturationSlug(): Promise<string> {
  try {
    return await fetchLatestPublishedSlug('market_saturation_pages', FALLBACK_SLUGS.saturation)
  } catch {
    return FALLBACK_SLUGS.saturation
  }
}

export async function getLatestShouldIBuildSlug(): Promise<string> {
  try {
    return await fetchLatestPublishedSlug('should_i_build_pages', FALLBACK_SLUGS.shouldBuild)
  } catch {
    return FALLBACK_SLUGS.shouldBuild
  }
}

export async function getLatestValidationGuideSlug(): Promise<string> {
  try {
    return await fetchLatestPublishedSlug('validation_guide_pages', FALLBACK_SLUGS.validation)
  } catch {
    return FALLBACK_SLUGS.validation
  }
}

export async function getLatestLocalOpportunitySlug(): Promise<string> {
  try {
    return await fetchLatestPublishedSlug('local_opportunity_pages', FALLBACK_SLUGS.local)
  } catch {
    return FALLBACK_SLUGS.local
  }
}
