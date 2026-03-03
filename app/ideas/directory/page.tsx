import Link from 'next/link'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { ValifyeFooter } from '@/components/valifye-footer'
import { getUniqueNiches } from '@/lib/marketData'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Market Ideas by Category | Valifye Directory',
  description:
    'Browse all startup idea categories. Find market analyses by niche — from EV charging to coffee shops — across every city we cover.',
  openGraph: {
    title: 'Market Ideas by Category | Valifye',
    description: 'Browse startup idea categories and find market analyses by niche and city.',
    type: 'website',
    url: 'https://valifye.com/ideas/directory'
  },
  alternates: { canonical: 'https://valifye.com/ideas/directory' }
}

export const revalidate = 86400

export default async function DirectoryPage() {
  const niches = await getUniqueNiches()

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
          <span className="font-medium text-foreground">Directory</span>
        </nav>

        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Market ideas by category
        </h1>
        <p className="mt-2 text-muted-foreground">
          Browse every niche we cover. Each link lists all cities with published market analyses for that category.
        </p>

        <ul className="mt-10 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {niches.map(({ niche, nicheSlug }) => (
            <li key={nicheSlug}>
              <Link
                href={`/ideas/directory/${nicheSlug}`}
                className="block rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-card/80"
              >
                {niche}
              </Link>
            </li>
          ))}
        </ul>

        {niches.length === 0 && (
          <p className="mt-8 text-sm text-muted-foreground">
            No published categories yet. Check back soon.
          </p>
        )}
      </div>

      <ValifyeFooter />
    </div>
  )
}
