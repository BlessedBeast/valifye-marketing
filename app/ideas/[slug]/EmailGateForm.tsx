'use client'

import { useState } from 'react'
import { Lock, CheckCircle2 } from 'lucide-react'

export function EmailGateForm({ niche, city }: { niche: string; city: string }) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <div className="py-4 text-center space-y-3">
        <CheckCircle2 size={32} className="mx-auto text-green-500" />
        <p className="text-xl font-bold text-foreground">Check your inbox.</p>
        <p className="text-sm text-muted-foreground">
          Your verdict for {niche} in {city} is on its way.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (email) setSubmitted(true)
        }}
        className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          className="whitespace-nowrap rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-colors active:scale-[0.98] hover:bg-primary/90"
        >
          Get Verdict →
        </button>
      </form>
      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Lock size={12} />
        Free · No credit card · Verdict delivered in 24 hours
      </div>
    </div>
  )
}

