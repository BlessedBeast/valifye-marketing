'use client'

import Link from 'next/link'
import { useState } from 'react'

import { PostCard } from '@/components/community/PostCard'
import { formatTimeAgo } from '@/lib/community/format-time-ago'
import { formatKarmaEventDescription } from '@/lib/community/karma-labels'
import type {
  CommunityKarmaEventItem,
  CommunityPostFeedItem,
  CommunityUserProfile,
} from '@/lib/community/queries'
import { getTierForKarma } from '@/lib/community/constants'
import type { ProfileBadge } from '@/types/supabase'
import { cn } from '@/lib/utils'

const BADGE_LABELS: Record<NonNullable<ProfileBadge>, string> = {
  member: 'Member',
  builder: 'Builder',
  verified_founder: 'Verified Founder',
}

type ProfileTab = 'threads' | 'karma'

type UserProfileViewProps = {
  profile: CommunityUserProfile
  posts: CommunityPostFeedItem[]
  karmaEvents: CommunityKarmaEventItem[]
}

function resolveBadgeLabel(profile: CommunityUserProfile): string {
  if (profile.badge) return BADGE_LABELS[profile.badge]
  return getTierForKarma(profile.karmaPoints).name
}

function ProfileAvatar({
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
        width={80}
        height={80}
        className="h-20 w-20 rounded-full border-2 border-border object-cover"
      />
    )
  }

  return (
    <span
      className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-border bg-muted text-2xl font-bold text-foreground"
      aria-hidden
    >
      {initial}
    </span>
  )
}

export function UserProfileView({
  profile,
  posts,
  karmaEvents,
}: UserProfileViewProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('threads')
  const badgeLabel = resolveBadgeLabel(profile)

  return (
    <div className="space-y-8">
      <header className="space-y-6 border-b border-border pb-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <ProfileAvatar name={profile.displayName} avatarUrl={profile.avatarUrl} />

          <div className="min-w-0 flex-1 space-y-3">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Builder Profile
              </p>
              <h1 className="text-2xl font-bold text-foreground">{profile.displayName}</h1>
              <p className="font-mono text-sm text-muted-foreground">@{profile.username}</p>
            </div>

            <span
              className={cn(
                'inline-flex rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider',
                profile.badge === 'verified_founder'
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-border bg-background text-muted-foreground'
              )}
            >
              {badgeLabel}
            </span>

            {profile.bio ? (
              <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
                {profile.bio}
              </p>
            ) : (
              <p className="text-sm italic text-muted-foreground">No bio yet.</p>
            )}
          </div>

          <div className="shrink-0 rounded-lg border border-primary/30 bg-primary/5 px-5 py-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Karma
            </p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-primary">
              {profile.karmaPoints}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {profile.totalReviews} verification{profile.totalReviews === 1 ? '' : 's'}
            </p>
          </div>
        </div>
      </header>

      <section className="space-y-6">
        <div
          className="flex gap-1 border-b border-border"
          role="tablist"
          aria-label="Profile sections"
        >
          {(
            [
              { id: 'threads' as const, label: 'Threads' },
              { id: 'karma' as const, label: 'Karma Log' },
            ] satisfies { id: ProfileTab; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'threads' ? (
          <div role="tabpanel" className="space-y-3">
            {posts.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-card/50 px-4 py-10 text-center text-sm text-muted-foreground">
                No threads published yet.
              </p>
            ) : (
              posts.map((post) => <PostCard key={post.slug} post={post} />)
            )}
          </div>
        ) : (
          <div role="tabpanel">
            {karmaEvents.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-card/50 px-4 py-10 text-center text-sm text-muted-foreground">
                No karma activity recorded yet.
              </p>
            ) : (
              <ul className="divide-y divide-border rounded-lg border border-border">
                {karmaEvents.map((event) => (
                  <li
                    key={event.id}
                    className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <p className="text-sm text-foreground">
                      {formatKarmaEventDescription(event.eventType, event.delta)}
                    </p>
                    <time
                      dateTime={event.createdAt}
                      className="shrink-0 text-xs text-muted-foreground"
                    >
                      {formatTimeAgo(event.createdAt)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <p className="text-xs text-muted-foreground">
        <Link href="/community/leaderboard" className="text-primary hover:underline">
          Back to leaderboard
        </Link>
      </p>
    </div>
  )
}
