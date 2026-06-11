import Link from 'next/link'

import { CommunityFeedList } from '@/components/community/CommunityFeedList'
import { FeedSortToggle } from '@/components/community/FeedSortToggle'
import { COMMUNITY_SPACES, COMMUNITY_SPACE_IDS } from '@/lib/community/constants'
import {
  DEFAULT_COMMUNITY_FEED_LIMIT,
  getCommunityPosts,
  type CommunityPostSort,
} from '@/lib/community/queries'
import { getTodayTheme } from '@/lib/community/themes'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

type CommunityFeedPageProps = {
  searchParams: Promise<{ sort?: string }>
}

/** Shared card chrome — identical border, padding, and hover for every space. */
const SPACE_CARD_CLASS = cn(
  'group block rounded-xl border border-zinc-900 bg-zinc-900/40 p-4 transition-all duration-200',
  'hover:border-amber-500/40 hover:bg-zinc-900/50',
  'hover:shadow-[0_0_24px_rgba(245,158,11,0.08)]'
)

const SPACE_TAG_CLASS = 'font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500'

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
    <div className="space-y-10">
      <header className="space-y-4 border-b border-zinc-900 pb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-500">
              Live Feed
            </p>
            <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-100">
              Community Feed
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-zinc-500">
              Welcome to the Valifye founder community. Browse spaces, follow the daily theme,
              and share what you are building.
            </p>
            <p className="text-xs text-zinc-600">
              Today&apos;s theme:{' '}
              <span className="font-bold text-amber-500">{todayTheme.title}</span>
            </p>
          </div>
          <FeedSortToggle active={sort} />
        </div>
      </header>

      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/community/new"
          className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-black shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all hover:bg-amber-400"
        >
          Create a New Post
        </Link>
        <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
          {posts.length}
          {posts.length >= DEFAULT_COMMUNITY_FEED_LIMIT ? '+' : ''} thread
          {posts.length === 1 ? '' : 's'} loaded
        </p>
      </section>

      <CommunityFeedList
        key={sort}
        initialPosts={posts}
        sort={sort}
        emptyState={
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 px-4 py-12 text-center">
            <p className="text-sm text-zinc-500">
              No threads yet. Be the first to post in the community.
            </p>
            <Link
              href="/community/new"
              className="mt-4 inline-block font-mono text-xs font-bold uppercase tracking-widest text-amber-500 underline-offset-4 hover:text-amber-400 hover:underline"
            >
              Start a thread
            </Link>
          </div>
        }
      />

      <section className="space-y-4 border-t border-zinc-900 pt-10">
        <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
          Active Spaces
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {COMMUNITY_SPACE_IDS.map((spaceId) => {
            const space = COMMUNITY_SPACES[spaceId]

            return (
              <li key={spaceId}>
                <Link href={`/community/${spaceId}`} className={SPACE_CARD_CLASS}>
                  <span
                    className={cn(
                      SPACE_TAG_CLASS,
                      'transition-colors group-hover:text-amber-500'
                    )}
                  >
                    {`// ${space.label}`}
                  </span>
                  <p className="mt-2 text-sm font-bold text-zinc-100 transition-colors group-hover:text-white">
                    {space.label}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-600 transition-colors group-hover:text-zinc-500">
                    {space.description}
                  </p>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
