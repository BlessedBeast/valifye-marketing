'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'

import { loadMoreCommunityPosts } from '@/app/community/actions/feed'
import { PostCard } from '@/components/community/PostCard'
import type { CommunitySpaceId } from '@/lib/community/constants'
import {
  DEFAULT_COMMUNITY_FEED_LIMIT,
  type CommunityPostFeedItem,
  type CommunityPostSort,
} from '@/lib/community/queries'
import { cn } from '@/lib/utils'

type CommunityFeedListProps = {
  initialPosts: CommunityPostFeedItem[]
  sort: CommunityPostSort
  space?: CommunitySpaceId
  /** Shown when the feed has zero posts on first load. */
  emptyState: React.ReactNode
  className?: string
}

function mergePosts(
  existing: CommunityPostFeedItem[],
  incoming: CommunityPostFeedItem[]
): CommunityPostFeedItem[] {
  if (incoming.length === 0) return existing

  const seen = new Set(existing.map((post) => post.id))
  const unique = incoming.filter((post) => !seen.has(post.id))
  return [...existing, ...unique]
}

export function CommunityFeedList({
  initialPosts,
  sort,
  space,
  emptyState,
  className,
}: CommunityFeedListProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [hasMore, setHasMore] = useState(
    initialPosts.length >= DEFAULT_COMMUNITY_FEED_LIMIT
  )
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const reachedEnd = posts.length > 0 && !hasMore

  function handleLoadMore() {
    setError(null)

    startTransition(async () => {
      const result = await loadMoreCommunityPosts({
        sort,
        space,
        offset: posts.length,
      })

      if (result.error) {
        setError(result.error)
        return
      }

      const batch = result.posts

      if (batch.length === 0) {
        setHasMore(false)
        return
      }

      setPosts((current) => mergePosts(current, batch))

      if (batch.length < DEFAULT_COMMUNITY_FEED_LIMIT) {
        setHasMore(false)
      }
    })
  }

  if (posts.length === 0) {
    return <div className={className}>{emptyState}</div>
  }

  return (
    <div className={cn('space-y-3', className)}>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {hasMore ? (
        <div className="flex flex-col items-center gap-2 pt-4">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isPending}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-6 py-2.5',
              'font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400',
              'transition-colors hover:border-amber-500/40 hover:text-amber-500',
              'disabled:cursor-not-allowed disabled:opacity-60'
            )}
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                Loading…
              </>
            ) : (
              'Load More'
            )}
          </button>
          {error ? (
            <p
              role="alert"
              className="font-mono text-xs text-red-400"
            >
              {error}
            </p>
          ) : null}
        </div>
      ) : reachedEnd ? (
        <p className="pt-4 text-center font-mono text-[10px] uppercase tracking-wider text-zinc-600">
          You&apos;ve reached the bottom of the lounge.
        </p>
      ) : null}
    </div>
  )
}
