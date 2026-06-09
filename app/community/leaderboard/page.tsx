import Link from 'next/link'
import { Trophy } from 'lucide-react'

import { getTierForKarma } from '@/lib/community/constants'
import { getTopValidators } from '@/lib/community/queries'
import type { CommunityLeaderboardEntry } from '@/lib/community/queries'
import type { ProfileBadge } from '@/types/supabase'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const BADGE_LABELS: Record<NonNullable<ProfileBadge>, string> = {
  member: 'Member',
  builder: 'Builder',
  verified_founder: 'Verified Founder',
}

function resolveBadgeLabel(entry: CommunityLeaderboardEntry): string {
  if (entry.badge) return BADGE_LABELS[entry.badge]
  return getTierForKarma(entry.karmaPoints).name
}

function rankAccent(rank: number): string {
  if (rank === 1) return 'border-amber-500/40 bg-amber-950/20 text-amber-400'
  if (rank === 2) return 'border-slate-400/40 bg-slate-900/30 text-slate-300'
  if (rank === 3) return 'border-orange-700/40 bg-orange-950/20 text-orange-400'
  return 'border-border bg-card/60 text-muted-foreground'
}

function LeaderboardAvatar({
  name,
  avatarUrl,
}: {
  name: string
  avatarUrl: string | null
}) {
  const initial = name.charAt(0).toUpperCase() || '?'

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt=""
        width={40}
        height={40}
        className="h-10 w-10 rounded-full border border-border object-cover"
      />
    )
  }

  return (
    <span
      className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted text-sm font-bold text-foreground"
      aria-hidden
    >
      {initial}
    </span>
  )
}

export default async function LeaderboardPage() {
  const validators = await getTopValidators(20)

  return (
    <div className="space-y-8">
      <header className="space-y-2 border-b border-border pb-6">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" aria-hidden />
          <h1 className="text-2xl font-bold text-foreground">
            Founders Lounge Leaderboard
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Top builders ranked by karma. Earn points by leaving constructive reviews
          on community threads.
        </p>
      </header>

      {validators.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card/50 px-4 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No rankings yet. Be the first to earn karma by reviewing a thread.
          </p>
          <Link
            href="/community"
            className="mt-3 inline-block text-sm text-primary underline-offset-4 hover:underline"
          >
            Browse the feed
          </Link>
        </div>
      ) : (
        <ol className="grid gap-2">
          {validators.map((entry, index) => {
            const rank = index + 1
            const badgeLabel = resolveBadgeLabel(entry)

            return (
              <li key={entry.id}>
                <Link
                  href={`/community/u/${entry.username}`}
                  className={cn(
                    'group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-lg border px-4 py-3 transition-colors',
                    'hover:border-primary/40 hover:bg-card/80',
                    rank <= 3 ? rankAccent(rank) : 'border-border bg-card/60'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-md font-mono text-sm font-bold tabular-nums',
                      rank <= 3 ? 'bg-background/40' : 'bg-muted text-foreground'
                    )}
                    aria-label={`Rank ${rank}`}
                  >
                    #{rank}
                  </span>

                  <div className="flex min-w-0 items-center gap-3">
                    <LeaderboardAvatar
                      name={entry.displayName}
                      avatarUrl={entry.avatarUrl}
                    />
                    <div className="min-w-0 space-y-0.5">
                      <p className="truncate font-semibold text-foreground transition-colors group-hover:text-primary">
                        {entry.displayName}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                        <span className="font-mono">@{entry.username}</span>
                        <span aria-hidden>·</span>
                        <span
                          className={cn(
                            'rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider',
                            entry.badge === 'verified_founder'
                              ? 'border border-primary/40 bg-primary/10 text-primary'
                              : 'border border-border bg-background'
                          )}
                        >
                          {badgeLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold tabular-nums text-foreground">
                      {entry.karmaPoints}
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        karma
                      </span>
                    </p>
                    <p className="text-xs tabular-nums text-muted-foreground">
                      {entry.totalReviews} review{entry.totalReviews === 1 ? '' : 's'}
                    </p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
