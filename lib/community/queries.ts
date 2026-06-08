import type { CommunitySpaceId } from '@/lib/community/constants'
import type { PostStage } from '@/lib/community/post-schema'
import type { ProfileBadge, PostRow, ProfileRow, CommentRow, BotScanRow, KarmaEventRow } from '@/types/supabase'
import { createClient } from '@/utils/supabase/server'

export type CommunityPostSort = 'new' | 'top'

export type CommunityPostAuthor = {
  displayName: string
  avatarUrl: string | null
  badge: ProfileBadge
}

export type CommunityPostFeedItem = {
  slug: string
  title: string
  body: string
  space: CommunitySpaceId
  stage: PostStage
  upvotes: number
  commentCount: number
  createdAt: string
  author: CommunityPostAuthor
}

export type CommunityThreadPost = CommunityPostFeedItem & {
  id: string
  productUrl: string | null
  userHasUpvoted: boolean
}

export type CommunityCommentItem = {
  id: string
  parentId: string | null
  body: string
  upvotes: number
  createdAt: string
  author: CommunityPostAuthor
  userHasUpvoted: boolean
  isBot: boolean
}

export type CommunityBotScanItem = {
  id: string
  postId: string
  scanContent: string
  verdict: string | null
  createdAt: string
}

export type CommunityThreadPageData = {
  post: CommunityThreadPost
  comments: CommunityCommentItem[]
  botScan: CommunityBotScanItem | null
  isAuthenticated: boolean
}

export type CommunityLeaderboardEntry = {
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
  delta: number
  referenceId: string | null
  createdAt: string
}

type ProfileLeaderboardRow = Pick<
  ProfileRow,
  | 'username'
  | 'display_name'
  | 'avatar_url'
  | 'badge'
  | 'karma_points'
  | 'total_reviews'
>

type ProfileDetailRow = Pick<
  ProfileRow,
  | 'id'
  | 'username'
  | 'display_name'
  | 'avatar_url'
  | 'badge'
  | 'bio'
  | 'karma_points'
  | 'total_reviews'
>

type ProfileSnippet = Pick<ProfileRow, 'display_name' | 'avatar_url' | 'badge'>

type PostWithProfile = Pick<
  PostRow,
  'slug' | 'title' | 'body' | 'space' | 'stage' | 'upvotes' | 'comment_count' | 'created_at'
> & {
  profiles: ProfileSnippet | ProfileSnippet[] | null
}

type PostDetailRow = Pick<
  PostRow,
  | 'id'
  | 'slug'
  | 'title'
  | 'body'
  | 'space'
  | 'stage'
  | 'upvotes'
  | 'comment_count'
  | 'created_at'
  | 'product_url'
> & {
  profiles: ProfileSnippet | ProfileSnippet[] | null
}

type CommentWithProfile = Pick<
  CommentRow,
  'id' | 'body' | 'upvotes' | 'created_at' | 'is_bot' | 'parent_id'
> & {
  profiles: ProfileSnippet | ProfileSnippet[] | null
}

function resolveProfile(
  profiles: PostWithProfile['profiles']
): ProfileSnippet | null {
  if (profiles == null) return null
  if (Array.isArray(profiles)) return profiles[0] ?? null
  return profiles
}

export const DEFAULT_COMMUNITY_FEED_LIMIT = 30

export const MAX_COMMUNITY_FEED_LIMIT = 100

export type GetCommunityPostsOptions = {
  space?: string
  sort?: CommunityPostSort
  /** Max rows returned. Defaults to 30. Capped at 100. */
  limit?: number
  /** 1-based page index. Ignored when `offset` is set. Defaults to page 1. */
  page?: number
  /** 0-based row offset. Takes precedence over `page`. */
  offset?: number
}

function resolvePaginationRange(options: GetCommunityPostsOptions): {
  from: number
  to: number
} {
  const limit = Math.min(
    MAX_COMMUNITY_FEED_LIMIT,
    Math.max(1, options.limit ?? DEFAULT_COMMUNITY_FEED_LIMIT)
  )
  const offset =
    options.offset ??
    (options.page != null ? Math.max(0, options.page - 1) * limit : 0)

  return { from: offset, to: offset + limit - 1 }
}

function normalizeAuthor(profile: ProfileSnippet | null): CommunityPostAuthor {
  return {
    displayName: profile?.display_name?.trim() || 'Deleted User',
    avatarUrl: profile?.avatar_url ?? null,
    badge: profile?.badge ?? null,
  }
}

