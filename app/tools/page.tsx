import type { Metadata } from 'next'
import Link from 'next/link'

import { ValifyeNavbar } from '@/components/valifye-navbar'
import { buildCanonical } from '@/lib/seo'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://valifye.com'

export const metadata: Metadata = {
  title: 'Free Founder Tools | Valifye',
  description:
    'Free calculators and scanners for founders — delivery margin, SBA loans, franchise profit, and UK VAT cliff analysis. No signup required.',
  alternates: {
    canonical: buildCanonical('/tools')
  },
  openGraph: {
    title: 'Free Founder Tools | Valifye',
    description: 'Free calculators and scanners. No signup required.',
    url: `${SITE_URL}/tools`,
    type: 'website'
  }
}

const TOOLS = [
  {
    slug: 'delivery-calculator',
    title: 'Delivery Margin Calculator',
    description:
      'Calculate true delivery margins after platform fees, packaging, and labor. Know your real unit economics before scaling.',
    category: 'Unit Economics',
    badge: 'FREE'
  },
  {
    slug: 'sba-loan-scanner',
    title: 'SBA Loan Scanner',
    description:
      'Scan SBA loan eligibility parameters for your business model. Get a pre-qualification signal in under 60 seconds.',
    category: 'Funding',
    badge: 'FREE'
  },
  {
    slug: 'franchise-profit-simulator',
    title: 'Franchise Profit Simulator',
    description:
      'Model franchise unit economics — royalties, COGS, territory fees — and find the real break-even point.',
    category: 'Franchise',
    badge: 'FREE'
  },
  {
    slug: 'uk-vat-cliff-scanner',
    title: 'UK VAT Cliff Scanner',
    description:
      'Find the VAT registration threshold cliff for UK businesses. Know when crossing £85k in revenue hits your margins.',
    category: 'Tax & Compliance',
    badge: 'FREE'
  },
  {
    slug: 'build-pivot-kill',
    title: 'Build / Pivot / Kill Analyst',
    description:
      'Forensic startup idea validator — demand, saturation, and fatal risks in one structured audit.',
    category: 'Strategy',
    badge: 'FREE'
  }
] as const

export const revalidate = 3600

export default function ToolsHubPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <ValifyeNavbar />
      <main className="min-h-screen">
        <section className="border-b border-[#1f2937] px-6 pb-12 pt-24 md:px-12 lg:px-24">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[#6b7280]">
            Founder Toolkit · No Signup Required
          </p>
          <h1 className="mb-4 text-4xl font-black leading-tight md:text-5xl">Free Tools</h1>
          <p className="max-w-xl text-lg text-[#9ca3af]">
            Calculators and scanners built for founders who want answers in seconds, not spreadsheets
            that take hours.
          </p>
        </section>

        <section className="px-6 py-12 md:px-12 lg:px-24">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {TOOLS.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="group block rounded-xl border border-[#1f2937] bg-[#0d0d0d] p-6 transition-all duration-200 hover:border-[#22c55e]/40 hover:bg-[#111111]"
              >
                <div className="mb-3 flex items-start justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6b7280]">
                    {tool.category}
                  </span>
                  <span className="rounded bg-[#22c55e] px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-[0.15em] text-black">
                    {tool.badge}
                  </span>
                </div>

                <h2 className="mb-2 text-xl font-bold leading-snug text-white transition-colors group-hover:text-[#22c55e]">
                  {tool.title}
                </h2>

                <p className="text-sm leading-relaxed text-[#6b7280]">{tool.description}</p>

                <div className="mt-4 flex items-center gap-1 font-mono text-[11px] tracking-wide text-[#22c55e]">
                  OPEN TOOL
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="px-6 pb-16 md:px-12 lg:px-24">
          <div className="rounded-xl border border-dashed border-[#1f2937] p-6 text-center">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#4b5563]">
              More Tools Coming
            </p>
            <p className="text-sm text-[#6b7280]">
              New calculators ship with every major release. Follow updates to get notified.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
