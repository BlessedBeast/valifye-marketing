import {
  COMMUNITY_SPACES,
  getTierForKarma,
  type CommunitySpaceId,
} from '@/lib/community/constants'
import type { DayTheme } from '@/lib/community/themes'
import { getTodayTheme, isLaunchSpaceUnlockedToday } from '@/lib/community/themes'

export type SpaceAvailability = {
  allowed: boolean
  reason?: string
}

const ISO_WEEKDAY_NAMES: Record<number, string> = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
}

/** High-visibility banner copy for the active theme day. */
export function getThemeBannerMessage(theme: DayTheme = getTodayTheme()): string {
  const dayName = ISO_WEEKDAY_NAMES[theme.weekday] ?? 'Today'
  return `${theme.title} ${dayName}: ${theme.description}`
}

/**
 * Whether a space may be selected today, accounting for theme rules and karma tier.
 */
export function getSpaceAvailabilityForTheme(
  spaceId: CommunitySpaceId,
  theme: DayTheme,
  karmaPoints: number
): SpaceAvailability {
  const tier = getTierForKarma(karmaPoints)
  const spaceLabel = COMMUNITY_SPACES[spaceId].label

  switch (theme.postFormat) {
    case 'problem_only':
      if (spaceId !== 'validate') {
        return {
          allowed: false,
          reason: `${theme.title} allows Validate posts only. ${spaceLabel} is locked until tomorrow.`,
        }
      }
      return { allowed: true }

    case 'roast_request':
      if (spaceId !== 'validate') {
        return {
          allowed: false,
          reason: `${theme.title} is roast-request day. Only Validate is open for stress-tests today.`,
        }
      }
      return { allowed: true }

    case 'retrospective':
      if (spaceId === 'launch') {
        return {
          allowed: false,
          reason: `${theme.title} focuses on postmortems. Launch promos are locked today — use Grow instead.`,
        }
      }
      return { allowed: true }

    case 'launch_promo':
      if (spaceId === 'launch') {
        if (!isLaunchSpaceUnlockedToday(tier.id)) {
          return {
            allowed: false,
            reason: `${theme.title} unlocks Launch for Builder tier (10+ Karma). Earn karma by reviewing founders.`,
          }
        }
        return { allowed: true }
      }
      return { allowed: true }

    case 'data_driven':
    case 'any':
    default:
      break
  }

  if (spaceId === 'launch' && !tier.allowedSpaces.includes('launch')) {
    return {
      allowed: false,
      reason: `Launch requires Builder status (10+ Karma). You have ${karmaPoints} Karma.`,
    }
  }

  if (!tier.allowedSpaces.includes(spaceId)) {
    return {
      allowed: false,
      reason: `${spaceLabel} requires Builder status (10+ Karma).`,
    }
  }

  return { allowed: true }
}

export function getAllSpaceAvailabilities(
  theme: DayTheme,
  karmaPoints: number
): Record<CommunitySpaceId, SpaceAvailability> {
  const spaces: CommunitySpaceId[] = ['validate', 'build', 'launch', 'grow']
  return spaces.reduce(
    (acc, spaceId) => {
      acc[spaceId] = getSpaceAvailabilityForTheme(spaceId, theme, karmaPoints)
      return acc
    },
    {} as Record<CommunitySpaceId, SpaceAvailability>
  )
}

/** Body must contain at least one digit on data-driven theme days. */
export function bodyMeetsThemeRequirements(body: string, theme: DayTheme): boolean {
  if (!theme.requiresNumericalContext) return true
  return /\d/.test(body)
}

export function getThemeBodyRequirementMessage(theme: DayTheme): string | null {
  if (!theme.requiresNumericalContext) return null
  return `${theme.title} requires numerical context (metrics, revenue, percentages, etc.) in your post body.`
}
