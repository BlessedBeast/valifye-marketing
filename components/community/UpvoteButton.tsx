'use client'

import { useOptimistic, useRef, useState, useTransition } from 'react'
import { ThumbsUp } from 'lucide-react'

import { toggleCommunityUpvote } from '@/app/community/actions'
import type { UpvoteTargetType } from '@/lib/community/comment-schema'
import { cn } from '@/lib/utils'

type UpvoteState = {
  count: number
  hasUpvoted: boolean
}

type UpvoteButtonProps = {
  targetId: string
  targetType: UpvoteTargetType
  initialUpvoteCount: number
  initialHasUpvoted?: boolean
  /** @deprecated Use initialHasUpvoted */
  initialVoted?: boolean
  disabled?: boolean
  className?: string
}

export function UpvoteButton({
  targetId,
  targetType,
  initialUpvoteCount,
  initialHasUpvoted,
  initialVoted,
  disabled = false,
  className,
}: UpvoteButtonProps) {
  const resolvedInitialHasUpvoted = initialHasUpvoted ?? initialVoted ?? false
  const inFlightRef = useRef(false)
  const [baseState, setBaseState] = useState<UpvoteState>({
    count: initialUpvoteCount,
    hasUpvoted: resolvedInitialHasUpvoted,
  })
  const [isPending, startTransition] = useTransition()
  const [optimisticState, addOptimistic] = useOptimistic(
    baseState,
    (state: UpvoteState, action: 'toggle'): UpvoteState => {
      if (action !== 'toggle') return state
      return {
        count: state.hasUpvoted ? Math.max(0, state.count - 1) : state.count + 1,
        hasUpvoted: !state.hasUpvoted,
      }
    }
  )

  const isBusy = disabled || isPending || inFlightRef.current

  function handleClick() {
    if (isBusy) return

    inFlightRef.current = true

    startTransition(async () => {
      addOptimistic('toggle')

      try {
        const result = await toggleCommunityUpvote(targetId, targetType)

        if (result.error) {
          console.error('[UpvoteButton]', result.error)
          return
        }

        setBaseState({
          count: result.upvoteCount,
          hasUpvoted: result.userHasUpvoted,
        })
      } finally {
        inFlightRef.current = false
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isBusy}
      aria-busy={isPending || inFlightRef.current}
      aria-pressed={optimisticState.hasUpvoted}
      aria-label={
        optimisticState.hasUpvoted
          ? `Remove upvote (${optimisticState.count})`
          : `Upvote (${optimisticState.count})`
      }
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        optimisticState.hasUpvoted
          ? 'border-primary/50 bg-primary/15 text-primary'
          : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground',
        className
      )}
    >
      <ThumbsUp
        className={cn('h-3.5 w-3.5', optimisticState.hasUpvoted && 'fill-current')}
        aria-hidden
      />
      <span className="tabular-nums">{optimisticState.count}</span>
    </button>
  )
}
