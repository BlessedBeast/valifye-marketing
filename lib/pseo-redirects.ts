import type { Redirect } from 'next/dist/lib/load-custom-routes'

import {
  localOpportunityPath,
  marketSaturationPath,
  profitableNichePath,
  saasIdeasVerticalPath,
  shouldIBuildPath,
  validationGuidePath,
} from './pseoPaths'
import { supabaseAdmin } from './supabaseAdmin'

type PseoRedirect = Redirect & { permanent: true }

async function fetchPublishedSlugs(table: string): Promise<Set<string>> {
  const { data, error } = await supabaseAdmin
    .from(table)
    .select('slug')
    .eq('is_published', true)

  if (error) {
    console.warn(`[pseo-redirects] Failed to load slugs from ${table}:`, error.message)
    return new Set()
  }

  return new Set(
    (data ?? [])
      .map((row) => (typeof row.slug === 'string' ? row.slug.trim() : ''))
      .filter((slug) => slug.length > 0)
  )
}

function addRedirect(
  redirects: PseoRedirect[],
  source: string,
  destination: string
): void {
  redirects.push({ source, destination, permanent: true })
}

/**
 * Build permanent (308) redirects:
 * 1. Legacy conversational spoke URLs → new hub-and-spoke canonical URLs
 * 2. Alternate SEO entry patterns → new canonical URLs (only if slug exists)
 */
export async function buildPseoRedirects(): Promise<PseoRedirect[]> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn(
      '[pseo-redirects] SUPABASE_SERVICE_ROLE_KEY missing — skipping pSEO redirects'
    )
    return []
  }

  const [
    validationSlugs,
    profitableSlugs,
    verticalSlugs,
    saturationSlugs,
    shouldBuildSlugs,
    localSlugs,
  ] = await Promise.all([
    fetchPublishedSlugs('validation_guide_pages'),
    fetchPublishedSlugs('profitable_niche_pages'),
    fetchPublishedSlugs('saas_ideas_vertical_pages'),
    fetchPublishedSlugs('market_saturation_pages'),
    fetchPublishedSlugs('should_i_build_pages'),
    fetchPublishedSlugs('local_opportunity_pages'),
  ])

  const redirects: PseoRedirect[] = []

  /* ── Legacy conversational URLs → new canonical spokes ── */
  for (const slug of validationSlugs) {
    addRedirect(redirects, `/how-to-validate-${slug}`, validationGuidePath(slug))
  }

  for (const slug of profitableSlugs) {
    addRedirect(redirects, `/is-${slug}-profitable`, profitableNichePath(slug))
  }

  for (const slug of verticalSlugs) {
    addRedirect(redirects, `/best-saas-ideas-for-${slug}`, saasIdeasVerticalPath(slug))
  }

  for (const slug of saturationSlugs) {
    addRedirect(redirects, `/is-${slug}-too-crowded`, marketSaturationPath(slug))
  }

  for (const slug of shouldBuildSlugs) {
    addRedirect(redirects, `/should-i-build-${slug}`, shouldIBuildPath(slug))
  }

  for (const slug of localSlugs) {
    addRedirect(redirects, `/startup-opportunities-${slug}`, localOpportunityPath(slug))
  }

  /* ── Explicit edge-case SEO URLs → new canonical spokes ── */
  const explicit: Array<{ source: string; destination: string; slug: string; table: Set<string> }> = [
    {
      source: '/best-micro-saas-ideas-local-business',
      destination: saasIdeasVerticalPath('local-business'),
      slug: 'local-business',
      table: verticalSlugs,
    },
    {
      source: '/best-saas-ideas-solo-founders-2025',
      destination: saasIdeasVerticalPath('solo-founders-2025'),
      slug: 'solo-founders-2025',
      table: verticalSlugs,
    },
    {
      source: '/how-to-know-if-startup-idea-is-good',
      destination: validationGuidePath('startup-idea-is-good'),
      slug: 'startup-idea-is-good',
      table: validationSlugs,
    },
    {
      source: '/how-to-do-market-research-startup-free',
      destination: validationGuidePath('market-research-startup-free'),
      slug: 'market-research-startup-free',
      table: validationSlugs,
    },
  ]

  for (const rule of explicit) {
    if (rule.table.has(rule.slug)) {
      addRedirect(redirects, rule.source, rule.destination)
    }
  }

  /* ── Alternate entry patterns → new canonical spokes ── */
  for (const slug of validationSlugs) {
    const canonical = validationGuidePath(slug)
    addRedirect(redirects, `/validate-${slug}`, canonical)
    addRedirect(redirects, `/validation-guide-${slug}`, canonical)
    addRedirect(redirects, `/how-to-validate-your-${slug}`, canonical)
  }

  for (const slug of verticalSlugs) {
    const canonical = saasIdeasVerticalPath(slug)
    const yearMatch = slug.match(/^(.+)-(\d{4})$/)
    if (yearMatch) {
      const [, keyword, year] = yearMatch
      addRedirect(redirects, `/${keyword}-saas-ideas-${year}`, canonical)
    }
    addRedirect(redirects, `/saas-ideas-for-${slug}`, canonical)
    addRedirect(redirects, `/top-saas-ideas-for-${slug}`, canonical)
  }

  for (const slug of profitableSlugs) {
    const canonical = profitableNichePath(slug)
    addRedirect(redirects, `/niche-profitability-${slug}`, canonical)
    addRedirect(redirects, `/profitable-niche-${slug}`, canonical)
  }

  for (const slug of saturationSlugs) {
    const canonical = marketSaturationPath(slug)
    addRedirect(redirects, `/market-saturation-${slug}`, canonical)
    addRedirect(redirects, `/is-${slug}-crowded`, canonical)
    addRedirect(redirects, `/is-${slug}-oversaturated`, canonical)
  }

  for (const slug of shouldBuildSlugs) {
    const canonical = shouldIBuildPath(slug)
    addRedirect(redirects, `/should-you-build-${slug}`, canonical)
    addRedirect(redirects, `/build-or-kill-${slug}`, canonical)
    addRedirect(redirects, `/should-i-build-your-${slug}`, canonical)
  }

  for (const slug of localSlugs) {
    const canonical = localOpportunityPath(slug)
    addRedirect(redirects, `/startup-opportunities-in-${slug}`, canonical)
    addRedirect(redirects, `/local-opportunities-${slug}`, canonical)
    addRedirect(redirects, `/regional-opportunities-${slug}`, canonical)
  }

  return redirects
}
