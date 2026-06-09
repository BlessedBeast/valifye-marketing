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
      className="inline-flex rounded-lg border border-zinc-900 bg-black/40 p-0.5"
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
              'rounded-md px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors',
              isActive
                ? 'bg-amber-500 text-black'
                : 'text-zinc-500 hover:text-amber-500'
            )}
          >
            {option.label}
          </Link>
        )
      })}
    </div>
  )
}
