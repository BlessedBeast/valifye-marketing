'use client'

import { useEffect, useMemo, useRef } from 'react'
import { ImagePlus, X } from 'lucide-react'

import { cn } from '@/lib/utils'

export const MAX_ATTACHMENT_IMAGES = 3

type ImageAttachmentInputProps = {
  files: File[]
  onChange: (files: File[]) => void
  disabled?: boolean
}

/**
 * Hidden file input + "Add Image" trigger with removable preview thumbnails.
 * Selected File objects live in the parent so it can append them to FormData.
 */
export function ImageAttachmentInput({
  files,
  onChange,
  disabled = false,
}: ImageAttachmentInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const previews = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files]
  )

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previews])

  function handleSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []).filter(
      (file) => file.size > 0 && file.type.startsWith('image/')
    )

    if (selected.length > 0) {
      onChange([...files, ...selected].slice(0, MAX_ATTACHMENT_IMAGES))
    }

    // Reset so picking the same file again re-triggers onChange.
    event.target.value = ''
  }

  function handleRemove(index: number) {
    onChange(files.filter((_, i) => i !== index))
  }

  const atCapacity = files.length >= MAX_ATTACHMENT_IMAGES

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

      {files.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.lastModified}-${index}`}
              className="group relative h-20 w-20 overflow-hidden rounded-md border border-zinc-800"
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
      ) : null}
    </div>
  )
}
