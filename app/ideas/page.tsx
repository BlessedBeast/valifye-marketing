import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { ValifyeFooter } from '@/components/valifye-footer'
import { createClient } from '@/utils/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Startup Ideas Directory | Valifye Market Intelligence',
  description:
    'High-authority directory of startup ideas by niche and city. Explore published market analyses across thousands of city/niche combinations.',
  openGraph: {
    title: 'Startup Ideas Directory | Valifye',
    description:
      'Browse startup ideas by niche and city. See where each market has a full Valifye analysis.',
    type: 'website',
    url: 'https://valifye.com/ideas'
  },
  alternates: { canonical: 'https://valifye.com/ideas' }
}

type SearchParams = Promise<{ q?: string }>

export const revalidate = 86400

export default async function IdeasPage({
  searchParams
}: {
  searchParams: SearchParams
}) {
  const { q = '' } = await searchParams
  const query = q.trim().toLowerCase()

  const supabase = createClient()
  const { data, error } = await supabase
    .from('market_data')
    .select('slug, niche, city')
    .eq('status', 'published')

  const rows: { slug: string; niche: string; city: string }[] =
    !error && data ? (data as { slug: string; niche: string; city: string }[]) : []

  const filteredRows =
    query.length === 0
      ? rows
      : rows.filter((row) => {
          const niche = row.niche?.toLowerCase() ?? ''
          const city = row.city?.toLowerCase() ?? ''
          return niche.includes(query) || city.includes(query)
        })

  const groups = new Map<
    string,
    { niche: string; cities: { slug: string; city: string }[] }
  >()

  for (const row of filteredRows) {
    const key = row.niche || 'Other'
    if (!groups.has(key)) {
      groups.set(key, { niche: key, cities: [] })
    }
    groups.get(key)!.cities.push({ slug: row.slug, city: row.city })
  }

  const grouped = Array.from(groups.values()).sort((a, b) =>
    a.niche.localeCompare(b.niche)
  )

  return (
    <div className="min-h-screen bg-background">
      <ValifyeNavbar />

      {/* HERO */}
      <section className="relative overflow-hidden pb-16 pt-28">
        <div className="pointer-events-none absolute left-1/4 top-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 top-10 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />

        <div className="relative mx-auto max-w-6xl space-y-6 px-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            <span className="text-xs font-semibold tracking-wide text-primary">
              VALIFYE MARKET INTELLIGENCE
            </span>
          </div>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
            Startup ideas by{' '}
            <span className="bg-gradient-to-r from-primary to-sky-400 bg-clip-text text-transparent dark:from-primary dark:to-orange-300">
              niche &amp; city
            </span>
          </h1>

          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
            A high-authority index of every published Valifye market analysis.
            Browse by category, then jump into the full city-level breakdowns.
          </p>

          <form
            action="/ideas"
            className="mt-6 max-w-xl"
          >
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder='Search by niche or city (e.g. "MedSpa" or "Denver")'
                className="h-10 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* DIRECTORY INDEX */}
      <section className="mx-auto max-w-6xl space-y-6 px-4 pb-12">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Showing{' '}
            <span className="font-semibold text-foreground">
              {grouped.length}
            </span>{' '}
            market categories
            {query && (
              <span className="text-primary"> (filtered)</span>
            )}
          </p>
        </div>

        {grouped.length === 0 ? (
          <div className="space-y-3 rounded-2xl border border-dashed border-border p-16 text-center">
            <p className="font-semibold text-foreground">
              No categories match this search
            </p>
            <p className="text-sm text-muted-foreground">
              Try a different niche or city keyword.
            </p>
            <Link
              href="/ideas"
              className="text-sm text-primary hover:underline"
            >
              Clear search and view all →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {grouped.map((group) => {
              const cities = group.cities
              const firstFive = cities.slice(0, 5)
              const extraCount = Math.max(0, cities.length - firstFive.length)

              return (
                <div
                  key={group.niche}
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Market Category
                    </p>
                    <h2 className="text-base font-semibold text-foreground">
                      {group.niche}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {cities.length}{' '}
                      {cities.length === 1 ? 'city' : 'cities'} with published
                      analysis
                    </p>
                  </div>

                  <ul className="space-y-1.5 text-sm">
                    {firstFive.map((city) => (
                      <li key={city.slug}>
                        <Link
                          href={`/ideas/${city.slug}`}
                          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                        >
                          <MapPin size={12} className="text-muted-foreground" />
                          <span>{city.city}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>

                  {extraCount > 0 && (
                    <p className="text-xs font-medium text-muted-foreground">
                      + {extraCount} more {extraCount === 1 ? 'city' : 'cities'}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      <ValifyeFooter />
    </div>
  )
}