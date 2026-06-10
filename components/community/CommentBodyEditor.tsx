'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Loader2, Pencil } from 'lucide-react'

import { updateCommunityComment } from '@/app/community/actions/edit'
import { MarkdownBody } from '@/components/community/MarkdownBody'
import { cn } from '@/lib/utils'

type CommentBodyEditorProps = {
  commentId: string
  postSlug: string
  body: string
  /** Only the comment author sees the edit affordance. */
  canEdit: boolean
}

/**
 * Renders a comment body with owner-only inline editing: the markdown view
 * swaps for a prefilled textarea with Save/Cancel while editing.
 */
export function CommentBodyEditor({
  commentId,
  postSlug,
  body,
  canEdit,
}: CommentBodyEditorProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(body)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleCancel() {
    setDraft(body)
    setError(null)
    setIsEditing(false)
  }

  function handleSave() {
    setError(null)

    const formData = new FormData()
    formData.set('commentId', commentId)
    formData.set('postSlug', postSlug)
    formData.set('body', draft)

    startTransition(async () => {
      const result = await updateCommunityComment(formData)

      if (result.error) {
        setError(result.error)
        return
      }

      setIsEditing(false)
      router.refresh()
    })
  }

  if (!isEditing) {
    return (
      <div className="group/edit relative">
        <MarkdownBody content={body} />
        {canEdit ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className={cn(
              'mt-2 inline-flex items-center gap-1.5 rounded border border-zinc-800 bg-black/30 px-2 py-1',
              'font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500',
              'transition-colors hover:border-amber-500/40 hover:text-amber-500'
            )}
          >
            <Pencil className="h-3 w-3" aria-hidden />
            Edit
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        rows={5}
        disabled={isPending}
        aria-label="Edit comment"
        className={cn(
          'w-full resize-y rounded-md border border-amber-500/30 bg-black/40 px-3 py-2',
          'font-mono text-sm text-zinc-100 placeholder:text-zinc-600',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/20',
          'disabled:opacity-60'
        )}
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || draft.trim().length === 0}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-1.5',
            'font-mono text-[10px] font-bold uppercase tracking-widest text-amber-400',
            'transition-colors hover:bg-amber-500/20',
            'disabled:cursor-not-allowed disabled:opacity-60'
          )}
        >
          {isPending ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
              Saving…
            </>
          ) : (
            'Save'
          )}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isPending}
          className={cn(
            'rounded-md border border-zinc-800 px-3 py-1.5',
            'font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500',
            'transition-colors hover:text-zinc-300',
            'disabled:cursor-not-allowed disabled:opacity-60'
          )}
        >
          Cancel
        </button>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-red-500/40 bg-red-950/30 px-3 py-2 font-mono text-xs text-red-400"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}
