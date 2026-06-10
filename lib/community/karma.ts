import { getSupabaseAdmin } from '@/lib/supabase'
import { KARMA_RULES } from '@/lib/community/constants'

export type KarmaEventType = 'review_given'

export type AwardCommentKarmaParams = {
  commentId: string
  profileId: string
  userId: string
  points?: number
  eventType?: KarmaEventType
}

/**
 * Atomically awards comment karma via the award_comment_karma RPC.
 * The database function owns idempotency (karma_awarded), counter increments,
 * and the karma_events audit row in a single transaction.
 * Returns true when points were awarded, false when skipped or failed.
 */
export async function awardCommentKarma(
  params: AwardCommentKarmaParams
): Promise<boolean> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase.rpc('award_comment_karma', {
    p_comment_id: params.commentId,
    p_profile_id: params.profileId,
    p_user_id: params.userId,
    p_points: params.points ?? KARMA_RULES.REVIEW_GIVEN.delta,
    p_event_type: params.eventType ?? ('review_given' satisfies KarmaEventType),
  })

  if (error) {
    console.error('[community] award_comment_karma RPC failed:', error.message)
    return false
  }

  return data === true
}
