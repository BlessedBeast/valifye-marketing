'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Loader2, Pencil } from 'lucide-react'

import { updateCommunityPost } from '@/app/community/actions/edit'
import { CommunityImageGrid } from '@/components/community/CommunityImageGrid'
import { MarkdownBody } from '@/components/community/MarkdownBody'
import {
  POST_STAGES,
  POST_STAGE_LABELS,
  type PostStage,
} from '@/lib/community/post-schema'
import { cn } from '@/lib/utils'

type PostBodyEditorProps = {
  postId: string
  postSlug: string
  title: string
  body: string
  stage: PostStage
  /** Existing attachments — displayed in both modes and preserved on save. */
  imageUrls: string[]
  /** Only the post author sees the edit affordance. */
  canEdit: boolean
}

const FIELD_CLASS = cn(
  'w-full rounded-md border border-amber-500/30 bg-black/40 px-3 py-2',
  'font-mono text-sm text-zinc-100 placeholder:text-zinc-600',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/20',
  'disabled:opacity-60'
)

const LABEL_CLASS =
  'font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500'

/**
 * Thread body with owner-only inline editing. When toggled, the rendered
 * markdown swaps for an editable title/stage/body form. Attachments are not
 * part of the update payload, so image_urls survives edits untouched.
 */
export function PostBodyEditor({
  postId,
  postSlug,
  title,
  body,
  stage,
  imageUrls,
  canEdit,
}: PostBodyEditorProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(title)
  const [draftBody, setDraftBody] = useState(body)
  const [draftStage, setDraftStage] = useState<PostStage>(stage)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleCancel() {
    setDraftTitle(title)
    setDraftBody(body)
    setDraftStage(stage)
    setError(null)
    setIsEditing(false)
  }

  function handleSave() {
    setError(null)

    const formData = new FormData()
    formData.set('postId', postId)
    formData.set('postSlug', postSlug)
    formData.set('title', draftTitle)
    formData.set('body', draftBody)
    formData.set('stage', draftStage)

    startTransition(async () => {
      const result = await updateCommunityPost(formData)

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
      <div className="space-y-4">
        <MarkdownBody content={body} className="prose-invert max-w-none" />

        {imageUrls.length > 0 ? <CommunityImageGrid urls={imageUrls} /> : null}

        {canEdit ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded border border-zinc-800 bg-black/30 px-2.5 py-1.5',
              'font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500',
              'transition-colors hover:border-amber-500/40 hover:text-amber-500'
            )}
          >
            <Pencil className="h-3 w-3" aria-hidden />
            Edit Post
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-lg border border-amber-500/20 bg-amber-950/5 p-4">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500/80">
        Editing thread
      </p>

      <div className="space-y-2">
        <label htmlFor={`edit-title-${postId}`} className={LABEL_CLASS}>
          Title
        </label>
        <input
          id={`edit-title-${postId}`}
          type="text"
          value={draftTitle}
          onChange={(event) => setDraftTitle(event.target.value)}
          maxLength={140}
          disabled={isPending}
          className={FIELD_CLASS}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor={`edit-stage-${postId}`} className={LABEL_CLASS}>
          Stage
        </label>
        <select
          id={`edit-stage-${postId}`}
          value={draftStage}
          onChange={(event) => setDraftStage(event.target.value as PostStage)}
          disabled={isPending}
          className={FIELD_CLASS}
        >
          {POST_STAGES.map((stageOption) => (
            <option key={stageOption} value={stageOption}>
              {POST_STAGE_LABELS[stageOption]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor={`edit-body-${postId}`} className={LABEL_CLASS}>
          Markdown body
        </label>
        <textarea
          id={`edit-body-${postId}`}
          rows={12}
          value={draftBody}
          onChange={(event) => setDraftBody(event.target.value)}
          disabled={isPending}
          className={cn(FIELD_CLASS, 'resize-y')}
        />
      </div>

      {imageUrls.length > 0 ? (
        <div className="space-y-2">
          <p className={LABEL_CLASS}>Attachments (preserved on save)</p>
          <CommunityImageGrid urls={imageUrls} />
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-2',
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
            'Save Changes'
          )}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isPending}
          className={cn(
            'rounded-md border border-zinc-800 px-4 py-2',
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
