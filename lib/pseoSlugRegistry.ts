/**
 * Published spoke slug registries for safe cross-linking.
 * Synced with successful `next build` static generation sets.
 * Unknown slugs must fall back to hub routes — never blind spoke injection.
 */

export type PseoRegistrySection =
  | 'profitable'
  | 'vertical'
  | 'saturation'
  | 'build-verdict'
  | 'validation'
  | 'local'

const PROFITABLE_NICHE_SLUGS = new Set([
  'auto-repair-software',
  'car-wash-software',
  'childcare-management-software',
  'chiropractic-software',
  'church-management-software',
  'cleaning-service-software',
  'construction-software',
  'dental-practice-software',
  'gym-management-software',
  'landscaping-software',
  'legal-practice-software',
  'medical-billing-software',
  'moving-company-software',
  'pet-grooming-software',
  'pharmacy-software',
  'plumbing-software',
  'pool-service-software',
  'property-management-software',
  'real-estate-crm',
  'restaurant-ordering-software',
  'restaurant-reservation-software',
  'salon-booking-software',
  'scheduling-app-salons',
  'short-term-rental-software',
  'tattoo-shop-software',
  'truck-dispatch-software',
  'tutoring-platform',
  'veterinary-software',
  'wedding-planning-software',
  'yoga-studio-software',
])

const SAAS_VERTICAL_SLUGS = new Set([
  'construction',
  'creators',
  'ecommerce',
  'education',
  'field-service',
  'fitness',
  'freelancers',
  'healthcare',
  'independent-contractors',
  'legal',
  'local-business',
  'mental-health',
  'nonprofits',
  'pet-industry',
  'real-estate',
  'restaurants',
  'small-business-owners',
  'solo-founders-2025',
  'trades-businesses',
  'undersaturated-saas-ideas-2025',
])

const MARKET_SATURATION_SLUGS = new Set([
  'crm-software-market',
  'email-marketing-tool-market-saturated',
  'fragmented-software-markets-opportunity',
  'how-competitive-is-restaurant-pos-market',
  'least-competitive-software-niches-2025',
  'niche-software-markets-worth-entering',
  'oversaturated-software-markets-avoid',
  'overlooked-software-niches-indie-founders',
  'pricing-gap-opportunities-saas-2025',
  'project-management-market',
  'software-markets-with-pricing-gaps',
  'there-room-for-another-invoicing-app',
  'undersaturated-b2b-software-markets',
  'untapped-saas-opportunities-2025',
  'white-space-in-saas-market-2025',
])

const BUILD_VERDICT_SLUGS = new Set([
  'ai-invoicing-tool',
  'b2b-or-b2c-saas',
  'fitness-tracking-app',
  'healthcare-scheduling-app',
  'is-my-startup-idea-worth-building',
  'marketplace-or-saas',
  'mobile-app-or-web-app',
  'or-buy-competitor',
  'property-management-tool',
  'restaurant-ordering-software',
  'scheduling-app-salons',
  'should-i-start-saas-company-2025',
  'when-to-kill-a-startup-idea',
])

const VALIDATION_GUIDE_SLUGS = new Set([
  'how-to-validate-a-startup-idea',
  'market-research-startup-free',
  'micro-saas-validation-guide',
  'mom-test-startup-validation',
  'signs-startup-idea-will-fail',
  'startup-idea-is-good',
  'startup-idea-validation-checklist',
  'startup-validation-before-building',
  'validate-saas-idea-before-building',
  'validate-startup-landing-page',
])

const LOCAL_OPPORTUNITY_SLUGS = new Set([
  'austin-texas-2025',
  'denver-2025',
  'london-2025',
  'los-angeles-2025',
  'miami-2025',
  'mumbai',
  'nashville-2025',
  'new-york-2025',
  'san-francisco-2025',
  'seattle-2025',
])

const REGISTRY: Record<PseoRegistrySection, ReadonlySet<string>> = {
  profitable: PROFITABLE_NICHE_SLUGS,
  vertical: SAAS_VERTICAL_SLUGS,
  saturation: MARKET_SATURATION_SLUGS,
  'build-verdict': BUILD_VERDICT_SLUGS,
  validation: VALIDATION_GUIDE_SLUGS,
  local: LOCAL_OPPORTUNITY_SLUGS,
}

export function isPseoSlugPublished(section: PseoRegistrySection, slug: string): boolean {
  const clean = slug.trim()
  if (!clean) return false
  return REGISTRY[section].has(clean)
}

/** Known live tool routes under /tools/[slug] */
export const VALID_TOOL_SLUGS = new Set([
  'aeo-scanner',
  'build-pivot-kill',
  'delivery-calculator',
  'franchise-profit-simulator',
  'local-scout',
  'sba-loan-scanner',
  'uk-vat-cliff-scanner',
])

export function isValidToolSlug(slug: string): boolean {
  return VALID_TOOL_SLUGS.has(slug.trim())
}
