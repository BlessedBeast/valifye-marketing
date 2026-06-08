import type { Metadata } from 'next'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

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
      <div className="border border-border bg-card p-3 text-xs">
        <p className="font-semibold uppercase tracking-wider text-muted-foreground">
          Guest Mode
        </p>
        <p className="mt-1 text-foreground">
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
    <div className="border border-border bg-card p-3 text-xs">
      <p className="font-semibold uppercase tracking-wider text-muted-foreground">
        Signed in
      </p>
      {profile ? (
        <Link
          href={`/community/u/${profile.username}`}
          className="mt-1 block font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
        >
          {displayName}
        </Link>
      ) : (
        <p className="mt-1 font-medium text-foreground">{displayName}</p>
      )}
      {profile ? (
        <p className="mt-0.5 text-muted-foreground">{profile.karmaPoints} karma</p>
      ) : user.email ? (
        <p className="mt-0.5 truncate text-muted-foreground">{user.email}</p>
      ) : null}
    </div>
  )
}

export default async function CommunityLayout({ children }: CommunityLayoutProps) {
  const session = await getCommunitySession()

  return (
    <div className="-mx-4 flex min-h-[calc(100vh-8rem)] flex-col gap-6 sm:-mx-6 lg:flex-row lg:gap-8">
      <aside
        className="flex w-full shrink-0 flex-col border border-border bg-card lg:min-h-[calc(100vh-8rem)] lg:w-56 xl:w-64"
        aria-label="Community navigation"
      >
        <div className="border-b border-border p-4">
          <Link href="/community" className="block">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Valifye
            </p>
            <h2 className="text-lg font-bold text-foreground">Community</h2>
          </Link>
        </div>

        <nav className="flex flex-col p-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors',
                'hover:bg-muted hover:text-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-border p-4">
          <SessionBadge session={session} />
        </div>
      </aside>

      <div className="min-w-0 flex-1 border border-border bg-background p-4 sm:p-6">
        {children}
      </div>
    </div>
  )
}
