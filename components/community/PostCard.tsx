import Link from 'next/link'
import { MessageSquare, ThumbsUp } from 'lucide-react'

import { COMMUNITY_SPACES } from '@/lib/community/constants'
import { formatTimeAgo } from '@/lib/community/format-time-ago'
import { POST_STAGE_LABELS } from '@/lib/community/post-schema'
import type { CommunityPostFeedItem } from '@/lib/community/queries'
import type { ProfileBadge } from '@/types/supabase'
import { cn } from '@/lib/utils'

const BADGE_LABELS: Record<NonNullable<ProfileBadge>, string> = {
  member: 'Member',
  builder: 'Builder',
  verified_founder: 'Verified Founder',
}

type PostCardProps = {
  post: CommunityPostFeedItem
}

function truncateBody(body: string, max = 120): string {
  const trimmed = body.trim().replace(/\s+/g, ' ')
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max).trim()}…`
}

function AuthorAvatar({
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
        width={32}
        height={32}
        className="h-8 w-8 rounded-full border border-border object-cover"
      />
    )
  }

  return (
    <span
      className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted text-xs font-bold text-foreground"
      aria-hidden
    >
      {initial}
    </span>
  )
}

export function PostCard({ post }: PostCardProps) {
  const spaceLabel = COMMUNITY_SPACES[post.space]?.label ?? post.space
  const stageLabel = POST_STAGE_LABELS[post.stage] ?? post.stage
  const badgeLabel = post.author.badge ? BADGE_LABELS[post.author.badge] : null

  return (
    <Link
      href={`/community/${post.slug}`}
      className={cn(
        'group block rounded-lg border border-border bg-card p-4 transition-colors',
        'hover:border-primary/40 hover:bg-card/80'
      )}
    >
      <div className="flex items-start gap-3">
        <AuthorAvatar name={post.author.displayName} avatarUrl={post.author.avatarUrl} />

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{post.author.displayName}</span>
            {badgeLabel ? (
              <span
                className={cn(
                  'rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider',
                  post.author.badge === 'verified_founder'
                    ? 'border border-primary/40 bg-primary/10 text-primary'
                    : 'border border-border bg-background text-muted-foreground'
                )}
              >
                {badgeLabel}
              </span>
            ) : null}
            <span aria-hidden>·</span>
            <time dateTime={post.createdAt}>{formatTimeAgo(post.createdAt)}</time>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded border border-border bg-background px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-primary">
              {spaceLabel}
            </span>
            <span className="rounded border border-border bg-background px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {stageLabel}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
              {post.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {truncateBody(post.body)}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
              {post.upvotes}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" aria-hidden />
              {post.commentCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