function mapPostRow(row: PostWithProfile): CommunityPostFeedItem {
  return {
    slug: row.slug,
    title: row.title,
    body: row.body,
    space: row.space,
    stage: row.stage,
    upvotes: row.upvotes ?? 0,
    commentCount: row.comment_count ?? 0,
    createdAt: row.created_at,
    author: normalizeAuthor(resolveProfile(row.profiles)),
  }
}

function mapPostDetailRow(
  row: PostDetailRow,
  userHasUpvoted: boolean
): CommunityThreadPost {
  return {
    ...mapPostRow(row),
    id: row.id,
    productUrl: row.product_url,
    userHasUpvoted,
  }
}

function mapCommentRow(
  row: CommentWithProfile,
  userHasUpvoted: boolean
): CommunityCommentItem {
  if (row.is_bot) {
    return {
      id: row.id,
      parentId: row.parent_id ?? null,
      body: row.body,
      upvotes: row.upvotes ?? 0,
      createdAt: row.created_at,
      author: {
        displayName: 'Valifye Bot',
        avatarUrl: null,
        badge: null,
      },
      userHasUpvoted,
      isBot: true,
    }
  }

  return {
    id: row.id,
    parentId: row.parent_id ?? null,
    body: row.body,
    upvotes: row.upvotes ?? 0,
    createdAt: row.created_at,
    author: normalizeAuthor(resolveProfile(row.profiles)),
    userHasUpvoted,
    isBot: false,
  }
}

async function getViewerUserId(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id ?? null
}

async function getUserUpvoteTargetIds(
  userId: string | null,
  targetIds: string[],
  targetType: 'post' | 'comment'
): Promise<Set<string>> {
  if (!userId || targetIds.length === 0) return new Set()

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('upvotes')
    .select('target_id')
    .eq('user_id', userId)
    .eq('target_type', targetType)
    .in('target_id', targetIds)

  if (error || !Array.isArray(data)) {
    if (error) console.error('[community] upvote lookup failed:', error.message)
    return new Set()
  }

  return new Set(data.map((row) => row.target_id))
}

export async function getThreadPageData(
  slug: string
): Promise<CommunityThreadPageData | null> {
  const supabase = await createClient()
  const viewerUserId = await getViewerUserId()

  const { data: postData, error: postError } = await supabase
    .from('posts')
    .select(
      `
      id,
      slug,
      title,
      body,
      space,
      stage,
      upvotes,
      comment_count,
      created_at,
      product_url,
      profiles:author_id (
        display_name,
        avatar_url,
        badge
      )
    `
    )
    .eq('slug', slug)
    .eq('status', 'active')
    .maybeSingle<PostDetailRow>()

  if (postError) {
    console.error('[community] getThreadPageData post failed:', postError.message)
    return null
  }

  if (!postData) return null

  const [commentsResult, botScanResult, postUpvotes] = await Promise.all([
    supabase
      .from('comments')
      .select(
        `
        id,
        body,
        upvotes,
        created_at,
        is_bot,
        parent_id,
        profiles:author_id (
          display_name,
          avatar_url,
          badge
        )
      `
      )
      .eq('post_id', postData.id)
      .eq('status', 'active')
      .order('created_at', { ascending: true }),
    supabase
      .from('bot_scans')
      .select('id, post_id, scan_content, verdict, created_at')
      .eq('post_id', postData.id)
      .maybeSingle<BotScanRow>(),
    getUserUpvoteTargetIds(viewerUserId, [postData.id], 'post'),
  ])

  if (commentsResult.error) {
    console.error(
      '[community] getThreadPageData comments failed:',
      commentsResult.error.message
    )
  }

  const commentRows = Array.isArray(commentsResult.data)
    ? (commentsResult.data as CommentWithProfile[])
    : []
  const commentUpvotes = await getUserUpvoteTargetIds(
    viewerUserId,
    commentRows.map((row) => row.id),
    'comment'
  )

  const comments = commentRows.map((row) =>
    mapCommentRow(row, commentUpvotes.has(row.id))
  )

  const botScan = botScanResult.data
    ? {
        id: botScanResult.data.id,
        postId: botScanResult.data.post_id,
        scanContent: botScanResult.data.scan_content,
        verdict: botScanResult.data.verdict,
        createdAt: botScanResult.data.created_at,
      }
    : null

  return {
    post: mapPostDetailRow(postData, postUpvotes.has(postData.id)),
    comments,
    botScan,
    isAuthenticated: viewerUserId != null,
  }
}

