'use client'

import { useOptimistic, useTransition } from 'react'
import { ThumbsUp } from 'lucide-react'

import { toggleCommunityUpvote } from '@/app/community/actions'
import type { UpvoteTargetType } from '@/lib/community/comment-schema'
import { cn } from '@/lib/utils'

type OptimisticUpvoteState = {
  count: number
  voted: boolean
}

type UpvoteButtonProps = {
  targetId: string
  targetType: UpvoteTargetType
  initialUpvoteCount: number
  initialVoted?: boolean
  disabled?: boolean
  className?: string
}

export function UpvoteButton({
  targetId,
  targetType,
  initialUpvoteCount,
  initialVoted = false,
  disabled = false,
  className,
}: UpvoteButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticState, addOptimistic] = useOptimistic(
    { count: initialUpvoteCount, voted: initialVoted },
    (state: OptimisticUpvoteState, action: 'toggle'): OptimisticUpvoteState => {
      if (action !== 'toggle') return state
      return {
        count: state.voted ? Math.max(0, state.count - 1) : state.count + 1,
        voted: !state.voted,
      }
    }
  )

  function handleClick() {
    if (disabled || isPending) return

    startTransition(async () => {
      addOptimistic('toggle')
      const result = await toggleCommunityUpvote(targetId, targetType)
      if (result.error) {
        console.error('[UpvoteButton]', result.error)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isPending}
      aria-pressed={optimisticState.voted}
      aria-label={
        optimisticState.voted
          ? `Remove upvote (${optimisticState.count})`
          : `Upvote (${optimisticState.count})`
      }
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        optimisticState.voted
          ? 'border-primary/50 bg-primary/15 text-primary'
          : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground',
        className
      )}
    >
      <ThumbsUp
        className={cn('h-3.5 w-3.5', optimisticState.voted && 'fill-current')}
        aria-hidden
      />
      <span className="tabular-nums">{optimisticState.count}</span>
    </button>
  )
}
