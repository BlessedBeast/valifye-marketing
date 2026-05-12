'use client'

import Image from 'next/image'
import { useCallback, useEffect, useId, useState } from 'react'
import { X } from 'lucide-react'

import type { SolutionReportScreenshot } from '@/lib/solutionData'
import { cn } from '@/lib/utils'

type Props = {
  shots: SolutionReportScreenshot[]
}

function slideDomId(index: number): string {
  return `forensic-deliverable-slide-${index}`
}

function resolveSrc(shot: SolutionReportScreenshot): string {
  return shot.path?.trim() ?? ''
}

function LightboxImage({ shot }: { shot: SolutionReportScreenshot }) {
  const src = resolveSrc(shot)
  if (!src) {
    if (shot.placeholder?.trim()) {
      return (
        <p className="max-w-lg p-8 text-center font-mono text-sm text-zinc-400">
          {shot.placeholder}
        </p>
      )
    }
    return null
  }
  if (src.startsWith('/')) {
    return (
      <Image
        src={src}
        alt={shot.caption || shot.label}
        width={1600}
        height={1200}
        className="max-h-[85vh] w-auto max-w-full object-contain"
      />
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={shot.caption || shot.label}
      className="max-h-[85vh] w-auto max-w-full object-contain"
    />
  )
}

function DeliverableSlideMedia({
  shot,
  sizes,
  priority
}: {
  shot: SolutionReportScreenshot
  sizes: string
  priority?: boolean
}) {
  const src = resolveSrc(shot)
  if (src) {
    const isLocal = src.startsWith('/')
    if (isLocal) {
      return (
        <Image
          src={src}
          alt={shot.caption || shot.label}
          fill
          priority={priority}
          sizes={sizes}
          className="object-contain object-top"
        />
      )
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={shot.caption || shot.label}
        className="h-full w-full object-contain object-top"
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    )
  }

  if (shot.placeholder?.trim()) {
    return (
      <div className="flex h-full min-h-[220px] w-full items-center justify-center p-6 text-center font-mono text-xs leading-relaxed text-zinc-500 md:min-h-[280px]">
        {shot.placeholder}
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-[200px] w-full items-center justify-center font-mono text-[10px] uppercase tracking-widest text-zinc-600">
      No preview path
    </div>
  )
}

export function ForensicDeliverableGallery({ shots }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null)
  const galleryTitleId = useId()
  const useSideNav = shots.length >= 5

  const closeLightbox = useCallback(() => setLightbox(null), [])

  const openAt = useCallback((index: number) => setLightbox(index), [])

  const goPrev = useCallback(() => {
    setLightbox((i) => {
      if (i == null) return i
      return i <= 0 ? shots.length - 1 : i - 1
    })
  }, [shots.length])

  const goNext = useCallback(() => {
    setLightbox((i) => {
      if (i == null) return i
      return i >= shots.length - 1 ? 0 : i + 1
    })
  }, [shots.length])

  useEffect(() => {
    if (lightbox == null) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [lightbox])

  useEffect(() => {
    if (lightbox == null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, closeLightbox, goPrev, goNext])

  const scrollToSlide = (index: number) => {
    document
      .getElementById(slideDomId(index))
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (shots.length === 0) return null

  return (
    <section
      aria-labelledby={galleryTitleId}
      className="space-y-8 md:space-y-10"
    >
      <h2
        id={galleryTitleId}
        className="max-w-4xl font-serif text-2xl font-bold tracking-tight text-zinc-50 md:text-3xl lg:text-[2rem]"
      >
        What the deliverable actually looks like.
      </h2>

      <div
        className={cn(
          useSideNav &&
            'lg:grid lg:grid-cols-[minmax(0,200px)_minmax(0,1fr)] lg:items-start lg:gap-8'
        )}
      >
        {useSideNav && (
          <nav
            aria-label="Deliverable sections"
            className="mb-6 flex gap-2 overflow-x-auto pb-1 lg:sticky lg:top-24 lg:mb-0 lg:block lg:max-h-[calc(100vh-8rem)] lg:space-y-1 lg:overflow-y-auto lg:overflow-x-visible lg:pb-0"
          >
            <p className="mb-2 hidden font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500 lg:block">
              Audit index
            </p>
            {shots.map((shot, i) => (
              <button
                key={`nav-${shot.id}-${i}`}
                type="button"
                onClick={() => scrollToSlide(i)}
                className={cn(
                  'block w-full shrink-0 rounded-md border border-transparent px-3 py-2.5 text-left font-mono text-[10px] font-semibold uppercase leading-snug tracking-[0.12em] text-zinc-400 transition-colors',
                  'hover:border-amber-500/25 hover:bg-amber-500/[0.06] hover:text-amber-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40',
                  'lg:whitespace-normal'
                )}
              >
                {shot.label}
              </button>
            ))}
          </nav>
        )}

        <div
          className={cn(
            'flex flex-col gap-10 md:gap-12',
            'w-full min-w-0',
            'max-lg:-mx-4 max-lg:px-4'
          )}
        >
          {shots.map((shot, i) => (
            <article
              key={`${shot.id}-${i}`}
              id={slideDomId(i)}
              className="scroll-mt-24 md:scroll-mt-28"
            >
              <div className="space-y-3">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-amber-400/95">
                  {shot.label}
                </p>
                {shot.caption ? (
                  <p className="max-w-3xl text-sm leading-relaxed text-zinc-400">
                    {shot.caption}
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => openAt(i)}
                className={cn(
                  'group relative mt-5 w-full max-w-full cursor-zoom-in overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 text-left',
                  'shadow-[0_0_50px_-12px_rgba(16,185,129,0.1)]',
                  'transition-shadow duration-300 hover:shadow-[0_0_60px_-10px_rgba(16,185,129,0.22)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50'
                )}
                aria-label={`Open full size: ${shot.label}`}
              >
                <span className="pointer-events-none absolute right-3 top-3 z-10 rounded border border-zinc-700/80 bg-zinc-950/90 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  Click to enlarge
                </span>
                <div className="relative aspect-[4/3] w-full min-h-[220px] md:aspect-[16/10] md:min-h-[320px] lg:min-h-[380px]">
                  <div className="absolute inset-0 origin-center transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.03]">
                    <DeliverableSlideMedia
                      shot={shot}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 900px"
                      priority={i === 0}
                    />
                  </div>
                </div>
              </button>
            </article>
          ))}
        </div>
      </div>

      {lightbox != null && shots[lightbox] && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/88 p-3 backdrop-blur-sm md:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Deliverable preview"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              closeLightbox()
            }}
            className="absolute right-4 top-4 z-[110] rounded-lg border border-zinc-600 bg-zinc-900/90 p-2 text-zinc-200 transition-colors hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60"
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            type="button"
            className="absolute left-2 top-1/2 z-[110] -translate-y-1/2 rounded-lg border border-zinc-700 bg-zinc-900/90 px-2 py-5 font-mono text-[11px] text-zinc-300 hover:bg-zinc-800 sm:left-4 sm:px-3 sm:py-6 sm:text-xs md:left-6"
            aria-label="Previous slide"
            onClick={(e) => {
              e.stopPropagation()
              goPrev()
            }}
          >
            ←
          </button>
          <button
            type="button"
            className="absolute right-2 top-1/2 z-[110] -translate-y-1/2 rounded-lg border border-zinc-700 bg-zinc-900/90 px-2 py-5 font-mono text-[11px] text-zinc-300 hover:bg-zinc-800 sm:right-4 sm:px-3 sm:py-6 sm:text-xs md:right-6"
            aria-label="Next slide"
            onClick={(e) => {
              e.stopPropagation()
              goNext()
            }}
          >
            →
          </button>

          <div
            className="flex max-h-[90vh] w-full max-w-6xl flex-col items-center justify-center px-10 sm:px-14"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex w-full max-h-[85vh] items-center justify-center overflow-auto rounded-lg border border-zinc-700 bg-zinc-950 p-3 shadow-[0_0_80px_-20px_rgba(16,185,129,0.25)] sm:p-6">
              <LightboxImage shot={shots[lightbox]} />
            </div>
            <p className="mt-3 max-w-3xl text-center font-mono text-[10px] uppercase leading-relaxed tracking-widest text-zinc-500">
              {shots[lightbox].label}
              {shots[lightbox].caption ? ` · ${shots[lightbox].caption}` : ''}
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
