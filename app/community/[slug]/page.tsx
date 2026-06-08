import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PostCard } from '@/components/community/PostCard'
import { ThreadView } from '@/components/community/ThreadView'
import {
  COMMUNITY_SPACES,
  COMMUNITY_SPACE_IDS,
  type CommunitySpaceId,
} from '@/lib/community/constants'
import {
  DEFAULT_COMMUNITY_FEED_LIMIT,
  getCommunityPosts,
  getThreadPageData,
  type CommunityPostSort,
} from '@/lib/community/queries'

export const dynamic = 'force-dynamic'
export const dynamicParams = true

const SPACE_FEED_SUBTITLES: Record<CommunitySpaceId, string> = {
  validate: 'Idea-stage validation before writing code',
  build: 'Ship logs, stack decisions, and in-progress founder updates',
  launch: 'Product launches, promos, and go-to-market threads',
  grow: 'Traction, retention, and scaling experiments',
}

type CommunitySlugPageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sort?: string }>
}

function isCommunitySpaceId(slug: string): slug is CommunitySpaceId {
  return (COMMUNITY_SPACE_IDS as readonly string[]).includes(slug)
}

function parseSort(raw: string | undefined): CommunityPostSort {
  return raw === 'top' ? 'top' : 'new'
}

async function SpaceFeedView({
  spaceId,
  sort,
}: {
  spaceId: CommunitySpaceId
  sort: CommunityPostSort
}) {
  const space = COMMUNITY_SPACES[spaceId]
  const posts = await getCommunityPosts({
    space: spaceId,
    sort,
    limit: DEFAULT_COMMUNITY_FEED_LIMIT,
  })

  return (
    <div className="space-y-6">
      <header className="space-y-2 border-b border-border pb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          Space
        </p>
        <h1 className="text-2xl font-bold text-foreground">
          {space.label} Feed
        </h1>
        <p className="text-sm text-muted-foreground">
          {SPACE_FEED_SUBTITLES[spaceId]}
        </p>
      </header>

      <div className="flex items-center justify-between gap-3">
        <Link
          href="/community/new"
          className="inline-flex items-center rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
        >
          Start a thread in {space.label}
        </Link>
        <p className="text-xs text-muted-foreground">
          {posts.length} thread{posts.length === 1 ? '' : 's'}
        </p>
      </div>

      <section className="space-y-3">
        {posts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card/50 px-4 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No threads in {space.label} yet.
            </p>
            <Link
              href="/community/new"
              className="mt-3 inline-block text-sm text-primary underline-offset-4 hover:underline"
            >
              Create the first post
            </Link>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.slug} post={post} />)
        )}
      </section>
    </div>
  )
}

export default async function CommunitySlugPage({
  params,
  searchParams,
}: CommunitySlugPageProps) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams
  const sort = parseSort(resolvedSearchParams.sort)

  if (isCommunitySpaceId(slug)) {
    return <SpaceFeedView spaceId={slug} sort={sort} />
  }

  const threadData = await getThreadPageData(slug)
  if (!threadData) {
    notFound()
  }

  return <ThreadView data={threadData} />
}
