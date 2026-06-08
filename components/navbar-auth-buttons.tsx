'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Session } from '@supabase/supabase-js'

import { signInWithGoogle } from '@/utils/supabase/auth-client'
import { createClient } from '@/utils/supabase/client'
import { cn } from '@/lib/utils'

type NavbarAuthButtonsProps = {
  className?: string
  /** Use compact styling for the mobile drawer footer. */
  variant?: 'desktop' | 'mobile'
}

export function NavbarAuthButtons({
  className,
  variant = 'desktop',
}: NavbarAuthButtonsProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession)
      setReady(true)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!ready) {
    return (
      <div
        className={cn(
          variant === 'desktop' ? 'ml-2 h-10 w-40 animate-pulse rounded-full bg-[#1f2937]' : 'h-[52px] w-full animate-pulse rounded-full bg-[#1f2937]',
          className
        )}
        aria-hidden
      />
    )
  }

  if (session) {
    return (
      <Link
        href="/community"
        className={cn(
          'inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#22c55e] font-mono font-extrabold uppercase tracking-[0.14em] text-black transition hover:bg-[#22c55e]/90',
          variant === 'desktop'
            ? 'ml-2 h-10 px-5 text-xs'
            : 'min-h-[52px] w-full py-3.5 text-sm',
          className
        )}
      >
        Go to Lounge
      </Link>
    )
  }

  if (variant === 'mobile') {
    return (
      <div className={cn('flex w-full flex-col gap-3', className)}>
        <button
          type="button"
          onClick={() => signInWithGoogle('/community')}
          className="min-h-[48px] w-full rounded-full border border-[#374151] py-3 font-mono text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:border-[#f5a623] hover:text-[#f5a623]"
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => signInWithGoogle('/community')}
          className="min-h-[52px] w-full rounded-full bg-[#22c55e] py-3.5 font-mono text-sm font-extrabold uppercase tracking-[0.14em] text-black transition hover:bg-[#22c55e]/90"
        >
          Sign Up
        </button>
      </div>
    )
  }

  return (
    <div className={cn('ml-2 flex shrink-0 items-center gap-2', className)}>
      <button
        type="button"
        onClick={() => signInWithGoogle('/community')}
        className="inline-flex h-10 items-center rounded-full border border-[#374151] px-4 font-mono text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:border-[#f5a623] hover:text-[#f5a623]"
      >
        Sign In
      </button>
      <button
        type="button"
        onClick={() => signInWithGoogle('/community')}
        className="inline-flex h-10 items-center rounded-full bg-[#22c55e] px-5 font-mono text-xs font-extrabold uppercase tracking-[0.14em] text-black transition hover:bg-[#22c55e]/90"
      >
        Sign Up
      </button>
    </div>
  )
}