export async function getCommunityPosts(
  options: GetCommunityPostsOptions = {}
): Promise<CommunityPostFeedItem[]> {
  const { space, sort = 'new' } = options
  const { from, to } = resolvePaginationRange(options)
  const supabase = await createClient()

  let query = supabase
    .from('posts')
    .select(
      `
      slug,
      title,
      body,
      space,
      stage,
      upvotes,
      comment_count,
      created_at,
      profiles:author_id (
        display_name,
        avatar_url,
        badge
      )
    `
    )
    .eq('status', 'active')

  if (space) {
    query = query.eq('space', space)
  }

  query =
    sort === 'top'
      ? query.order('upvotes', { ascending: false })
      : query.order('created_at', { ascending: false })

  const { data, error } = await query.range(from, to)

  if (error) {
    console.error('[community] getCommunityPosts failed:', error.message)
    return []
  }

  if (!Array.isArray(data)) return []

  return (data as PostWithProfile[]).map(mapPostRow)
}

function mapLeaderboardRow(row: ProfileLeaderboardRow): CommunityLeaderboardEntry {
  return {
    username: row.username,
    displayName: row.display_name?.trim() || row.username,
    avatarUrl: row.avatar_url ?? null,
    badge: row.badge ?? null,
    karmaPoints: row.karma_points ?? 0,
    totalReviews: row.total_reviews ?? 0,
  }
}

function mapProfileDetailRow(row: ProfileDetailRow): CommunityUserProfile {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name?.trim() || row.username,
    avatarUrl: row.avatar_url ?? null,
    badge: row.badge ?? null,
    bio: row.bio?.trim() || null,
    karmaPoints: row.karma_points ?? 0,
    totalReviews: row.total_reviews ?? 0,
  }
}

function mapKarmaEventRow(row: KarmaEventRow): CommunityKarmaEventItem {
  return {
    id: row.id,
    eventType: row.event_type,
    delta: row.delta,
    referenceId: row.reference_id ?? null,
    createdAt: row.created_at,
  }
}

export async function getTopValidators(
  limit = 20
): Promise<CommunityLeaderboardEntry[]> {
  const supabase = await createClient()
  const cappedLimit = Math.min(Math.max(1, limit), MAX_COMMUNITY_FEED_LIMIT)

  const { data, error } = await supabase
    .from('profiles')
    .select('username, display_name, avatar_url, badge, karma_points, total_reviews')
    .order('karma_points', { ascending: false, nullsFirst: false })
    .limit(cappedLimit)

  if (error) {
    console.error('[community] getTopValidators failed:', error.message)
    return []
  }

  if (!Array.isArray(data)) return []

  return (data as ProfileLeaderboardRow[]).map(mapLeaderboardRow)
}

export async function getUserProfileData(
  username: string
): Promise<CommunityUserProfile | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, username, display_name, avatar_url, badge, bio, karma_points, total_reviews'
    )
    .eq('username', username)
    .maybeSingle<ProfileDetailRow>()

  if (error) {
    console.error('[community] getUserProfileData failed:', error.message)
    return null
  }

  if (!data) return null

  return mapProfileDetailRow(data)
}

export async function getUserKarmaEvents(
  userId: string
): Promise<CommunityKarmaEventItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('karma_events')
    .select('id, event_type, delta, reference_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[community] getUserKarmaEvents failed:', error.message)
    return []
  }

  if (!Array.isArray(data)) return []

  return (data as KarmaEventRow[]).map(mapKarmaEventRow)
}

export async function getPostsByAuthorId(
  authorId: string,
  options: { limit?: number } = {}
): Promise<CommunityPostFeedItem[]> {
  const limit = Math.min(
    MAX_COMMUNITY_FEED_LIMIT,
    Math.max(1, options.limit ?? DEFAULT_COMMUNITY_FEED_LIMIT)
  )
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      slug,
      title,
      body,
      space,
      stage,
      upvotes,
      comment_count,
      created_at,
      profiles:author_id (
        display_name,
        avatar_url,
        badge
      )
    `
    )
    .eq('status', 'active')
    .eq('author_id', authorId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[community] getPostsByAuthorId failed:', error.message)
    return []
  }

  if (!Array.isArray(data)) return []

  return (data as PostWithProfile[]).map(mapPostRow)
}
