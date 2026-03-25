'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'

export type IdeasSortKey = 'newest' | 'opp_high' | 'diff_low' | 'alpha'

const SORT_OPTIONS: { value: IdeasSortKey; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'opp_high', label: 'Opportunity (high)' },
  { value: 'diff_low', label: 'Difficulty (low)' },
  { value: 'alpha', label: 'Alpha (A–Z)' },
]

function parseSort(raw: string | null): IdeasSortKey {
  if (raw === 'opp_high' || raw === 'diff_low' || raw === 'alpha' || raw === 'newest') {
    return raw
  }
  return 'newest'
}

export function IdeasSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const qFromUrl = searchParams.get('q') ?? ''
  const sortFromUrl = parseSort(searchParams.get('sort'))

  const [inputValue, setInputValue] = useState(qFromUrl)

  useEffect(() => {
    setInputValue(qFromUrl)
  }, [qFromUrl])

  const pushParams = useCallback(
    (nextQ: string, nextSort: IdeasSortKey) => {
      const params = new URLSearchParams()
      const trimmed = nextQ.trim()
      if (trimmed) params.set('q', trimmed)
      if (nextSort !== 'newest') params.set('sort', nextSort)

      const qs = params.toString()
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname)
      })
    },
    [pathname, router],
  )

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (inputValue === qFromUrl) return
      pushParams(inputValue, sortFromUrl)
    }, 300)
    return () => window.clearTimeout(t)
  }, [inputValue, qFromUrl, sortFromUrl, pushParams])

  function onSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = parseSort(e.target.value)
    pushParams(inputValue, next)
  }

  return (
    <div className="flex w-full flex-col gap-3 sm:max-w-md sm:flex-row sm:items-center">
      <div className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="search"
          name="q"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Query niche or city..."
          autoComplete="off"
          className="h-10 w-full border border-border bg-card pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          aria-busy={isPending}
        />
      </div>
      <label className="flex shrink-0 items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground sm:w-44">
        <span className="sr-only">Sort</span>
        <select
          name="sort"
          value={sortFromUrl}
          onChange={onSortChange}
          className="h-10 w-full cursor-pointer border border-border bg-card px-2 text-xs font-semibold uppercase tracking-wider text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
