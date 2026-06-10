'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { createCommunityPost, type CreatePostState } from '@/app/community/new/actions'
import { ImageAttachmentInput } from '@/components/community/ImageAttachmentInput'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  COMMUNITY_SPACES,
  COMMUNITY_SPACE_IDS,
  type CommunitySpaceId,
} from '@/lib/community/constants'
import {
  createPostSchema,
  KARMA_PRODUCT_URL_THRESHOLD,
  MIN_POST_BODY_CHARS,
  POST_STAGES,
  POST_STAGE_LABELS,
  type CreatePostInput,
} from '@/lib/community/post-schema'
import { getSpaceMarkdownTemplate } from '@/lib/community/templates'
import {
  getAllSpaceAvailabilities,
  getThemeBannerMessage,
  getThemeBodyRequirementMessage,
} from '@/lib/community/theme-guards'
import type { DayTheme } from '@/lib/community/themes'
import { cn } from '@/lib/utils'

type CreateThreadFormProps = {
  todayTheme: DayTheme
  karmaPoints: number
}

const AUTH_REDIRECT_URL = 'https://app.valifye.com'

export function CreateThreadForm({ todayTheme, karmaPoints }: CreateThreadFormProps) {
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [images, setImages] = useState<File[]>([])

  const spaceAvailabilities = useMemo(
    () => getAllSpaceAvailabilities(todayTheme, karmaPoints),
    [todayTheme, karmaPoints]
  )

  const defaultSpace = useMemo(() => {
    const firstOpen = COMMUNITY_SPACE_IDS.find(
      (id) => spaceAvailabilities[id].allowed
    )
    return firstOpen ?? 'validate'
  }, [spaceAvailabilities])

  const [lastAppliedSpace, setLastAppliedSpace] = useState<CommunitySpaceId>(
    defaultSpace
  )

  const lockedSpaceMessages = useMemo(
    () =>
      COMMUNITY_SPACE_IDS.filter((id) => !spaceAvailabilities[id].allowed).map(
        (id) => ({
          id,
          label: COMMUNITY_SPACES[id].label,
          reason: spaceAvailabilities[id].reason,
        })
      ),
    [spaceAvailabilities]
  )

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: '',
      space: defaultSpace,
      stage: 'idea',
      body: getSpaceMarkdownTemplate(defaultSpace) ?? '',
      productUrl: '',
    },
  })

  const selectedSpace = watch('space') as CommunitySpaceId
  const bodyValue = watch('body') ?? ''
  const bodyCharCount = bodyValue.trim().length
  const canShareProductUrl = karmaPoints >= KARMA_PRODUCT_URL_THRESHOLD
  const themeBodyHint = getThemeBodyRequirementMessage(todayTheme)

  useEffect(() => {
    if (selectedSpace === lastAppliedSpace) return
    const template = getSpaceMarkdownTemplate(selectedSpace)
    if (template != null) {
      setValue('body', template, { shouldValidate: true })
    }
    setLastAppliedSpace(selectedSpace)
  }, [selectedSpace, lastAppliedSpace, setValue])

  const onSubmit = handleSubmit((values) => {
    setServerError(null)
    const availability = spaceAvailabilities[values.space]
    if (!availability.allowed) {
      setServerError(availability.reason ?? 'This space is locked today.')
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.set('title', values.title)
      formData.set('space', values.space)
      formData.set('stage', values.stage)
      formData.set('body', values.body)
      formData.set('productUrl', canShareProductUrl ? values.productUrl ?? '' : '')
      for (const file of images) {
        formData.append('images', file)
      }

      const result: CreatePostState = await createCommunityPost({}, formData)
      if (result.error) {
        setServerError(result.error)
      }
    })
  })

  return (
    <div className="space-y-6">
      <div
        className="rounded-lg border-2 border-primary/50 bg-primary/10 px-4 py-4 shadow-[0_0_24px_-8px_hsl(var(--primary)/0.35)]"
        role="status"
        aria-live="polite"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
          Active Theme Enforcement
        </p>
        <p className="mt-2 text-base font-semibold text-foreground">
          {getThemeBannerMessage(todayTheme)}
        </p>
        {themeBodyHint ? (
          <p className="mt-2 text-sm text-muted-foreground">{themeBodyHint}</p>
        ) : null}
      </div>

      {!canShareProductUrl ? (
        <div
          className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-foreground"
          role="note"
        >
          ⚠️ Unlock product link sharing and the Launch space by earning 10 Karma
          points (Review 3 other founders&apos; ideas).
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-foreground">
            Thread title
          </label>
          <Input
            id="title"
            placeholder="Give your thread a clear, specific title"
            aria-invalid={Boolean(errors.title)}
            {...register('title')}
          />
          {errors.title ? (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="space" className="text-sm font-medium text-foreground">
            Space
          </label>
          <select
            id="space"
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
              'text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
            {...register('space')}
          >
            {COMMUNITY_SPACE_IDS.map((spaceId) => {
              const space = COMMUNITY_SPACES[spaceId]
              const availability = spaceAvailabilities[spaceId]
              return (
                <option key={spaceId} value={spaceId} disabled={!availability.allowed}>
                  {space.label}
                  {!availability.allowed ? ' (locked today)' : ''}
                </option>
              )
            })}
          </select>
          {spaceAvailabilities[selectedSpace]?.reason &&
          !spaceAvailabilities[selectedSpace]?.allowed ? (
            <p className="text-xs text-amber-400">
              {spaceAvailabilities[selectedSpace].reason}
            </p>
          ) : null}
          {errors.space ? (
            <p className="text-xs text-destructive">{errors.space.message}</p>
          ) : null}
          {lockedSpaceMessages.length > 0 ? (
            <ul className="space-y-1 text-xs text-muted-foreground">
              {lockedSpaceMessages.map(({ id, label, reason }) => (
                <li key={id}>
                  <span className="font-medium text-foreground">{label}</span>
                  {reason ? `: ${reason}` : ' is locked today.'}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="stage" className="text-sm font-medium text-foreground">
            Tag your stage <span className="text-destructive">*</span>
          </label>
          <p className="text-xs text-muted-foreground">
            Community Rule 5 — tell founders where you are in the build journey.
          </p>
          <select
            id="stage"
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
              'text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
            aria-invalid={Boolean(errors.stage)}
            {...register('stage')}
          >
            {POST_STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {POST_STAGE_LABELS[stage]}
              </option>
            ))}
          </select>
          {errors.stage ? (
            <p className="text-xs text-destructive">{errors.stage.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="body" className="text-sm font-medium text-foreground">
              Markdown description
            </label>
            <span
              className={cn(
                'text-xs tabular-nums',
                bodyCharCount >= MIN_POST_BODY_CHARS
                  ? 'text-emerald-400'
                  : 'text-muted-foreground'
              )}
            >
              {bodyCharCount} / {MIN_POST_BODY_CHARS} min
            </span>
          </div>
          <textarea
            id="body"
            rows={14}
            placeholder="Share context using the injected template…"
            className={cn(
              'w-full resize-y rounded-md border border-input bg-background px-3 py-2',
              'font-mono text-sm text-foreground placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
            aria-invalid={Boolean(errors.body)}
            {...register('body')}
          />
          {errors.body ? (
            <p className="text-xs text-destructive">{errors.body.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Attachments <span className="text-muted-foreground">(optional, up to 3 images)</span>
          </p>
          <ImageAttachmentInput
            files={images}
            onChange={setImages}
            disabled={isPending}
          />
        </div>

        {canShareProductUrl ? (
          <div className="space-y-2">
            <label
              htmlFor="productUrl"
              className="text-sm font-medium text-foreground"
            >
              Product URL <span className="text-muted-foreground">(optional)</span>
            </label>
            <Input
              id="productUrl"
              type="url"
              placeholder="https://yourproduct.com"
              aria-invalid={Boolean(errors.productUrl)}
              {...register('productUrl')}
            />
            {errors.productUrl ? (
              <p className="text-xs text-destructive">{errors.productUrl.message}</p>
            ) : null}
          </div>
        ) : null}

        {serverError ? (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {serverError}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={isPending || bodyCharCount < MIN_POST_BODY_CHARS}
          className="w-full sm:w-auto"
        >
          {isPending ? 'Publishing…' : 'Publish thread'}
        </Button>
      </form>
    </div>
  )
}

export function GuestAuthPrompt() {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-foreground">Sign in required</h2>
      <p className="text-sm text-muted-foreground">
        You need an active Valifye profile session to create community threads, earn
        Karma, and unlock Launch space posting.
      </p>
      <Button asChild>
        <a href={AUTH_REDIRECT_URL}>Sign in to Valifye</a>
      </Button>
    </div>
  )
}
