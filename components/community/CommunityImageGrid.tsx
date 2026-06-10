import { cn } from '@/lib/utils'

type CommunityImageGridProps = {
  urls: string[]
  className?: string
}

/** Responsive attachment grid rendered below post/comment bodies. */
export function CommunityImageGrid({ urls, className }: CommunityImageGridProps) {
  if (urls.length === 0) return null

  return (
    <div
      className={cn(
        'grid gap-2',
        urls.length === 1 && 'grid-cols-1',
        urls.length === 2 && 'grid-cols-2',
        urls.length >= 3 && 'grid-cols-2 sm:grid-cols-3',
        className
      )}
    >
      {urls.map((url) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={url}
          src={url}
          alt="Attached image"
          loading="lazy"
          className={cn(
            'w-full rounded-md border border-zinc-800 object-cover',
            urls.length === 1 ? 'max-h-96' : 'aspect-video'
          )}
        />
      ))}
    </div>
  )
}
