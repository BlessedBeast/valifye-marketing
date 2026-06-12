'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { MIN_COMMENT_BODY_CHARS } from '@/lib/community/comment-schema'
import {
  scheduleModeration,
  schedulePostModeration,
} from '@/lib/community/moderation'
import {
  MIN_POST_BODY_CHARS,
  POST_STAGES,
  type PostStage,
} from '@/lib/community/post-schema'
import { createClient } from '@/utils/supabase/server'

export type UpdateContentResult = {
  success?: boolean
  error?: string
}

const UNAUTHORIZED_EDIT_ERROR =
  'Unauthorized: you can only edit your own content.'

const updateCommentSchema = z.object({
  commentId: z.string().uuid('Invalid comment reference.'),
  postSlug: z.string().trim().min(1, 'Missing thread reference.'),
  body: z
    .string()
    .trim()
    .min(
      MIN_COMMENT_BODY_CHARS,
      `Comments must be at least ${MIN_COMMENT_BODY_CHARS} characters.`
    )
    .max(10_000, 'Comment is too long.'),
})

const updatePostSchema = z.object({
  postId: z.string().uuid('Invalid post reference.'),
  postSlug: z.string().trim().min(1, 'Missing thread reference.'),
  title: z
    .string()
    .trim()
    .min(8, 'Title must be at least 8 characters.')
    .max(140, 'Title must be 140 characters or fewer.'),
  body: z
    .string()
    .trim()
    .min(
      MIN_POST_BODY_CHARS,
      `Post body must be at least ${MIN_POST_BODY_CHARS} characters.`
    )
    .max(40_000, 'Post body is too long.'),
  stage: z.enum(POST_STAGES as readonly [PostStage, ...PostStage[]]),
})

async function getAuthenticatedUserId(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null
  return user.id
}

/**
 * Edits a comment owned by the signed-in user, resets its moderation score,
 * and schedules a fresh moderation pass against the new body.
 */
export async function updateCommunityComment(
  formData: FormData
): Promise<UpdateContentResult> {
  const parsed = updateCommentSchema.safeParse({
    commentId: formData.get('commentId'),
    postSlug: formData.get('postSlug'),
    body: formData.get('body'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid edit.' }
  }

  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return { error: 'Unauthorized' }
  }

  const supabase = await createClient()

  const { data: commentRow, error: lookupError } = await supabase
    .from('comments')
    .select('author_id, is_bot')
    .eq('id', parsed.data.commentId)
    .maybeSingle<{ author_id: string | null; is_bot: boolean }>()

  if (lookupError) {
    console.error('[community] comment edit lookup failed:', lookupError.message)
    return { error: 'Could not load comment. Try again.' }
  }

  if (!commentRow) {
    return { error: 'Comment not found.' }
  }

  if (commentRow.is_bot || commentRow.author_id !== userId) {
    return { error: UNAUTHORIZED_EDIT_ERROR }
  }

  const { error: updateError } = await supabase
    .from('comments')
    .update({
      body: parsed.data.body,
      moderation_score: null,
    })
    .eq('id', parsed.data.commentId)
    .eq('author_id', userId)

  if (updateError) {
    console.error('[community] comment edit failed:', updateError.message)
    return { error: 'Failed to save changes. Please try again.' }
  }

  // Re-check the edited body for fluff / AI copy after the response flushes.
  scheduleModeration({
    commentId: parsed.data.commentId,
    profileId: userId,
    userId,
    body: parsed.data.body,
    postSlug: parsed.data.postSlug,
    isBot: false,
  })

  revalidatePath('/community')
  revalidatePath(`/community/${parsed.data.postSlug}`)

  return { success: true }
}

/**
 * Edits a post owned by the signed-in user and schedules a fresh thread
 * quality pass against the new body. image_urls is intentionally untouched
 * so existing attachments are preserved through the edit.
 */
export async function updateCommunityPost(
  formData: FormData
): Promise<UpdateContentResult> {
  const parsed = updatePostSchema.safeParse({
    postId: formData.get('postId'),
    postSlug: formData.get('postSlug'),
    title: formData.get('title'),
    body: formData.get('body'),
    stage: formData.get('stage'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid edit.' }
  }

  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return { error: 'Unauthorized' }
  }

  const supabase = await createClient()

  const { data: postRow, error: lookupError } = await supabase
    .from('posts')
    .select('author_id')
    .eq('id', parsed.data.postId)
    .maybeSingle<{ author_id: string }>()

  if (lookupError) {
    console.error('[community] post edit lookup failed:', lookupError.message)
    return { error: 'Could not load post. Try again.' }
  }

  if (!postRow) {
    return { error: 'Post not found.' }
  }

  if (postRow.author_id !== userId) {
    return { error: UNAUTHORIZED_EDIT_ERROR }
  }

  const { error: updateError } = await supabase
    .from('posts')
    .update({
      title: parsed.data.title,
      body: parsed.data.body,
      stage: parsed.data.stage,
    })
    .eq('id', parsed.data.postId)
    .eq('author_id', userId)

  if (updateError) {
    console.error('[community] post edit failed:', updateError.message)
    return { error: 'Failed to save changes. Please try again.' }
  }

  // Re-check the edited body for thread quality after the response flushes.
  schedulePostModeration({
    postId: parsed.data.postId,
    body: parsed.data.body,
    isBot: false,
  })

  revalidatePath('/community')
  revalidatePath(`/community/${parsed.data.postSlug}`)

  return { success: true }
}
