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
  /** Thread slug for cache revalidation after a successful toggle. */
  threadSlug?: string
  disabled?: boolean
  className?: string
}

function toggleUpvoteState(state: UpvoteState): UpvoteState {
  return {
    count: state.hasUpvoted ? Math.max(0, state.count - 1) : state.count + 1,
    hasUpvoted: !state.hasUpvoted,
  }
}

export function UpvoteButton({
  targetId,
  targetType,
  initialUpvoteCount,
  initialHasUpvoted,
  initialVoted,
  threadSlug,
  disabled = false,
  className,
}: UpvoteButtonProps) {
  const resolvedInitialHasUpvoted = initialHasUpvoted ?? initialVoted ?? false
  const inFlightRef = useRef(false)
  const [baseState, setBaseState] = useState<UpvoteState>({
    count: initialUpvoteCount,
    hasUpvoted: resolvedInitialHasUpvoted,
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [optimisticState, addOptimistic] = useOptimistic(
    baseState,
    (_state: UpvoteState, nextState: UpvoteState): UpvoteState => nextState
  )

  const isBusy = disabled || isPending || inFlightRef.current

  function handleClick() {
    if (isBusy) return

    inFlightRef.current = true
    setErrorMessage(null)

    const previousState = baseState
    const optimisticNext = toggleUpvoteState(previousState)

    startTransition(async () => {
      addOptimistic(optimisticNext)

      try {
        const result = await toggleCommunityUpvote(
          targetId,
          targetType,
          threadSlug
        )

        if (result.error) {
          setBaseState(previousState)
          setErrorMessage(result.error)
          console.error('[UpvoteButton]', result.error)
          return
        }

        setBaseState({
          count: result.upvoteCount,
          hasUpvoted: result.userHasUpvoted,
        })
      } catch (error) {
        setBaseState(previousState)
        const message =
          error instanceof Error ? error.message : 'Failed to update upvote.'
        setErrorMessage(message)
        console.error('[UpvoteButton]', error)
      } finally {
        inFlightRef.current = false
      }
    })
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
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
      {errorMessage ? (
        <span className="max-w-[14rem] text-[10px] leading-snug text-destructive" role="alert">
          {errorMessage}
        </span>
      ) : null}
    </span>
  )
}
