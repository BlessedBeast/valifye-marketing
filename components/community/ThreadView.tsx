import Link from 'next/link'

import { CommentForm } from '@/components/community/CommentForm'
import { CommentThreadList } from '@/components/community/CommentThreadList'
import { PostBodyEditor } from '@/components/community/PostBodyEditor'
import { UpvoteButton } from '@/components/community/UpvoteButton'
import { COMMUNITY_SPACES } from '@/lib/community/constants'
import { formatTimeAgo } from '@/lib/community/format-time-ago'
import { POST_STAGE_LABELS } from '@/lib/community/post-schema'
import type { CommunityThreadPageData } from '@/types/community'
import type { ProfileBadge } from '@/types/supabase'
import { cn } from '@/lib/utils'

const BADGE_LABELS: Record<NonNullable<ProfileBadge>, string> = {
  member: 'Member',
  builder: 'Builder',
  verified_founder: 'Verified Founder',
}

const VALIFYE_DASHBOARD_URL = 'https://app.valifye.com/'

type ThreadViewProps = {
  data: CommunityThreadPageData
}

function AuthorMeta({
  displayName,
  username,
  badge,
  createdAt,
}: {
  displayName: string
  username: string | null
  badge: ProfileBadge
  createdAt: string
}) {
  const badgeLabel = badge ? BADGE_LABELS[badge] : null

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">{displayName}</span>
      {username ? (
        <Link
          href={`/community/u/${username}`}
          className="font-mono text-amber-500/90 underline-offset-4 hover:text-amber-400 hover:underline"
        >
          @{username}
        </Link>
      ) : null}
      {badgeLabel ? (
        <span
          className={cn(
            'rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider',
            badge === 'verified_founder'
              ? 'border border-primary/40 bg-primary/10 text-primary'
              : 'border border-border bg-background text-muted-foreground'
          )}
        >
          {badgeLabel}
        </span>
      ) : null}
      <span aria-hidden>·</span>
      <time dateTime={createdAt}>{formatTimeAgo(createdAt)}</time>
    </div>
  )
}

export function ThreadView({ data }: ThreadViewProps) {
  const { post, comments, botScan, isAuthenticated } = data
  const spaceLabel = COMMUNITY_SPACES[post.space]?.label ?? post.space
  const stageLabel = POST_STAGE_LABELS[post.stage] ?? post.stage

  return (
    <article className="space-y-8">
      <header className="space-y-4 border-b border-border pb-6">
        <Link
          href="/community"
          className="text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
        >
          ← Back to feed
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded border border-border bg-background px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-primary">
            {spaceLabel}
          </span>
          <span className="rounded border border-border bg-background px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {stageLabel}
          </span>
        </div>

        <h1 className="text-2xl font-bold leading-tight text-foreground md:text-3xl">
          {post.title}
        </h1>

        <AuthorMeta
          displayName={post.author.displayName}
          username={post.author.username}
          badge={post.author.badge}
          createdAt={post.createdAt}
        />
      </header>

      <section className="space-y-4">
        <PostBodyEditor
          key={`${post.id}-${post.title}-${post.body}-${post.stage}`}
          postId={post.id}
          postSlug={post.slug}
          title={post.title}
          body={post.body}
          stage={post.stage}
          imageUrls={post.imageUrls}
          canEdit={post.isOwner}
        />

        {post.productUrl ? (
          <p className="text-sm">
            <span className="text-muted-foreground">Product link: </span>
            <a
              href={post.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              {post.productUrl}
            </a>
          </p>
        ) : null}

        <UpvoteButton
          key={`${post.id}-${post.upvotes}-${post.hasUpvoted}`}
          targetId={post.id}
          targetType="post"
          threadSlug={post.slug}
          initialUpvoteCount={post.upvotes}
          initialHasUpvoted={post.hasUpvoted}
          disabled={!isAuthenticated}
        />
      </section>

      {botScan ? (
        <section
          className="space-y-4 rounded-lg border border-emerald-500/35 bg-emerald-950/20 p-5 shadow-[0_0_40px_-16px_rgba(16,185,129,0.25)]"
          aria-label="Valifye autonomous market audit"
        >
          <h2 className="text-sm font-semibold text-emerald-300">
            🤖 Valifye Autonomous Market Audit
          </h2>

          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-emerald-500/20 bg-emerald-950/30 px-3 py-2">
              <dt className="font-mono text-[10px] uppercase tracking-wider text-emerald-400/70">
                Keyword CPC
              </dt>
              <dd className="mt-1 font-mono text-sm font-bold tabular-nums text-emerald-100">
                {botScan.keywordCpc != null
                  ? `$${botScan.keywordCpc.toFixed(2)}`
                  : '—'}
              </dd>
            </div>
            <div className="rounded-md border border-emerald-500/20 bg-emerald-950/30 px-3 py-2">
              <dt className="font-mono text-[10px] uppercase tracking-wider text-emerald-400/70">
                Competitors
              </dt>
              <dd className="mt-1 font-mono text-sm font-bold tabular-nums text-emerald-100">
                {botScan.competitorCount ?? '—'}
              </dd>
            </div>
            <div className="rounded-md border border-emerald-500/20 bg-emerald-950/30 px-3 py-2">
              <dt className="font-mono text-[10px] uppercase tracking-wider text-emerald-400/70">
                Density
              </dt>
              <dd className="mt-1 font-mono text-sm font-bold uppercase text-emerald-100">
                {botScan.competitorDensity ?? '—'}
              </dd>
            </div>
          </dl>

          {botScan.competitors.length > 0 ? (
            <div className="space-y-2">
              <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/70">
                Mapped competitor domains
              </h3>
              <ul className="space-y-1.5">
                {botScan.competitors.map((competitor) => (
                  <li key={competitor.url || competitor.domain} className="text-sm">
                    <a
                      href={competitor.url || `https://${competitor.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono font-semibold text-emerald-300 underline-offset-4 hover:underline"
                    >
                      {competitor.domain}
                    </a>
                    {competitor.title ? (
                      <span className="ml-2 text-emerald-50/70">{competitor.title}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <a
            href={VALIFYE_DASHBOARD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-mono text-xs font-bold uppercase tracking-widest text-emerald-300 underline-offset-4 hover:underline"
          >
            Open full forensic report →
          </a>
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {comments.length} {comments.length === 1 ? 'Reply' : 'Replies'}
        </h2>

        <CommentThreadList
          postId={post.id}
          postSlug={post.slug}
          comments={comments}
          isAuthenticated={isAuthenticated}
        />
      </section>

      <section className="border-t border-border pt-6">
        <CommentForm
          postId={post.id}
          postSlug={post.slug}
          disabled={!isAuthenticated}
        />
      </section>
    </article>
  )
}
