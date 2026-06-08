import { createClient } from '@/utils/supabase/server'

export type CommunityProfile = {
  userId: string
  karmaPoints: number
}

/**
 * Loads community karma for the signed-in user from `public.profiles`.
 * Returns null when unauthenticated; defaults karma to 0 when no profile row exists.
 */
export async function getCommunityProfile(): Promise<CommunityProfile | null> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('karma_points')
    .eq('id', user.id)
    .maybeSingle<{ karma_points: number | null }>()

  if (error) {
    console.error('[community] profile lookup failed:', error.message)
  }

  return {
    userId: user.id,
    karmaPoints: data?.karma_points ?? 0,
  }
}
