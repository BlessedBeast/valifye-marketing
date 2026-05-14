import type { Metadata, Viewport } from 'next'

import { BuildPivotKillAnalyst } from '@/components/tools/BuildPivotKillAnalyst'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { buildCanonical } from '@/lib/seo'

const TITLE =
  'Build, Pivot, or Kill: Forensic Startup Idea Validator (2026)'
const DESCRIPTION =
  'Run your startup idea through a data-driven validation audit. Get brutal honesty on demand, market saturation, and fatal risks in seconds.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: buildCanonical('/tools/build-pivot-kill')
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'article',
    url: buildCanonical('/tools/build-pivot-kill')
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

export default function BuildPivotKillPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-400">
      <ValifyeNavbar />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 pt-24 sm:px-6 lg:px-8 lg:py-14">
        <article className="space-y-0 rounded-xl border border-zinc-800/90 bg-zinc-900/30 p-6 shadow-[0_0_80px_-48px_rgba(0,0,0,0.9)] sm:p-8 md:p-10">
          <BuildPivotKillAnalyst />
        </article>
      </main>
    </div>
  )
}
