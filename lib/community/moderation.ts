import { after } from 'next/server'

import { detectBotRequest } from '@/lib/community/bot-detection'
import { scoreContent } from '@/lib/community/content-scoring'
import { awardCommentKarma } from '@/lib/community/karma'
import type {
  ModerationFlagType,
  RequestFingerprint,
} from '@/lib/community/types'
import { getSupabaseAdmin } from '@/lib/supabase'

/**
 * Moderation orchestrator: the synchronous pre-write gate (bot + velocity)
 * and the deferred post-write scoring pass that grades content, persists
 * moderation metadata, and triggers atomic karma awards.
 */

/** Pipeline revision persisted to comments.moderation_version. */
export const MODERATION_VERSION = 1

/** Bot confidence at or above which the request is rejected outright. */
const BOT_BLOCK_CONFIDENCE = 0.65
/** Sliding window for the velocity check, in minutes. */
const VELOCITY_WINDOW_MINS = 10
/** Max submissions allowed inside the velocity window. */
const VELOCITY_LIMIT = 5
/** Score deduction applied when the account is less than a day old. */
const NEW_ACCOUNT_PENALTY = 10
/** Final scores below this mark the comment 'low_quality'. */
const LOW_QUALITY_THRESHOLD = 35
/** Final scores at or above this trigger the atomic karma award. */
const KARMA_AWARD_THRESHOLD = 60
/** Thread post scores below this mark the post 'removed'. */
const POST_REMOVAL_THRESHOLD = 35
/** Max orphaned comments recovered per cron invocation. */
const REPROCESS_BATCH_SIZE = 50
/** Minimum row age before a comment is considered orphaned, in ms. */
const REPROCESS_MIN_AGE_MS = 5 * 60 * 1000

const ONE_DAY_MS = 24 * 60 * 60 * 1000

export type PreWriteGateResult = {
  blocked: boolean
  rateLimited: boolean
  reason: string | null
}

const CLEAN_GATE: PreWriteGateResult = {
  blocked: false,
  rateLimited: false,
  reason: null,
}

/**
 * Synchronous gate executed before any database write.
 * Blocks automated agents and rate-limits high-velocity accounts.
 */
export async function runPreWriteGate(
  fingerprint: RequestFingerprint,
  profileId: string
): Promise<PreWriteGateResult> {
  const botResult = detectBotRequest(fingerprint)

  if (botResult.isBot && botResult.confidence >= BOT_BLOCK_CONFIDENCE) {
    const reason =
      botResult.flags.find((flag) => flag.severity === 'hard')?.reason ??
      'Automated agent signature detected.'
    return { blocked: true, rateLimited: false, reason }
  }

  const supabase = getSupabaseAdmin()
  const { data: velocity, error } = await supabase.rpc('get_user_velocity', {
    p_profile_id: profileId,
    p_window_mins: VELOCITY_WINDOW_MINS,
  })

  if (error) {
    // Fail open: a broken velocity RPC must not take down commenting.
    console.error('[community] get_user_velocity RPC failed:', error.message)
    return CLEAN_GATE
  }

  const count = typeof velocity === 'number' ? velocity : 0
  if (count >= VELOCITY_LIMIT) {
    return { blocked: false, rateLimited: true, reason: 'velocity_limit_exceeded' }
  }

  return CLEAN_GATE
}

export type ScheduleModerationParams = {
  commentId: string
  /** Profile row id of the author (== auth user id in this schema). */
  profileId: string
  /** Auth user id of the author. */
  userId: string
  body: string
  /** True for Valifye Bot comments — these bypass moderation entirely. */
  isBot: boolean
}

/**
 * Defers the moderation scoring pass to after the response is flushed.
 * HARD CRITICAL SHIELD: bot-authored rows are never moderated.
 */
export function scheduleModeration(params: ScheduleModerationParams): void {
  if (params.isBot) {
    return
  }

  after(async () => {
    try {
      await runModerationPass(params)
    } catch (error) {
      console.error('[community] moderation pass failed:', error)
    }
  })
}

async function getAccountCreatedAt(userId: string): Promise<Date | null> {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.auth.admin.getUserById(userId)

    if (error || !data?.user?.created_at) {
      return null
    }

    const createdAt = new Date(data.user.created_at)
    return Number.isNaN(createdAt.getTime()) ? null : createdAt
  } catch {
    return null
  }
}

