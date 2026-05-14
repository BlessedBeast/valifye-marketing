import type { Metadata, Viewport } from 'next'

import { AeoShadowScanner } from '@/components/tools/AeoShadowScanner'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { buildCanonical } from '@/lib/seo'

const TITLE =
  'AEO Shadow Scanner: Answer-Engine Visibility Briefing (2026)'
const DESCRIPTION =
  'Run a forensic AEO shadow scan on any URL. Visibility index, citation snippets, entity gaps, and an optimization roadmap — structured for operators and answer engines.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: buildCanonical('/tools/aeo-scanner')
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'article',
    url: buildCanonical('/tools/aeo-scanner')
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION
  },
  robots: { index: true, follow: true }
}

export const viewport: Viewport = {
  themeColor: '#09090b'
}

export default function AeoScannerToolPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-400">
      <ValifyeNavbar />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 pt-24 sm:px-6 lg:px-8 lg:py-14">
        <article className="space-y-0 rounded-xl border border-zinc-800/90 bg-zinc-900/30 p-6 shadow-[0_0_80px_-48px_rgba(0,0,0,0.9)] sm:p-8 md:p-10">
          <AeoShadowScanner />
        </article>
      </main>
    </div>
  )
}
