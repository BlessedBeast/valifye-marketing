import type { CommunitySpaceId } from '@/lib/community/constants'
import type { PostStage } from '@/lib/community/post-schema'
import type { KarmaEventRow, ProfileBadge } from '@/types/supabase'

export type CommunityPostSort = 'new' | 'top'

/** Default page size for community feed pagination (server + client). */
export const DEFAULT_COMMUNITY_FEED_LIMIT = 30

/** Hard cap on rows per feed request. */
export const MAX_COMMUNITY_FEED_LIMIT = 100

export type CommunityPostAuthor = {
  displayName: string
  /** Profile handle (e.g. `beastmanewow_a1fc`). Null for bot/deleted authors. */
  username: string | null
  avatarUrl: string | null
  badge: ProfileBadge
}

export type CommunityPostFeedItem = {
  id: string
  slug: string
  title: string
  body: string
  space: CommunitySpaceId
  stage: PostStage
  upvotes: number
  commentCount: number
  createdAt: string
  author: CommunityPostAuthor
  /** Whether the signed-in viewer has an active upvote row for this post. */
  hasUpvoted: boolean
  /** Public URLs of attached images. Empty array when none. */
  imageUrls: string[]
  /** Whether the signed-in viewer authored this post. */
  isOwner: boolean
}

export type CommunityThreadPost = CommunityPostFeedItem & {
  productUrl: string | null
}

export type CommunityCommentItem = {
  id: string
  parentId: string | null
  body: string
  upvotes: number
  createdAt: string
  author: CommunityPostAuthor
  hasUpvoted: boolean
  isBot: boolean
  /** Public URLs of attached images. Empty array when none. */
  imageUrls: string[]
  /** Whether the signed-in viewer authored this comment. */
  isOwner: boolean
}

export type CommunityBotScanCompetitor = {
  domain: string
  title: string
  url: string
  snippet: string
}

export type CommunityBotScanItem = {
  id: string
  postId: string
  keywordCpc: number | null
  competitorCount: number | null
  competitors: CommunityBotScanCompetitor[]
  verdict: string | null
  competitorDensity: string | null
  fullReportUrl: string | null
  createdAt: string
}

export type CommunityThreadPageData = {
  post: CommunityThreadPost
  comments: CommunityCommentItem[]
  botScan: CommunityBotScanItem | null
  isAuthenticated: boolean
}

export type CommunityLeaderboardEntry = {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  badge: ProfileBadge
  karmaPoints: number
  totalReviews: number
}

export type CommunityUserProfile = {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  badge: ProfileBadge
  bio: string | null
  karmaPoints: number
  totalReviews: number
}

export type CommunityKarmaEventItem = {
  id: string
  eventType: KarmaEventRow['event_type']
  points: number
  referenceId: string | null
  createdAt: string
}
