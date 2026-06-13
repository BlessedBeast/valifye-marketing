/** Canonical hub-and-spoke URL builders for all six pSEO engines. */

export function profitableNichePath(slug: string): string {
  return `/profitable-niches/${slug}`
}

export function profitableNicheHubPath(): string {
  return '/profitable-niches'
}

export function saasIdeasVerticalPath(slug: string): string {
  return `/saas-verticals/${slug}`
}

export function saasIdeasVerticalHubPath(): string {
  return '/saas-verticals'
}

export function marketSaturationPath(slug: string): string {
  return `/market-saturation/${slug}`
}

export function marketSaturationHubPath(): string {
  return '/market-saturation'
}

export function shouldIBuildPath(slug: string): string {
  return `/build-verdicts/${slug}`
}

export function shouldIBuildHubPath(): string {
  return '/build-verdicts'
}

export function validationGuidePath(slug: string): string {
  return `/validation-guides/${slug}`
}

export function validationGuideHubPath(): string {
  return '/validation-guides'
}

export function localOpportunityPath(slug: string): string {
  return `/local-opportunities/${slug}`
}

export function localOpportunityHubPath(): string {
  return '/local-opportunities'
}

/** Aliases matching enterprise naming conventions */
export const buildVerdictsHubPath = shouldIBuildHubPath
export const validationGuidesHubPath = validationGuideHubPath
export const localOpportunitiesHubPath = localOpportunityHubPath
