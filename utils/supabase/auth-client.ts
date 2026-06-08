'use client'

import { createClient } from '@/utils/supabase/client'

export async function signInWithGoogle(nextPath = '/community'): Promise<void> {
  const supabase = createClient()
  const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  })

  if (error) {
    console.error('[auth] Google OAuth failed:', error.message)
  }
}
