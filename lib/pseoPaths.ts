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

export function indiaLocalFeasibilityPath(slug: string): string {
  return `/india/local-market-scout/${slug}`
}

export function indiaLocalFeasibilityHubPath(): string {
  return '/india/local-market-scout'
}

export function indiaHubPath(): string {
  return '/india'
}

const INDIA_DIGITAL_BATTLEFIELD = '/india/digital-battlefield'

export function indiaDigitalBattlefieldHubPath(): string {
  return INDIA_DIGITAL_BATTLEFIELD
}

export function indiaProfitableNichePath(slug: string): string {
  return `${INDIA_DIGITAL_BATTLEFIELD}/profitable-niches/${slug}`
}

export function indiaProfitableNicheHubPath(): string {
  return `${INDIA_DIGITAL_BATTLEFIELD}/profitable-niches`
}

export function indiaShouldIBuildPath(slug: string): string {
  return `${INDIA_DIGITAL_BATTLEFIELD}/build-verdicts/${slug}`
}

export function indiaShouldIBuildHubPath(): string {
  return `${INDIA_DIGITAL_BATTLEFIELD}/build-verdicts`
}

export function indiaSaasIdeasVerticalPath(slug: string): string {
  return `${INDIA_DIGITAL_BATTLEFIELD}/saas-verticals/${slug}`
}

export function indiaSaasIdeasVerticalHubPath(): string {
  return `${INDIA_DIGITAL_BATTLEFIELD}/saas-verticals`
}

export function indiaMarketSaturationPath(slug: string): string {
  return `${INDIA_DIGITAL_BATTLEFIELD}/market-saturation/${slug}`
}

export function indiaMarketSaturationHubPath(): string {
  return `${INDIA_DIGITAL_BATTLEFIELD}/market-saturation`
}

export function indiaLocalOpportunityPath(slug: string): string {
  return `${INDIA_DIGITAL_BATTLEFIELD}/local-opportunities/${slug}`
}

export function indiaLocalOpportunityHubPath(): string {
  return `${INDIA_DIGITAL_BATTLEFIELD}/local-opportunities`
}

export function indiaValidationGuidePath(slug: string): string {
  return `${INDIA_DIGITAL_BATTLEFIELD}/validation-guides/${slug}`
}

export function indiaValidationGuideHubPath(): string {
  return `${INDIA_DIGITAL_BATTLEFIELD}/validation-guides`
}

/** Aliases matching enterprise naming conventions */
export const buildVerdictsHubPath = shouldIBuildHubPath
export const validationGuidesHubPath = validationGuideHubPath
export const localOpportunitiesHubPath = localOpportunityHubPath
