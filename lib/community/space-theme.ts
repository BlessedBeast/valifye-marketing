import type { CommunitySpaceId } from '@/lib/community/constants'
import { cn } from '@/lib/utils'

export type CommunitySpaceTheme = {
  /** Primary text accent (pills, active nav). */
  text: string
  /** Directory card `// tag` on group hover. */
  directoryTagHover: string
  /** Directory card border on hover. */
  directoryBorderHover: string
  /** Directory card shadow glow on hover. */
  directoryGlowHover: string
  /** Space tag pill: border + text (+ shared bg applied in component). */
  pill: string
  /** Sidebar link when the space route is active. */
  navActive: string
  /** Sidebar link hover for this space. */
  navHover: string
}

export const COMMUNITY_SPACE_THEME: Record<CommunitySpaceId, CommunitySpaceTheme> = {
  validate: {
    text: 'text-orange-500',
    directoryTagHover: 'group-hover:text-orange-500',
    directoryBorderHover: 'hover:border-orange-500/40',
    directoryGlowHover: 'hover:shadow-[0_0_24px_rgba(249,115,22,0.08)]',
    pill: 'border-orange-500/40 text-orange-500',
    navActive: 'bg-orange-500/10 font-bold text-orange-500',
    navHover: 'hover:bg-orange-500/10 hover:text-orange-500',
  },
  build: {
    text: 'text-sky-500',
    directoryTagHover: 'group-hover:text-sky-500',
    directoryBorderHover: 'hover:border-sky-500/40',
    directoryGlowHover: 'hover:shadow-[0_0_24px_rgba(14,165,233,0.08)]',
    pill: 'border-sky-500/40 text-sky-500',
    navActive: 'bg-sky-500/10 font-bold text-sky-500',
    navHover: 'hover:bg-sky-500/10 hover:text-sky-500',
  },
  launch: {
    text: 'text-emerald-500',
    directoryTagHover: 'group-hover:text-emerald-500',
    directoryBorderHover: 'hover:border-emerald-500/40',
    directoryGlowHover: 'hover:shadow-[0_0_24px_rgba(16,185,129,0.08)]',
    pill: 'border-emerald-500/40 text-emerald-500',
    navActive: 'bg-emerald-500/10 font-bold text-emerald-500',
    navHover: 'hover:bg-emerald-500/10 hover:text-emerald-500',
  },
  grow: {
    text: 'text-purple-500',
    directoryTagHover: 'group-hover:text-purple-500',
    directoryBorderHover: 'hover:border-purple-500/40',
    directoryGlowHover: 'hover:shadow-[0_0_24px_rgba(168,85,247,0.08)]',
    pill: 'border-purple-500/40 text-purple-500',
    navActive: 'bg-purple-500/10 font-bold text-purple-500',
    navHover: 'hover:bg-purple-500/10 hover:text-purple-500',
  },
}

/** Identical resting chrome for every Active Spaces directory card. */
export const SPACE_DIRECTORY_CARD_RESTING = cn(
  'group block rounded-xl border border-zinc-900 bg-zinc-900/40 p-4',
  'transition-all duration-200 hover:bg-zinc-900/50'
)

const DIRECTORY_TAG_RESTING =
  'font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 transition-colors'

const NAV_LINK_BASE =
  'rounded-lg px-3 py-2.5 font-mono text-xs uppercase tracking-wide transition-colors duration-150'

const NAV_NEUTRAL_ACTIVE = 'bg-zinc-800/60 font-bold text-zinc-100'
const NAV_NEUTRAL_IDLE = 'text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-300'

export function getSpaceTheme(spaceId: CommunitySpaceId): CommunitySpaceTheme {
  return COMMUNITY_SPACE_THEME[spaceId]
}

export function getSpaceDirectoryCardClass(spaceId: CommunitySpaceId): string {
  const theme = getSpaceTheme(spaceId)
  return cn(
    SPACE_DIRECTORY_CARD_RESTING,
    theme.directoryBorderHover,
    theme.directoryGlowHover
  )
}

export function getSpaceDirectoryTagClass(spaceId: CommunitySpaceId): string {
  const theme = getSpaceTheme(spaceId)
  return cn(DIRECTORY_TAG_RESTING, theme.directoryTagHover)
}

export function getSpacePillClass(spaceId: CommunitySpaceId): string {
  return getSpaceTheme(spaceId).pill
}

export function getSpaceNavLinkClass(
  spaceId: CommunitySpaceId | undefined,
  active: boolean
): string {
  if (!spaceId) {
    return cn(NAV_LINK_BASE, active ? NAV_NEUTRAL_ACTIVE : NAV_NEUTRAL_IDLE)
  }

  const theme = getSpaceTheme(spaceId)
  return cn(
    NAV_LINK_BASE,
    active ? theme.navActive : cn('text-zinc-500', theme.navHover)
  )
}

export function getSettingsNavLinkClass(active: boolean): string {
  return cn(
    NAV_LINK_BASE,
    'flex items-center gap-2',
    active ? NAV_NEUTRAL_ACTIVE : NAV_NEUTRAL_IDLE
  )
}
