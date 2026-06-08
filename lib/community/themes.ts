/**
 * Valifye Community — 7-day rotating theme schedule.
 * All calendar evaluation uses America/Los_Angeles as the single community clock.
 */

import type { CommunitySpaceId } from '@/lib/community/constants'
import type { UserTierId } from '@/lib/community/constants'

// ---------------------------------------------------------------------------
// Timezone
// ---------------------------------------------------------------------------

/** Canonical timezone for theme rollovers and daily post rules. */
export const COMMUNITY_TIMEZONE = 'America/Los_Angeles' as const

// ---------------------------------------------------------------------------
// Theme types
// ---------------------------------------------------------------------------

/** ISO weekday: 1 = Monday … 7 = Sunday */
export type IsoWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7

export type ThemePostFormat =
  | 'problem_only'
  | 'any'
  | 'roast_request'
  | 'data_driven'
  | 'launch_promo'
  | 'retrospective'

export interface DayTheme {
  readonly weekday: IsoWeekday
  readonly title: string
  readonly slug: string
  readonly postFormat: ThemePostFormat
  readonly description: string
  /** When true, posts must follow the space-specific template (e.g. Mom Test). */
  readonly enforceTemplate: boolean
  /** When true, posts must include numerical context (metrics, revenue, etc.). */
  readonly requiresNumericalContext: boolean
  /** When set, Launch space is temporarily unlocked for tiers at or above this level. */
  readonly launchSpaceMinTier: UserTierId | null
  /** Optional custom template identifier for UI rendering. */
  readonly templateId?: string
}

// ---------------------------------------------------------------------------
// Schedule
// ---------------------------------------------------------------------------

export const WEEKLY_THEME_SCHEDULE: readonly DayTheme[] = [
  {
    weekday: 1,
    title: '🧪 Mom Test',
    slug: 'mom-test',
    postFormat: 'problem_only',
    description: 'Problem-only posts. No solutions, no pitch — describe the pain.',
    enforceTemplate: true,
    requiresNumericalContext: false,
    launchSpaceMinTier: null,
    templateId: 'mom_test',
  },
  {
    weekday: 2,
    title: 'Open',
    slug: 'open',
    postFormat: 'any',
    description: 'Any format. No theme restrictions.',
    enforceTemplate: false,
    requiresNumericalContext: false,
    launchSpaceMinTier: null,
  },
  {
    weekday: 3,
    title: '💀 Kill My Startup',
    slug: 'kill-my-startup',
    postFormat: 'roast_request',
    description: 'Roast requests only. Ask the community to stress-test your idea.',
    enforceTemplate: true,
    requiresNumericalContext: false,
    launchSpaceMinTier: null,
    templateId: 'roast_request',
  },
  {
    weekday: 4,
    title: 'Open',
    slug: 'open',
    postFormat: 'any',
    description: 'Any format. No theme restrictions.',
    enforceTemplate: false,
    requiresNumericalContext: false,
    launchSpaceMinTier: null,
  },
  {
    weekday: 5,
    title: '🔢 Show Your Numbers',
    slug: 'show-your-numbers',
    postFormat: 'data_driven',
    description: 'Data-driven posts only. Include metrics, revenue, or other numerical context.',
    enforceTemplate: false,
    requiresNumericalContext: true,
    launchSpaceMinTier: null,
  },
  {
    weekday: 6,
    title: '🚀 Open Promo',
    slug: 'open-promo',
    postFormat: 'launch_promo',
    description: 'Launch space unlocked for Tier 2+ builders. Share promos and product updates.',
    enforceTemplate: false,
    requiresNumericalContext: false,
    launchSpaceMinTier: 2,
  },
  {
    weekday: 7,
    title: '🎓 Retrospective',
    slug: 'retrospective',
    postFormat: 'retrospective',
    description: 'Postmortems and lessons learned. What worked, what failed, what you would redo.',
    enforceTemplate: true,
    requiresNumericalContext: false,
    launchSpaceMinTier: null,
    templateId: 'retrospective',
  },
] as const

const THEME_BY_WEEKDAY: Readonly<Record<IsoWeekday, DayTheme>> = WEEKLY_THEME_SCHEDULE.reduce(
  (acc, theme) => {
    acc[theme.weekday] = theme
    return acc
  },
  {} as Record<IsoWeekday, DayTheme>
)

const LA_WEEKDAY_TO_ISO: Record<string, IsoWeekday> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the ISO weekday (1 = Monday … 7 = Sunday) for `date` in America/Los_Angeles.
 */
export function getIsoWeekdayInCommunityTimezone(date: Date = new Date()): IsoWeekday {
  const weekdayName = new Intl.DateTimeFormat('en-US', {
    timeZone: COMMUNITY_TIMEZONE,
    weekday: 'long',
  }).format(date)

  const iso = LA_WEEKDAY_TO_ISO[weekdayName]
  if (iso == null) {
    throw new Error(`Unexpected weekday "${weekdayName}" for timezone ${COMMUNITY_TIMEZONE}`)
  }
  return iso
}

/** Look up the theme for a given ISO weekday. */
export function getThemeForWeekday(weekday: IsoWeekday): DayTheme {
  return THEME_BY_WEEKDAY[weekday]
}

/**
 * Returns today's community theme based strictly on the America/Los_Angeles calendar.
 */
export function getTodayTheme(date: Date = new Date()): DayTheme {
  return getThemeForWeekday(getIsoWeekdayInCommunityTimezone(date))
}

/**
 * Whether Launch space posting is allowed today for a user at `userTier`
 * (Saturday Open Promo unlocks Launch for Tier 2+ regardless of default tier gates).
 */
export function isLaunchSpaceUnlockedToday(
  userTier: UserTierId,
  date: Date = new Date()
): boolean {
  const theme = getTodayTheme(date)
  if (theme.launchSpaceMinTier == null) return false
  return userTier >= theme.launchSpaceMinTier
}

/**
 * Effective spaces a user may post in today, accounting for the daily theme.
 * On Open Promo Saturday, Tier 2+ users gain Launch even if evaluating theme overrides.
 */
export function getEffectiveSpacesForToday(
  allowedSpaces: readonly CommunitySpaceId[],
  userTier: UserTierId,
  date: Date = new Date()
): CommunitySpaceId[] {
  const spaces = new Set<CommunitySpaceId>(allowedSpaces)
  if (isLaunchSpaceUnlockedToday(userTier, date)) {
    spaces.add('launch')
  }
  return [...spaces]
}
