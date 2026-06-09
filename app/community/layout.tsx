import type { Metadata } from 'next'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

import { CommunitySidebarNav } from '@/components/community/CommunitySidebarNav'
import { CommunitySignInButton } from '@/components/community/CommunitySignInButton'
import { COMMUNITY_SPACES, type CommunitySpaceId } from '@/lib/community/constants'
import { createClient } from '@/utils/supabase/server'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Community | Valifye',
  description: 'Founder community for validating ideas, shipping builds, and growing traction.',
}

type CommunityLayoutProps = {
  children: React.ReactNode
}

type NavItem = {
  href: string
  label: string
  spaceId?: CommunitySpaceId
}

const SPACE_NAV: NavItem[] = (
  ['validate', 'build', 'launch', 'grow'] as const
).map((spaceId) => ({
  href: `/community/${spaceId}`,
  label: COMMUNITY_SPACES[spaceId].label,
  spaceId,
}))

const NAV_ITEMS: NavItem[] = [
  { href: '/community', label: 'All Feed' },
  ...SPACE_NAV,
  { href: '/community/leaderboard', label: 'Leaderboard' },
]

type CommunitySessionProfile = {
  displayName: string
  username: string
  karmaPoints: number
}

type CommunitySession = {
  user: User
  profile: CommunitySessionProfile | null
}

async function getCommunitySession(): Promise<CommunitySession | null> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error('[community] session lookup failed:', error.message)
    return null
  }

  if (!user) return null

  const { data: profileRow, error: profileError } = await supabase
    .from('profiles')
    .select('display_name, username, karma_points')
    .eq('id', user.id)
    .maybeSingle<{
      display_name: string | null
      username: string
      karma_points: number | null
    }>()

  if (profileError) {
    console.error('[community] profile lookup failed:', profileError.message)
  }

  const profile = profileRow
    ? {
        displayName: profileRow.display_name?.trim() || profileRow.username,
        username: profileRow.username,
        karmaPoints: profileRow.karma_points ?? 0,
      }
    : null

  return { user, profile }
}

function SessionBadge({ session }: { session: CommunitySession | null }) {
  if (!session) {
    return (
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
          Guest Mode
        </p>
        <p className="mt-2 text-xs leading-relaxed text-zinc-400">
          Sign in to post, earn karma, and unlock spaces.
        </p>
        <CommunitySignInButton />
      </div>
    )
  }

  const { user, profile } = session
  const displayName =
    profile?.displayName ??
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split('@')[0] ??
    'Member'

  return (
    <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-4">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500/80">
        Session Active
      </p>
      {profile ? (
        <Link
          href={`/community/u/${profile.username}`}
          className="mt-2 block font-mono text-sm font-bold text-zinc-100 underline-offset-4 transition hover:text-amber-500 hover:underline"
        >
          {displayName}
        </Link>
      ) : (
        <p className="mt-2 font-mono text-sm font-bold text-zinc-100">{displayName}</p>
      )}
      {profile ? (
        <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          {profile.karmaPoints} karma
        </p>
      ) : user.email ? (
        <p className="mt-1 truncate font-mono text-[10px] text-zinc-500">{user.email}</p>
      ) : null}
    </div>
  )
}

export default async function CommunityLayout({ children }: CommunityLayoutProps) {
  const session = await getCommunitySession()

  return (
    <div className="-mx-4 flex min-h-[calc(100vh-8rem)] flex-col bg-[#0a0a0a] font-mono text-zinc-100 sm:-mx-6 lg:flex-row">
      <aside
        className={cn(
          'flex w-full shrink-0 flex-col border-b border-zinc-900 lg:min-h-[calc(100vh-8rem)] lg:w-56 lg:border-b-0 lg:border-r xl:w-64',
          'bg-black/40 backdrop-blur-sm'
        )}
        aria-label="Community navigation"
      >
        <div className="border-b border-zinc-900 px-4 py-5">
          <Link href="/community" className="group block">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-500">
              Valifye
            </p>
            <h2 className="text-lg font-black uppercase tracking-tight text-zinc-100 transition-colors group-hover:text-amber-500">
              Founders Lounge
            </h2>
          </Link>
        </div>

        <CommunitySidebarNav items={NAV_ITEMS} />

        <div className="mt-auto border-t border-zinc-900 p-4">
          <SessionBadge session={session} />
        </div>
      </aside>

      <div className="min-w-0 flex-1 bg-[#0a0a0a] p-4 sm:p-6 lg:p-8">{children}</div>
    </div>
  )
}
