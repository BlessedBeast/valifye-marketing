import type { Metadata } from 'next'
import Link from 'next/link'

import { ValifyeNavbar } from '@/components/valifye-navbar'
import { buildCanonical } from '@/lib/seo'
import { getAllSolutions } from '@/lib/solutionData'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://valifye.com'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Solutions | Valifye Forensic Intelligence',
  description:
    "Explore Valifye's intelligence solutions — forensic playbooks and validated market blueprints for founders who build to win.",
  alternates: {
    canonical: buildCanonical('/solutions')
  },
  openGraph: {
    title: 'Solutions | Valifye Forensic Intelligence',
    description: 'Forensic playbooks and validated market blueprints.',
    url: `${SITE_URL}/solutions`,
    type: 'website'
  }
}

export default async function SolutionsHubPage() {
  const solutions = await getAllSolutions()

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <ValifyeNavbar />
      <main className="min-h-screen">
        <section className="border-b border-[#1f2937] px-6 pb-12 pt-24 md:px-12 lg:px-24">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[#6b7280]">
            Intelligence Library
          </p>
          <h1 className="mb-4 text-4xl font-black leading-tight md:text-5xl">Solutions</h1>
          <p className="max-w-xl text-lg text-[#9ca3af]">
            Forensic playbooks and validated market blueprints built for founders who need answers,
            not opinions.
          </p>
        </section>

        <section className="px-6 py-12 md:px-12 lg:px-24">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {solutions.map((solution) => (
              <Link
                key={solution.slug}
                href={`/solutions/${solution.slug}`}
                className="group block rounded-xl border border-[#1f2937] bg-[#0d0d0d] p-6 transition-all duration-200 hover:border-[#f5a623]/40 hover:bg-[#111111]"
              >
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#f5a623]">
                  {solution.primaryReportType}
                </p>

                <h2 className="mb-2 text-lg font-bold leading-snug text-white transition-colors group-hover:text-[#f5a623]">
                  {solution.title}
                </h2>

                <p className="line-clamp-3 text-sm leading-relaxed text-[#6b7280]">
                  {solution.metaDescription || solution.subtitle || solution.aeoAnswer || ''}
                </p>

                <div className="mt-4 flex items-center gap-1 font-mono text-[11px] tracking-wide text-[#f5a623]">
                  VIEW SOLUTION
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </Link>
            ))}
          </div>

          {solutions.length === 0 ? (
            <p className="font-mono text-sm text-[#6b7280]">No solutions available yet.</p>
          ) : null}
        </section>
      </main>
    </div>
  )
}
