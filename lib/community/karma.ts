import { getSupabaseAdmin } from '@/lib/supabase'
import { KARMA_RULES } from '@/lib/community/constants'

export type KarmaEventType = 'review_given'

/**
 * Awards review karma (+3) and writes an immutable audit row to karma_events.
 * Intended for background invocation after a qualifying comment is posted.
 */
export async function awardReviewKarma(
  userId: string,
  commentId: string
): Promise<void> {
  const supabase = getSupabaseAdmin()
  const delta = KARMA_RULES.REVIEW_GIVEN.delta

  const { error: rpcError } = await supabase.rpc('increment_karma', {
    p_user_id: userId,
    p_delta: delta,
  })

  if (rpcError) {
    console.error('[community] increment_karma RPC failed:', rpcError.message)
    throw rpcError
  }

  const { error: eventError } = await supabase.from('karma_events').insert({
    user_id: userId,
    event_type: 'review_given' satisfies KarmaEventType,
    delta,
    reference_id: commentId,
  })

  if (eventError) {
    console.error('[community] karma_events insert failed:', eventError.message)
    throw eventError
  }
}
