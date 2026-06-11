'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ImagePlus, Upload, X } from 'lucide-react'

import { cn } from '@/lib/utils'

export const MAX_ATTACHMENT_IMAGES = 3

type ImageAttachmentInputProps = {
  files: File[]
  onChange: (files: File[]) => void
  disabled?: boolean
  /** `dropzone` — full drag-and-drop area for thread creation. */
  variant?: 'compact' | 'dropzone'
}

function mergeImageFiles(existing: File[], incoming: File[]): File[] {
  const valid = incoming.filter((file) => file.size > 0 && file.type.startsWith('image/'))
  if (valid.length === 0) return existing
  return [...existing, ...valid].slice(0, MAX_ATTACHMENT_IMAGES)
}

/**
 * Image picker for post attachments. Supports compact button mode and a
 * drag-and-drop dropzone for thread creation.
 */
export function ImageAttachmentInput({
  files,
  onChange,
  disabled = false,
  variant = 'compact',
}: ImageAttachmentInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const previews = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files]
  )

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previews])

  const atCapacity = files.length >= MAX_ATTACHMENT_IMAGES

  const addFiles = useCallback(
    (incoming: File[]) => {
      onChange(mergeImageFiles(files, incoming))
    },
    [files, onChange]
  )

  function handleSelect(event: React.ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(event.target.files ?? []))
    event.target.value = ''
  }

  function handleRemove(index: number) {
    onChange(files.filter((_, i) => i !== index))
  }

  function handleDragOver(event: React.DragEvent) {
    event.preventDefault()
    if (!disabled && !atCapacity) {
      setIsDragging(true)
    }
  }

  function handleDragLeave(event: React.DragEvent) {
    event.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault()
    setIsDragging(false)
    if (disabled || atCapacity) return
    addFiles(Array.from(event.dataTransfer.files ?? []))
  }

  const previewGrid =
    files.length > 0 ? (
      <ul className="flex flex-wrap gap-2">
        {files.map((file, index) => (
          <li
            key={`${file.name}-${file.lastModified}-${index}`}
            className="group relative h-24 w-24 overflow-hidden rounded-md border border-zinc-800"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previews[index]}
              alt={file.name}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              disabled={disabled}
              aria-label={`Remove ${file.name}`}
              className={cn(
                'absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full',
                'border border-zinc-700 bg-black/80 text-zinc-300',
                'transition-colors hover:border-red-500/60 hover:text-red-400'
              )}
            >
              <X className="h-3 w-3" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    ) : null

  if (variant === 'dropzone') {
    return (
      <div className="space-y-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleSelect}
          disabled={disabled || atCapacity}
        />

        <div
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              inputRef.current?.click()
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && !atCapacity && inputRef.current?.click()}
          className={cn(
            'cursor-pointer rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors',
            'border-zinc-800 bg-zinc-900/30 hover:border-amber-500/40 hover:bg-zinc-900/50',
            isDragging && 'border-amber-500/60 bg-amber-500/5',
            (disabled || atCapacity) && 'cursor-not-allowed opacity-50'
          )}
        >
          <Upload
            className={cn(
              'mx-auto h-8 w-8',
              isDragging ? 'text-amber-500' : 'text-zinc-600'
            )}
            aria-hidden
          />
          <p className="mt-3 font-mono text-xs font-bold uppercase tracking-widest text-zinc-300">
            Drop screenshots here
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            PNG, JPG, or WebP — up to {MAX_ATTACHMENT_IMAGES} images for your pitch
          </p>
          <p className="mt-3 font-mono text-[10px] tabular-nums text-zinc-600">
            {files.length} / {MAX_ATTACHMENT_IMAGES} attached
          </p>
        </div>

        {previewGrid}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleSelect}
        disabled={disabled || atCapacity}
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || atCapacity}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-black/30 px-3 py-1.5',
            'font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400',
            'transition-colors hover:border-amber-500/40 hover:text-amber-500',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          <ImagePlus className="h-3.5 w-3.5" aria-hidden />
          Add Image
        </button>
        <span className="font-mono text-[10px] tabular-nums text-zinc-600">
          {files.length} / {MAX_ATTACHMENT_IMAGES}
        </span>
      </div>

      {previewGrid}
    </div>
  )
}
