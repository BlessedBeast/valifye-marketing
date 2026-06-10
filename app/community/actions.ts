'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

import {
  createCommentSchema,
  upvoteTargetSchema,
  type UpvoteTargetType,
} from '@/lib/community/comment-schema'
import { runPreWriteGate, scheduleModeration } from '@/lib/community/moderation'
import type { RequestFingerprint } from '@/lib/community/types'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createClient } from '@/utils/supabase/server'

export type ToggleUpvoteResult = {
  upvoteCount: number
  userHasUpvoted: boolean
  error?: string
}

export type CreateCommentResult = {
  commentId?: string
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

/**
 * Recounts upvote rows and syncs the cached counter on the parent post/comment.
 * Runs on the service-role client: the global counter must update even when the
 * viewer upvotes another author's content, which user-scoped RLS would block.
 */
async function syncTargetUpvoteCount(
  targetId: string,
  targetType: UpvoteTargetType
): Promise<number> {
  const admin = getSupabaseAdmin()

  const { count, error: countError } = await admin
    .from('upvotes')
    .select('id', { count: 'exact', head: true })
    .eq('target_id', targetId)
    .eq('target_type', targetType)

  if (countError) {
    console.error('[community] upvote count failed:', countError.message)
    return 0
  }

  const upvoteCount = count ?? 0
  const countTable = targetType === 'post' ? 'posts' : 'comments'

  const { error: updateError } = await admin
    .from(countTable)
    .update({ upvotes: upvoteCount })
    .eq('id', targetId)

  if (updateError) {
    console.error('[community] upvote count sync failed:', updateError.message)
  }

  return upvoteCount
}

function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === '23505'
}

/**
 * Idempotent upvote toggle: DELETE when a row exists, INSERT when it does not.
 * Handles duplicate-key races by falling back to DELETE on conflict.
 */
async function toggleUpvoteRecord(
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

  let hasUpvoted: boolean

  if (existing?.id) {
    const { error: deleteError } = await supabase
      .from('upvotes')
      .delete()
      .eq('user_id', userId)
      .eq('target_id', targetId)
      .eq('target_type', targetType)

    if (deleteError) {
      return { upvoteCount: 0, userHasUpvoted: true, error: deleteError.message }
    }

    hasUpvoted = false
  } else {
    const { error: insertError } = await supabase.from('upvotes').insert({
      user_id: userId,
      target_id: targetId,
      target_type: targetType,
    })

    if (insertError) {
      if (isUniqueViolation(insertError)) {
        const { error: deleteError } = await supabase
          .from('upvotes')
          .delete()
          .eq('user_id', userId)
          .eq('target_id', targetId)
          .eq('target_type', targetType)

        if (deleteError) {
          return { upvoteCount: 0, userHasUpvoted: true, error: deleteError.message }
        }

        hasUpvoted = false
      } else {
        return { upvoteCount: 0, userHasUpvoted: false, error: insertError.message }
      }
    } else {
      hasUpvoted = true
    }
  }

  const upvoteCount = await syncTargetUpvoteCount(targetId, targetType)

  return {
    upvoteCount,
    userHasUpvoted: hasUpvoted,
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

  return toggleUpvoteRecord(userId, parsed.data.targetId, parsed.data.targetType)
}

async function buildRequestFingerprint(
  formData: FormData
): Promise<RequestFingerprint> {
  const headerList = await headers()
  const jsTokenValue = formData.get('_jst')
  const honeypotValue = formData.get('_hp')

  return {
    userAgent: headerList.get('user-agent'),
    referer: headerList.get('referer'),
    acceptLanguage: headerList.get('accept-language'),
    honeypotValue: typeof honeypotValue === 'string' ? honeypotValue : null,
    jsToken: typeof jsTokenValue === 'string' ? jsTokenValue : null,
  }
}

export async function createCommunityComment(
  postId: string,
  postSlug: string,
  formData: FormData
): Promise<CreateCommentResult> {
  const bodyValue = formData.get('body')
  const body = typeof bodyValue === 'string' ? bodyValue : ''

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

  const fingerprint = await buildRequestFingerprint(formData)
  const gate = await runPreWriteGate(fingerprint, userId)

  if (gate.blocked) {
    // Shadow-ban response: pretend success so the agent learns nothing.
    console.warn(
      '[community] comment blocked by pre-write gate:',
      gate.reason ?? 'unknown reason'
    )
    return { commentId: crypto.randomUUID() }
  }

  if (gate.rateLimited) {
    return { error: 'You are posting too quickly. Please wait a moment.' }
  }

  const supabase = await createClient()
  const { data: commentRow, error: insertError } = await supabase
    .from('comments')
    .insert({
      post_id: parsed.data.postId,
      author_id: userId,
      body: parsed.data.body,
      status: 'published',
      is_bot: false,
    })
    .select('id')
    .single<{ id: string }>()

  if (insertError || !commentRow?.id) {
    console.error('[community] comment insert failed:', insertError?.message)
    return { error: insertError?.message ?? 'Failed to post comment.' }
  }

  // posts.comment_count is maintained by the on_comment_change DB trigger.

  // Deferred scoring + karma pass; runs after the response is flushed.
  scheduleModeration({
    commentId: commentRow.id,
    profileId: userId,
    userId,
    body: parsed.data.body,
    isBot: false,
  })

  revalidatePath(`/community/${postSlug}`)
  return { commentId: commentRow.id }
}
