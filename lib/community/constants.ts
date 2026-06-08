/**
 * Valifye Community — core spaces, karma economy, and permission tiers.
 * Business rules only; enforcement lives in API/UI layers.
 */

// ---------------------------------------------------------------------------
// Spaces
// ---------------------------------------------------------------------------

export type CommunitySpaceId = 'validate' | 'build' | 'launch' | 'grow'

export interface CommunitySpace {
  readonly id: CommunitySpaceId
  readonly label: string
  readonly description: string
  /** Minimum tier required to create posts in this space (day-theme overrides may apply). */
  readonly minTier: UserTierId
}

export const COMMUNITY_SPACES = {
  validate: {
    id: 'validate',
    label: 'Validate',
    description: 'Pressure-test ideas before you build. Mom Test, roasts, and problem discovery.',
    minTier: 1,
  },
  build: {
    id: 'build',
    label: 'Build',
    description: 'Ship logs, stack decisions, and in-progress founder updates.',
    minTier: 1,
  },
  launch: {
    id: 'launch',
    label: 'Launch',
    description: 'Product launches, promos, and go-to-market posts for builders with skin in the game.',
    minTier: 2,
  },
  grow: {
    id: 'grow',
    label: 'Grow',
    description: 'Traction, retention, and scaling — postmortems and growth experiments.',
    minTier: 1,
  },
} as const satisfies Record<CommunitySpaceId, CommunitySpace>

export const COMMUNITY_SPACE_IDS = Object.keys(COMMUNITY_SPACES) as CommunitySpaceId[]

// ---------------------------------------------------------------------------
// Karma rules
// ---------------------------------------------------------------------------

export const KARMA_RULES = {
  /** Awarded when a review earns thread-author or peer upvote; UI enforces 150-char minimum. */
  REVIEW_GIVEN: {
    delta: 3,
    minReviewChars: 150,
    requiresThreadAuthorOrUserUpvote: true,
  },
  /** Posting with an external/product link requires Tier 2 and sufficient karma balance. */
  COST_POST_WITH_LINK: {
    karmaRequired: 10,
    minTier: 2 as UserTierId,
  },
  /** Pinning a post for 24 hours requires Tier 3 and a karma spend. */
  COST_PIN_24H: {
    karmaCost: 25,
    pinDurationHours: 24,
    minTier: 3 as UserTierId,
  },
} as const

export type KarmaRuleKey = keyof typeof KARMA_RULES

// ---------------------------------------------------------------------------
// User permission tiers
// ---------------------------------------------------------------------------

export type UserTierId = 1 | 2 | 3

export type UserTierSlug = 'member' | 'builder' | 'verified_founder'

export interface UserTier {
  readonly id: UserTierId
  readonly slug: UserTierSlug
  readonly name: string
  readonly minKarma: number
  /** Spaces this tier may post in under default (non-theme) rules. */
  readonly allowedSpaces: readonly CommunitySpaceId[]
  /** Days after account creation before link posts are permitted (Tier 1 anti-spam). */
  readonly linkAntiSpamBufferDays: number
  readonly canPostProductUrls: boolean
  readonly canPinPosts: boolean
  readonly hasBadge: boolean
}

export const USER_TIERS = {
  member: {
    id: 1,
    slug: 'member',
    name: 'Member',
    minKarma: 0,
    allowedSpaces: ['validate', 'build', 'grow'],
    linkAntiSpamBufferDays: 7,
    canPostProductUrls: false,
    canPinPosts: false,
    hasBadge: false,
  },
  builder: {
    id: 2,
    slug: 'builder',
    name: 'Builder',
    minKarma: 10,
    allowedSpaces: ['validate', 'build', 'launch', 'grow'],
    linkAntiSpamBufferDays: 0,
    canPostProductUrls: true,
    canPinPosts: false,
    hasBadge: false,
  },
  verified_founder: {
    id: 3,
    slug: 'verified_founder',
    name: 'Verified Founder',
    minKarma: 50,
    allowedSpaces: ['validate', 'build', 'launch', 'grow'],
    linkAntiSpamBufferDays: 0,
    canPostProductUrls: true,
    canPinPosts: true,
    hasBadge: true,
  },
} as const satisfies Record<UserTierSlug, UserTier>

export const USER_TIER_LIST: readonly UserTier[] = [
  USER_TIERS.member,
  USER_TIERS.builder,
  USER_TIERS.verified_founder,
]

/** Resolve the highest tier a user qualifies for based on karma balance. */
export function getTierForKarma(karma: number): UserTier {
  if (karma >= USER_TIERS.verified_founder.minKarma) return USER_TIERS.verified_founder
  if (karma >= USER_TIERS.builder.minKarma) return USER_TIERS.builder
  return USER_TIERS.member
}

/** Whether a tier may post in a given space under default rules. */
export function canTierPostInSpace(tier: UserTier, spaceId: CommunitySpaceId): boolean {
  return tier.allowedSpaces.includes(spaceId)
}
