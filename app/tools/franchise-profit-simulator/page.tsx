import type { Metadata, Viewport } from 'next'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { FranchiseBleedSimulator } from '@/components/FranchiseBleedSimulator'

export const metadata: Metadata = {
  title: 'The Franchise Royalty Bleed Simulator | Valifye Tools',
  description:
    'Stress-test royalty drag and hidden franchise overhead before signing long-term contracts.'
}

export const viewport: Viewport = {
  themeColor: '#020617'
}

export default function FranchiseProfitSimulatorPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <ValifyeNavbar />
      <main className="mx-auto w-full max-w-5xl px-4 py-10 pt-24 sm:px-6 lg:px-8">
        <section className="space-y-6 border border-slate-800 bg-slate-900/70 p-6 shadow-[0_0_0_1px_rgba(15,23,42,0.8)] sm:p-8">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-slate-50">
            The Franchise Royalty Bleed Simulator
          </h1>
          <FranchiseBleedSimulator currencySymbol="$" />
          <p className="text-sm leading-relaxed text-slate-300">
            Paying royalties on gross revenue looks manageable in sales decks,
            but inflation, wage pressure, and rising occupancy costs attack net
            margins first. If gross-linked fees stay fixed while net shrinks,
            operators bleed profit even as top-line grows.
          </p>
        </section>
      </main>
    </div>
  )
}

