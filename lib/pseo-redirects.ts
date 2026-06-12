import type { Redirect } from 'next/dist/lib/load-custom-routes'

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
 * Build permanent (308) redirects for alternate pSEO URLs → canonical routes.
 * Only emits rules whose destination slug exists in the DB (published).
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

  const explicit: Array<{ source: string; destination: string; slug: string }> = [
    {
      source: '/best-micro-saas-ideas-local-business',
      destination: '/best-saas-ideas-for-local-business',
      slug: 'local-business',
    },
    {
      source: '/best-saas-ideas-solo-founders-2025',
      destination: '/best-saas-ideas-for-solo-founders-2025',
      slug: 'solo-founders-2025',
    },
    {
      source: '/how-to-know-if-startup-idea-is-good',
      destination: '/how-to-validate-startup-idea-is-good',
      slug: 'startup-idea-is-good',
    },
    {
      source: '/how-to-do-market-research-startup-free',
      destination: '/how-to-validate-market-research-startup-free',
      slug: 'market-research-startup-free',
    },
  ]

  for (const rule of explicit) {
    const table = rule.destination.startsWith('/how-to-validate-')
      ? validationSlugs
      : verticalSlugs
    if (table.has(rule.slug)) {
      addRedirect(redirects, rule.source, rule.destination)
    }
  }

  for (const slug of validationSlugs) {
    addRedirect(redirects, `/validate-${slug}`, `/how-to-validate-${slug}`)
    addRedirect(redirects, `/validation-guide-${slug}`, `/how-to-validate-${slug}`)
    addRedirect(redirects, `/how-to-validate-your-${slug}`, `/how-to-validate-${slug}`)
  }

  for (const slug of verticalSlugs) {
    const yearMatch = slug.match(/^(.+)-(\d{4})$/)
    if (yearMatch) {
      const [, keyword, year] = yearMatch
      addRedirect(
        redirects,
        `/${keyword}-saas-ideas-${year}`,
        `/best-saas-ideas-for-${slug}`
      )
    }
    addRedirect(redirects, `/saas-ideas-for-${slug}`, `/best-saas-ideas-for-${slug}`)
    addRedirect(redirects, `/top-saas-ideas-for-${slug}`, `/best-saas-ideas-for-${slug}`)
  }

  for (const slug of profitableSlugs) {
    addRedirect(redirects, `/niche-profitability-${slug}`, `/is-${slug}-profitable`)
    addRedirect(redirects, `/profitable-niche-${slug}`, `/is-${slug}-profitable`)
  }

  for (const slug of saturationSlugs) {
    addRedirect(redirects, `/market-saturation-${slug}`, `/is-${slug}-too-crowded`)
    addRedirect(redirects, `/is-${slug}-crowded`, `/is-${slug}-too-crowded`)
    addRedirect(redirects, `/is-${slug}-oversaturated`, `/is-${slug}-too-crowded`)
  }

  for (const slug of shouldBuildSlugs) {
    addRedirect(redirects, `/should-you-build-${slug}`, `/should-i-build-${slug}`)
    addRedirect(redirects, `/build-or-kill-${slug}`, `/should-i-build-${slug}`)
    addRedirect(redirects, `/should-i-build-your-${slug}`, `/should-i-build-${slug}`)
  }

  for (const slug of localSlugs) {
    addRedirect(
      redirects,
      `/startup-opportunities-in-${slug}`,
      `/startup-opportunities-${slug}`
    )
    addRedirect(redirects, `/local-opportunities-${slug}`, `/startup-opportunities-${slug}`)
    addRedirect(
      redirects,
      `/regional-opportunities-${slug}`,
      `/startup-opportunities-${slug}`
    )
  }

  return redirects
}
