'use client'

import { signInWithGoogle } from '@/utils/supabase/auth-client'

export function CommunitySignInButton() {
  return (
    <button
      type="button"
      onClick={() => signInWithGoogle()}
      className="mt-3 inline-block font-mono text-[10px] font-bold uppercase tracking-widest text-amber-500 underline-offset-4 transition hover:text-amber-400 hover:underline"
    >
      Sign in with Google
    </button>
  )
}
