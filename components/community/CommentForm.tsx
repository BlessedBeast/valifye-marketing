'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { createCommunityComment } from '@/app/community/actions'
import { Button } from '@/components/ui/button'
import { MIN_COMMENT_BODY_CHARS } from '@/lib/community/comment-schema'
import { cn } from '@/lib/utils'

type CommentFormProps = {
  postId: string
  postSlug: string
  /** When set, creates a nested reply under this comment. */
  parentId?: string
  disabled?: boolean
  /** Compact layout for inline reply forms beneath a comment. */
  variant?: 'default' | 'inline'
  /** Called after a successful post (inline replies use this to collapse the form). */
  onSuccess?: () => void
  /** Called when the user cancels an inline reply. */
  onCancel?: () => void
}

/** Base64 browser-environment token consumed by the moderation fingerprint. */
function buildJsToken(): string {
  try {
    const payload = {
      userAgent: navigator.userAgent,
      screenWidth: window.screen?.width ?? null,
      screenHeight: window.screen?.height ?? null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
      language: navigator.language ?? null,
    }
    return btoa(JSON.stringify(payload))
  } catch {
    return ''
  }
}

export function CommentForm({
  postId,
  postSlug,
  parentId,
  disabled = false,
  variant = 'default',
  onSuccess,
  onCancel,
}: CommentFormProps) {
  const router = useRouter()
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const charCount = body.trim().length
  const meetsMinimum = charCount >= MIN_COMMENT_BODY_CHARS
  const isInline = variant === 'inline'
  const fieldId = parentId ? `comment-body-${parentId}` : 'comment-body'

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!meetsMinimum) {
      setError(
        `Constructive or silent — write at least ${MIN_COMMENT_BODY_CHARS} characters to earn Karma.`
      )
      return
    }

    const formData = new FormData(event.currentTarget)
    formData.set('body', body)
    formData.set('_jst', buildJsToken())
    if (parentId) {
      formData.set('parentId', parentId)
    }

    startTransition(async () => {
      const result = await createCommunityComment(postId, postSlug, formData)
      if (result.error) {
        setError(result.error)
        return
      }
      setBody('')
      onSuccess?.()
      router.refresh()
    })
  }

  if (disabled) {
    return (
      <div
        className={cn(
          'rounded-lg border border-border bg-card text-sm text-muted-foreground',
          isInline ? 'p-3' : 'p-4'
        )}
      >
        Sign in to join the discussion and earn Karma for constructive reviews.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-3', isInline && 'mt-3')}>
      <input
        type="text"
        name="_hp"
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />
      <div className="space-y-2">
        {!isInline ? (
          <>
            <label htmlFor={fieldId} className="text-sm font-medium text-foreground">
              Add a constructive reply
            </label>
            <p className="text-xs text-muted-foreground">
              Community Rule 3 — Constructive or silent. Minimum {MIN_COMMENT_BODY_CHARS}{' '}
              characters to qualify for Karma.
            </p>
          </>
        ) : (
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-500/80">
            Your reply
          </p>
        )}
        <textarea
          id={fieldId}
          name="body"
          rows={isInline ? 4 : 6}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={
            isInline
              ? 'Write a focused reply…'
              : 'Share specific, actionable feedback. What would you validate, change, or kill?'
          }
          className={cn(
            'w-full resize-y rounded-md border border-input bg-background px-3 py-2',
            'font-mono text-sm text-foreground placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        />
        <div className="flex items-center justify-between text-xs">
          <span
            className={cn(
              'tabular-nums',
              meetsMinimum ? 'text-emerald-400' : 'text-muted-foreground'
            )}
          >
            {charCount} / {MIN_COMMENT_BODY_CHARS} min for Karma
          </span>
        </div>
      </div>

      {error ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={isPending || !meetsMinimum} size={isInline ? 'sm' : 'default'}>
          {isPending ? 'Posting…' : parentId ? 'Post reply' : 'Post comment'}
        </Button>
        {isInline && onCancel ? (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  )
}
