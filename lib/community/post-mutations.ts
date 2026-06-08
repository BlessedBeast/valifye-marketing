import { getSupabaseAdmin } from '@/lib/supabase'

/** Atomically bump the cached comment_count on a post row. */
export async function incrementPostCommentCount(postId: string): Promise<void> {
  const supabase = getSupabaseAdmin()

  const { data: postRow, error: lookupError } = await supabase
    .from('posts')
    .select('comment_count')
    .eq('id', postId)
    .maybeSingle<{ comment_count: number | null }>()

  if (lookupError || !postRow) {
    if (lookupError) {
      console.error('[community] comment_count lookup failed:', lookupError.message)
    }
    return
  }

  const { error: updateError } = await supabase
    .from('posts')
    .update({ comment_count: (postRow.comment_count ?? 0) + 1 })
    .eq('id', postId)

  if (updateError) {
    console.error('[community] comment_count update failed:', updateError.message)
  }
}
