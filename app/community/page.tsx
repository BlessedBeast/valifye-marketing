import Link from 'next/link'

import { FeedSortToggle } from '@/components/community/FeedSortToggle'
import { PostCard } from '@/components/community/PostCard'
import {
  COMMUNITY_SPACES,
  COMMUNITY_SPACE_IDS,
} from '@/lib/community/constants'
import {
  DEFAULT_COMMUNITY_FEED_LIMIT,
  getCommunityPosts,
  type CommunityPostSort,
} from '@/lib/community/queries'
import { getTodayTheme } from '@/lib/community/themes'

export const dynamic = 'force-dynamic'

type CommunityFeedPageProps = {
  searchParams: Promise<{ sort?: string }>
}

function parseSort(raw: string | undefined): CommunityPostSort {
  return raw === 'top' ? 'top' : 'new'
}

export default async function CommunityFeedPage({
  searchParams,
}: CommunityFeedPageProps) {
  const resolvedSearchParams = await searchParams
  const sort = parseSort(resolvedSearchParams.sort)
  const todayTheme = getTodayTheme()
  const posts = await getCommunityPosts({
    sort,
    limit: DEFAULT_COMMUNITY_FEED_LIMIT,
  })

  return (
    <div className="space-y-8">
      <header className="space-y-4 border-b border-border pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Community Feed</h1>
            <p className="text-sm text-muted-foreground">
              Welcome to the Valifye founder community. Browse spaces, follow the daily
              theme, and share what you are building.
            </p>
            <p className="text-xs text-muted-foreground">
              Today&apos;s theme:{' '}
              <span className="text-foreground">{todayTheme.title}</span>
            </p>
          </div>
          <FeedSortToggle active={sort} />
        </div>
      </header>

      <section className="flex items-center justify-between gap-3">
        <Link
          href="/community/new"
          className="inline-flex items-center rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
        >
          Create a new post
        </Link>
        <p className="text-xs text-muted-foreground">
          {posts.length} thread{posts.length === 1 ? '' : 's'}
        </p>
      </section>

      <section className="space-y-3">
        {posts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card/50 px-4 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No threads yet. Be the first to post in the community.
            </p>
            <Link
              href="/community/new"
              className="mt-3 inline-block text-sm text-primary underline-offset-4 hover:underline"
            >
              Start a thread
            </Link>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.slug} post={post} />)
        )}
      </section>

      <section className="space-y-3 border-t border-border pt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Active Spaces
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {COMMUNITY_SPACE_IDS.map((spaceId) => {
            const space = COMMUNITY_SPACES[spaceId]
            return (
              <li key={spaceId}>
                <Link
                  href={`/community/${spaceId}`}
                  className="block rounded-md border border-border bg-card px-3 py-2 text-sm transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <span className="font-medium text-foreground">{space.label}</span>
                  <span className="text-muted-foreground"> — {space.description}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
