'use client'

import { signInWithGoogle } from '@/utils/supabase/auth-client'

export function CommunitySignInButton() {
  return (
    <button
      type="button"
      onClick={() => signInWithGoogle('/community')}
      className="mt-2 inline-block text-left text-primary underline-offset-4 hover:underline"
    >
      Sign in with Google
    </button>
  )
}
