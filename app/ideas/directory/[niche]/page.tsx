import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin } from 'lucide-react'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { ValifyeFooter } from '@/components/valifye-footer'
import { getPublishedByNicheSlug } from '@/lib/marketData'
import type { Metadata } from 'next'

export const revalidate = 86400

type Props = { params: Promise<{ niche: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { niche: nicheSlug } = await params
  const rows = await getPublishedByNicheSlug(nicheSlug)
  const nicheName = rows[0]?.niche ?? nicheSlug.replace(/-/g, ' ')

  return {
    title: `${nicheName} — Cities | Valifye Market Directory`,
    description: `Published market analyses for ${nicheName} in ${rows.length} cities. Browse by city to see full data.`,
    openGraph: {
      title: `${nicheName} by City | Valifye`,
      description: `Find ${nicheName} market analyses in every city we cover.`,
      type: 'website',
      url: `https://valifye.com/ideas/directory/${nicheSlug}`
    },
    alternates: { canonical: `https://valifye.com/ideas/directory/${nicheSlug}` }
  }
}

export default async function DirectoryNichePage({ params }: Props) {
  const { niche: nicheSlug } = await params
  const rows = await getPublishedByNicheSlug(nicheSlug)

  if (rows.length === 0) notFound()

  const nicheName = rows[0].niche

  return (
    <div className="min-h-screen bg-background">
      <ValifyeNavbar />

      <div className="mx-auto max-w-4xl px-4 py-12 pt-24">
        <nav className="mb-8 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <span className="opacity-40">/</span>
          <Link href="/ideas" className="transition-colors hover:text-foreground">
            Market Intelligence
          </Link>
          <span className="opacity-40">/</span>
          <Link
            href="/ideas/directory"
            className="transition-colors hover:text-foreground"
          >
            Directory
          </Link>
          <span className="opacity-40">/</span>
          <span className="font-medium text-foreground">{nicheName}</span>
        </nav>

        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/ideas/directory"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={14} />
            All categories
          </Link>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {nicheName} — by city
        </h1>
        <p className="mt-2 text-muted-foreground">
          {rows.length} {rows.length === 1 ? 'city' : 'cities'} with published market analyses. Select a city for the full report.
        </p>

        <ul className="mt-10 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(({ slug, city }) => (
            <li key={slug}>
              <Link
                href={`/ideas/${slug}`}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-card/80"
              >
                <MapPin size={14} className="shrink-0 text-muted-foreground" />
                {city}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <ValifyeFooter />
    </div>
  )
}
