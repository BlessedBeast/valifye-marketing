'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Search } from 'lucide-react'

function slugToDisplay(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
}

interface CityReportsListProps {
  slugs: string[]
}

export function CityReportsList({ slugs }: CityReportsListProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return slugs
    return slugs.filter((s) => slugToDisplay(s).toLowerCase().includes(q) || s.toLowerCase().includes(q))
  }, [slugs, query])

  return (
    <div className="space-y-4">
      <div className="relative max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by report..."
          className="h-9 w-full border border-border bg-background pl-9 pr-3 text-xs uppercase tracking-[0.12em] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
          aria-label="Filter reports"
        />
      </div>
      <ul className="divide-y divide-border">
        {filtered.map((slug) => (
          <li key={slug}>
            <Link
              href={`/local-reports/${slug}`}
              className="flex items-center justify-between gap-2 py-3 text-xs font-medium uppercase tracking-[0.12em] text-foreground transition-colors hover:text-primary"
            >
              <span className="truncate">{slugToDisplay(slug)}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>
      {filtered.length === 0 && (
        <p className="py-4 text-center text-xs text-muted-foreground">No reports match your filter.</p>
      )}
    </div>
  )
}
