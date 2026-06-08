import Link from 'next/link'

import type { CommunityPostSort } from '@/lib/community/queries'
import { cn } from '@/lib/utils'

type FeedSortToggleProps = {
  active: CommunityPostSort
  basePath?: string
}

export function FeedSortToggle({ active, basePath = '/community' }: FeedSortToggleProps) {
  const options: { value: CommunityPostSort; label: string }[] = [
    { value: 'new', label: 'New' },
    { value: 'top', label: 'Top' },
  ]

  return (
    <div
      className="inline-flex rounded-md border border-border bg-background p-0.5"
      role="tablist"
      aria-label="Sort feed"
    >
      {options.map((option) => {
        const isActive = active === option.value
        const href = option.value === 'new' ? basePath : `${basePath}?sort=top`

        return (
          <Link
            key={option.value}
            href={href}
            role="tab"
            aria-selected={isActive}
            className={cn(
              'rounded px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {option.label}
          </Link>
        )
      })}
    </div>
  )
}
