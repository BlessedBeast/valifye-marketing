'use client'

import { createClient } from '@/utils/supabase/client'

export async function signInWithGoogle(nextPath?: string): Promise<void> {
  const supabase = createClient()
  const returnPath = nextPath ?? (window.location.pathname || '/community')
  const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(returnPath)}`

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  })

  if (error) {
    console.error('[auth] Google OAuth failed:', error.message)
  }
}
