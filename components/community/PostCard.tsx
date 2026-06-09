import Link from 'next/link'
import { MessageSquare, ThumbsUp } from 'lucide-react'

import { COMMUNITY_SPACES } from '@/lib/community/constants'
import { formatTimeAgo } from '@/lib/community/format-time-ago'
import { POST_STAGE_LABELS, type PostStage } from '@/lib/community/post-schema'
import type { CommunityPostFeedItem } from '@/lib/community/queries'
import type { ProfileBadge } from '@/types/supabase'
import { cn } from '@/lib/utils'

const BADGE_LABELS: Record<NonNullable<ProfileBadge>, string> = {
  member: 'Member',
  builder: 'Builder',
  verified_founder: 'Verified Founder',
}

const STAGE_TAG_STYLES: Record<
  PostStage,
  { label: string; className: string }
> = {
  idea: {
    label: 'IDEA',
    className: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  },
  wireframe: {
    label: 'WIREFRAME',
    className: 'border-sky-500/40 bg-sky-500/10 text-sky-400',
  },
  beta: {
    label: 'BETA',
    className: 'border-orange-500/40 bg-orange-500/10 text-orange-400',
  },
  live: {
    label: 'LIVE',
    className: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
  },
}

const SPACE_TAG_STYLES: Record<string, string> = {
  validate: 'border-amber-500/30 text-amber-500/90',
  build: 'border-sky-500/30 text-sky-400/90',
  launch: 'border-emerald-500/30 text-emerald-400/90',
  grow: 'border-violet-500/30 text-violet-400/90',
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
        width={36}
        height={36}
        className="h-9 w-9 rounded-lg border border-zinc-800 object-cover ring-1 ring-zinc-900"
      />
    )
  }

  return (
    <span
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/80 font-mono text-xs font-bold text-amber-500"
      aria-hidden
    >
      {initial}
    </span>
  )
}

export function PostCard({ post }: PostCardProps) {
  const spaceLabel = COMMUNITY_SPACES[post.space]?.label ?? post.space
  const stageStyle = STAGE_TAG_STYLES[post.stage]
  const stageLabel = POST_STAGE_LABELS[post.stage] ?? post.stage
  const badgeLabel = post.author.badge ? BADGE_LABELS[post.author.badge] : null
  const spaceTagClass = SPACE_TAG_STYLES[post.space] ?? 'border-zinc-700 text-zinc-400'

  return (
    <Link
      href={`/community/${post.slug}`}
      className={cn(
        'group block rounded-xl border border-zinc-900 bg-zinc-900/30 p-5 transition-all duration-200',
        'hover:border-amber-500/30 hover:bg-zinc-900/50 hover:shadow-[0_0_28px_rgba(245,158,11,0.06)]'
      )}
    >
      <div className="flex items-start gap-4">
        <AuthorAvatar name={post.author.displayName} avatarUrl={post.author.avatarUrl} />

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
            <span className="font-bold text-zinc-300">{post.author.displayName}</span>
            {badgeLabel ? (
              <span
                className={cn(
                  'rounded border px-1.5 py-0.5 font-bold',
                  post.author.badge === 'verified_founder'
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                    : 'border-zinc-800 bg-black/40 text-zinc-500'
                )}
              >
                {badgeLabel}
              </span>
            ) : null}
            <span aria-hidden className="text-zinc-800">
              ·
            </span>
            <time dateTime={post.createdAt}>{formatTimeAgo(post.createdAt)}</time>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'rounded border bg-black/30 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest',
                spaceTagClass
              )}
            >
              {spaceLabel}
            </span>
            <span
              className={cn(
                'rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest',
                stageStyle.className
              )}
            >
              {stageStyle.label}
            </span>
            <span className="sr-only">{stageLabel}</span>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-bold leading-snug text-zinc-100 transition-colors duration-150 group-hover:text-amber-500">
              {post.title}
            </h3>
            <p className="text-sm leading-relaxed text-zinc-600 transition-colors group-hover:text-zinc-500">
              {truncateBody(post.body)}
            </p>
          </div>

          <div className="flex items-center gap-5 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
            <span className="inline-flex items-center gap-1.5 transition-colors group-hover:text-zinc-500">
              <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
              {post.upvotes} upvotes
            </span>
            <span className="inline-flex items-center gap-1.5 transition-colors group-hover:text-zinc-500">
              <MessageSquare className="h-3.5 w-3.5" aria-hidden />
              {post.commentCount} replies
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
