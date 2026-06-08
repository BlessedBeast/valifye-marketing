'use server'

import { after } from 'next/server'
import { revalidatePath } from 'next/cache'

import {
  createCommentSchema,
  MIN_COMMENT_BODY_CHARS,
  upvoteTargetSchema,
  type UpvoteTargetType,
} from '@/lib/community/comment-schema'
import { awardReviewKarma } from '@/lib/community/karma'
import { incrementPostCommentCount } from '@/lib/community/post-mutations'
import { createClient } from '@/utils/supabase/server'

export type ToggleUpvoteResult = {
  upvoteCount: number
  userHasUpvoted: boolean
  error?: string
}

export type CreateCommentResult = {
  error?: string
}

async function requireAuthenticatedUserId(): Promise<string> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('Unauthorized')
  }

  return user.id
}

async function toggleUpvoteFallback(
  userId: string,
  targetId: string,
  targetType: UpvoteTargetType
): Promise<ToggleUpvoteResult> {
  const supabase = await createClient()

  const { data: existing, error: lookupError } = await supabase
    .from('upvotes')
    .select('id')
    .eq('user_id', userId)
    .eq('target_id', targetId)
    .eq('target_type', targetType)
    .maybeSingle<{ id: string }>()

  if (lookupError) {
    return { upvoteCount: 0, userHasUpvoted: false, error: lookupError.message }
  }

  if (existing?.id) {
    const { error: deleteError } = await supabase
      .from('upvotes')
      .delete()
      .eq('id', existing.id)

    if (deleteError) {
      return { upvoteCount: 0, userHasUpvoted: true, error: deleteError.message }
    }
  } else {
    const { error: insertError } = await supabase.from('upvotes').insert({
      user_id: userId,
      target_id: targetId,
      target_type: targetType,
    })

    if (insertError) {
      return { upvoteCount: 0, userHasUpvoted: false, error: insertError.message }
    }
  }

  const countTable = targetType === 'post' ? 'posts' : 'comments'
  const { data: targetRow, error: countError } = await supabase
    .from(countTable)
    .select('upvotes')
    .eq('id', targetId)
    .maybeSingle<{ upvotes: number | null }>()

  if (countError || !targetRow) {
    return {
      upvoteCount: 0,
      userHasUpvoted: !existing?.id,
      error: countError?.message,
    }
  }

  return {
    upvoteCount: targetRow.upvotes ?? 0,
    userHasUpvoted: !existing?.id,
  }
}

export async function toggleCommunityUpvote(
  targetId: string,
  targetType: UpvoteTargetType
): Promise<ToggleUpvoteResult> {
  const parsed = upvoteTargetSchema.safeParse({ targetId, targetType })
  if (!parsed.success) {
    return {
      upvoteCount: 0,
      userHasUpvoted: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid upvote target.',
    }
  }

  let userId: string
  try {
    userId = await requireAuthenticatedUserId()
  } catch {
    return { upvoteCount: 0, userHasUpvoted: false, error: 'Unauthorized' }
  }

  const supabase = await createClient()
  const { data: rpcData, error: rpcError } = await supabase.rpc(
    'toggle_community_upvote',
    {
      p_target_id: parsed.data.targetId,
      p_target_type: parsed.data.targetType,
    }
  )

  if (!rpcError && rpcData) {
    const payload = rpcData as {
      upvote_count?: number
      user_has_upvoted?: boolean
    }
    return {
      upvoteCount: payload.upvote_count ?? 0,
      userHasUpvoted: Boolean(payload.user_has_upvoted),
    }
  }

  if (rpcError) {
    console.warn('[community] toggle_community_upvote RPC unavailable:', rpcError.message)
  }

  return toggleUpvoteFallback(userId, parsed.data.targetId, parsed.data.targetType)
}

export async function createCommunityComment(
  postId: string,
  postSlug: string,
  body: string
): Promise<CreateCommentResult> {
  const parsed = createCommentSchema.safeParse({ postId, body })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid comment.' }
  }

  let userId: string
  try {
    userId = await requireAuthenticatedUserId()
  } catch {
    return { error: 'Unauthorized' }
  }

  const supabase = await createClient()
  const { data: commentRow, error: insertError } = await supabase
    .from('comments')
    .insert({
      post_id: parsed.data.postId,
      author_id: userId,
      body: parsed.data.body,
      status: 'active',
      is_bot: false,
    })
    .select('id')
    .single<{ id: string }>()

  if (insertError || !commentRow?.id) {
    console.error('[community] comment insert failed:', insertError?.message)
    return { error: insertError?.message ?? 'Failed to post comment.' }
  }

  await incrementPostCommentCount(parsed.data.postId)

  if (parsed.data.body.length >= MIN_COMMENT_BODY_CHARS) {
    const commentId = commentRow.id
    after(async () => {
      try {
        await awardReviewKarma(userId, commentId)
      } catch (error) {
        console.error('[community] review karma award failed:', error)
      }
    })
  }

  revalidatePath(`/community/${postSlug}`)
  return {}
}
