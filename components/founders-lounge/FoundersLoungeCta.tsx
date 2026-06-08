'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Session } from '@supabase/supabase-js'
import { ArrowRight } from 'lucide-react'

import { signInWithGoogle } from '@/utils/supabase/auth-client'
import { createClient } from '@/utils/supabase/client'
import { cn } from '@/lib/utils'

type FoundersLoungeCtaProps = {
  label: string
  className?: string
  variant?: 'primary' | 'secondary'
}

export function FoundersLoungeCta({
  label,
  className,
  variant = 'primary',
}: FoundersLoungeCtaProps) {
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

  const baseStyles =
    variant === 'primary'
      ? 'bg-[#22c55e] text-black hover:bg-[#22c55e]/90'
      : 'border border-[#374151] bg-transparent text-white hover:border-[#f5a623] hover:text-[#f5a623]'

  if (!ready) {
    return (
      <div
        className={cn(
          'inline-flex h-12 min-w-[220px] animate-pulse items-center justify-center rounded-full bg-[#1f2937]',
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
          'inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 font-mono text-sm font-extrabold uppercase tracking-[0.12em] transition',
          baseStyles,
          className
        )}
      >
        {label}
        <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={() => signInWithGoogle('/community')}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 font-mono text-sm font-extrabold uppercase tracking-[0.12em] transition',
        baseStyles,
        className
      )}
    >
      {label}
      <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
    </button>
  )
}