async function runModerationPass(params: ScheduleModerationParams): Promise<void> {
  const supabase = getSupabaseAdmin()

  const result = scoreContent(params.body)
  let score = result.score
  const flagTypes: ModerationFlagType[] = [
    ...new Set(result.flags.map((flag) => flag.type)),
  ]

  const accountCreatedAt = await getAccountCreatedAt(params.userId)
  if (
    accountCreatedAt &&
    Date.now() - accountCreatedAt.getTime() < ONE_DAY_MS
  ) {
    score = Math.max(0, score - NEW_ACCOUNT_PENALTY)
    if (!flagTypes.includes('new_account')) {
      flagTypes.push('new_account')
    }
  }

  const update: {
    moderation_score: number
    moderation_flags: string[]
    moderation_version: number
    status?: 'low_quality'
  } = {
    moderation_score: score,
    moderation_flags: flagTypes,
    moderation_version: MODERATION_VERSION,
  }

  if (score < LOW_QUALITY_THRESHOLD) {
    update.status = 'low_quality'
  }

  const { error: updateError } = await supabase
    .from('comments')
    .update(update)
    .eq('id', params.commentId)

  if (updateError) {
    console.error(
      '[community] moderation metadata update failed:',
      updateError.message
    )
    return
  }

  if (score >= KARMA_AWARD_THRESHOLD) {
    await awardCommentKarma({
      commentId: params.commentId,
      profileId: params.profileId,
      userId: params.userId,
    })
  }
}

// --- Thread / post moderation -------------------------------------------------

export type SchedulePostModerationParams = {
  postId: string
  body: string
  /** True for Valifye Bot threads — these bypass moderation entirely. */
  isBot: boolean
}

/**
 * Defers the thread quality pass to after the response is flushed.
 * HARD CRITICAL SHIELD: bot-authored threads are never moderated.
 */
export function schedulePostModeration(
  params: SchedulePostModerationParams
): void {
  if (params.isBot) {
    return
  }

  after(async () => {
    try {
      await runPostModerationPass(params)
    } catch (error) {
      console.error('[community] post moderation pass failed:', error)
    }
  })
}

async function runPostModerationPass(
  params: SchedulePostModerationParams
): Promise<void> {
  const result = scoreContent(params.body)

  if (result.score >= POST_REMOVAL_THRESHOLD) {
    return
  }

  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('posts')
    .update({ status: 'removed' })
    .eq('id', params.postId)

  if (error) {
    console.error('[community] post removal update failed:', error.message)
    return
  }

  console.warn(
    `[community] post ${params.postId} removed by quality gate (score ${result.score}).`
  )
}

// --- Fail-safe recovery cron ----------------------------------------------------

export type ReprocessResult = {
  scanned: number
  processed: number
}

type OrphanedCommentRow = {
  id: string
  author_id: string | null
  body: string
}

/**
 * Recovers comments that slipped through the deferred moderation pass
 * (e.g. process death before after() executed). Pulls up to 50 human rows
 * with no moderation score, no karma, and older than 5 minutes, then runs
 * each back through the full evaluation pipeline.
 */
export async function reprocessOrphanedComments(): Promise<ReprocessResult> {
  const supabase = getSupabaseAdmin()
  const cutoff = new Date(Date.now() - REPROCESS_MIN_AGE_MS).toISOString()

  const { data, error } = await supabase
    .from('comments')
    .select('id, author_id, body')
    .eq('is_bot', false)
    .eq('karma_awarded', false)
    .is('moderation_score', null)
    .lt('created_at', cutoff)
    .order('created_at', { ascending: true })
    .limit(REPROCESS_BATCH_SIZE)

  if (error) {
    console.error('[community] orphaned comment query failed:', error.message)
    return { scanned: 0, processed: 0 }
  }

  const rows = (data ?? []) as OrphanedCommentRow[]
  let processed = 0

  for (const row of rows) {
    if (!row.author_id) {
      continue
    }

    try {
      await runModerationPass({
        commentId: row.id,
        profileId: row.author_id,
        userId: row.author_id,
        body: row.body,
        isBot: false,
      })
      processed += 1
    } catch (rowError) {
      console.error(
        `[community] reprocess failed for comment ${row.id}:`,
        rowError
      )
    }
  }

  return { scanned: rows.length, processed }
}
