'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { MessageSquareReply } from 'lucide-react'

import { CommentBodyEditor } from '@/components/community/CommentBodyEditor'
import { CommentForm } from '@/components/community/CommentForm'
import { CommunityImageGrid } from '@/components/community/CommunityImageGrid'
import { UpvoteButton } from '@/components/community/UpvoteButton'
import { formatTimeAgo } from '@/lib/community/format-time-ago'
import type { CommunityCommentItem } from '@/types/community'
import { buildCommentTree, type CommentTreeNode } from '@/lib/community/sort-comments'
import type { ProfileBadge } from '@/types/supabase'
import { cn } from '@/lib/utils'

const BADGE_LABELS: Record<NonNullable<ProfileBadge>, string> = {
  member: 'Member',
  builder: 'Builder',
  verified_founder: 'Verified Founder',
}

const AVATAR_SIZE_PX = 36
/** Half avatar width — aligns the thread spine with avatar center. */
const THREAD_SPINE_OFFSET = AVATAR_SIZE_PX / 2

type CommentThreadListProps = {
  postId: string
  postSlug: string
  comments: CommunityCommentItem[]
  isAuthenticated: boolean
}

function CommentAvatar({
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
        width={AVATAR_SIZE_PX}
        height={AVATAR_SIZE_PX}
        className="h-9 w-9 shrink-0 rounded-lg border border-zinc-800 object-cover ring-1 ring-zinc-900"
      />
    )
  }

  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/80 font-mono text-xs font-bold text-amber-500"
      aria-hidden
    >
      {initial}
    </span>
  )
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

type CommentNodeProps = {
  node: CommentTreeNode
  postId: string
  postSlug: string
  isAuthenticated: boolean
  replyingToId: string | null
  onReply: (commentId: string | null) => void
}

function CommentNode({
  node,
  postId,
  postSlug,
  isAuthenticated,
  replyingToId,
  onReply,
}: CommentNodeProps) {
  const isReplying = replyingToId === node.id
  const hasChildren = node.children.length > 0

  return (
    <li className="list-none">
      <article
        className={cn(
          'rounded-lg p-3 sm:p-4',
          node.isBot
            ? 'border border-emerald-500/30 bg-emerald-950/15'
            : 'border border-border bg-card/60'
        )}
      >
        <div className="flex gap-3">
          <CommentAvatar
            name={node.author.displayName}
            avatarUrl={node.author.avatarUrl}
          />
          <div className="min-w-0 flex-1">
            <AuthorMeta
              displayName={node.author.displayName}
              username={node.author.username}
              badge={node.author.badge}
              createdAt={node.createdAt}
            />
            <div className="mt-3">
              <CommentBodyEditor
                key={`${node.id}-${node.body}`}
                commentId={node.id}
                postSlug={postSlug}
                body={node.body}
                canEdit={node.isOwner}
              />
            </div>
            {node.imageUrls.length > 0 ? (
              <div className="mt-3">
                <CommunityImageGrid urls={node.imageUrls} />
              </div>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <UpvoteButton
                key={`${node.id}-${node.upvotes}-${node.hasUpvoted}`}
                targetId={node.id}
                targetType="comment"
                initialUpvoteCount={node.upvotes}
                initialHasUpvoted={node.hasUpvoted}
                disabled={!isAuthenticated}
              />
              {!node.isBot ? (
                <button
                  type="button"
                  onClick={() => onReply(isReplying ? null : node.id)}
                  disabled={!isAuthenticated}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md border px-2 py-1',
                    'font-mono text-[10px] font-bold uppercase tracking-widest transition-colors',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    isReplying
                      ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                      : 'border-zinc-800 text-zinc-500 hover:border-amber-500/40 hover:text-amber-500'
                  )}
                >
                  <MessageSquareReply className="h-3 w-3" aria-hidden />
                  {isReplying ? 'Cancel' : 'Reply'}
                </button>
              ) : null}
            </div>
            {isReplying ? (
              <CommentForm
                postId={postId}
                postSlug={postSlug}
                parentId={node.id}
                variant="inline"
                onSuccess={() => onReply(null)}
                onCancel={() => onReply(null)}
              />
            ) : null}
          </div>
        </div>
      </article>

      {hasChildren ? (
        <ul
          className={cn(
            'mt-2 space-y-2 border-l-2 border-stone-200 pl-4 transition-colors',
            'dark:border-stone-800 hover:border-amber-500/60'
          )}
          style={{ marginLeft: THREAD_SPINE_OFFSET }}
        >
          {node.children.map((child) => (
            <CommentNode
              key={child.id}
              node={child}
              postId={postId}
              postSlug={postSlug}
              isAuthenticated={isAuthenticated}
              replyingToId={replyingToId}
              onReply={onReply}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export function CommentThreadList({
  postId,
  postSlug,
  comments,
  isAuthenticated,
}: CommentThreadListProps) {
  const [replyingToId, setReplyingToId] = useState<string | null>(null)

  const tree = useMemo(() => buildCommentTree(comments), [comments])

  const totalCount = comments.length

  if (totalCount === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No human replies yet. Be the first to leave constructive feedback.
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {tree.map((root) => (
        <CommentNode
          key={root.id}
          node={root}
          postId={postId}
          postSlug={postSlug}
          isAuthenticated={isAuthenticated}
          replyingToId={replyingToId}
          onReply={setReplyingToId}
        />
      ))}
    </ul>
  )
}
