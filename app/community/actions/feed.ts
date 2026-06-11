'use server'

import type { CommunitySpaceId } from '@/lib/community/constants'
import {
  DEFAULT_COMMUNITY_FEED_LIMIT,
  getCommunityPosts,
  type CommunityPostFeedItem,
  type CommunityPostSort,
} from '@/lib/community/queries'

export type LoadMoreCommunityPostsInput = {
  sort: CommunityPostSort
  offset: number
  space?: CommunitySpaceId
}

export type LoadMoreCommunityPostsResult = {
  posts: CommunityPostFeedItem[]
  error?: string
}

/**
 * Fetches the next page of community feed rows for client-side "Load More".
 */
export async function loadMoreCommunityPosts(
  input: LoadMoreCommunityPostsInput
): Promise<LoadMoreCommunityPostsResult> {
  const offset = Math.max(0, input.offset)

  try {
    const posts = await getCommunityPosts({
      sort: input.sort,
      space: input.space,
      offset,
      limit: DEFAULT_COMMUNITY_FEED_LIMIT,
    })

    return { posts }
  } catch (error) {
    console.error('[community] loadMoreCommunityPosts failed:', error)
    return { posts: [], error: 'Failed to load more threads.' }
  }
}
