'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { createCommunityComment } from '@/app/community/actions'
import { ImageAttachmentInput } from '@/components/community/ImageAttachmentInput'
import { Button } from '@/components/ui/button'
import { MIN_COMMENT_BODY_CHARS } from '@/lib/community/comment-schema'
import { cn } from '@/lib/utils'

type CommentFormProps = {
  postId: string
  postSlug: string
  disabled?: boolean
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

export function CommentForm({ postId, postSlug, disabled = false }: CommentFormProps) {
  const router = useRouter()
  const [body, setBody] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const charCount = body.trim().length
  const meetsMinimum = charCount >= MIN_COMMENT_BODY_CHARS

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
    formData.delete('images')
    for (const file of images) {
      formData.append('images', file)
    }

    startTransition(async () => {
      const result = await createCommunityComment(postId, postSlug, formData)
      if (result.error) {
        setError(result.error)
        return
      }
      setBody('')
      setImages([])
      router.refresh()
    })
  }

  if (disabled) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        Sign in to join the discussion and earn Karma for constructive reviews.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Honeypot: invisible to humans, irresistible to autofill bots. */}
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
        <label htmlFor="comment-body" className="text-sm font-medium text-foreground">
          Add a constructive reply
        </label>
        <p className="text-xs text-muted-foreground">
          Community Rule 3 — Constructive or silent. Minimum {MIN_COMMENT_BODY_CHARS}{' '}
          characters to qualify for Karma.
        </p>
        <textarea
          id="comment-body"
          name="body"
          rows={6}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Share specific, actionable feedback. What would you validate, change, or kill?"
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

      <ImageAttachmentInput
        files={images}
        onChange={setImages}
        disabled={isPending}
      />

      {error ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending || !meetsMinimum}>
        {isPending ? 'Posting…' : 'Post comment'}
      </Button>
    </form>
  )
}
