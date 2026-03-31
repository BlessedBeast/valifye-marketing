import type { Metadata, Viewport } from 'next'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { DeliveryMarginCalculator } from '@/components/DeliveryMarginCalculator'

export const metadata: Metadata = {
  title: 'The 3rd Party Delivery Profit Killer | Valifye Tools',
  description:
    'Run a forensic delivery margin calculation to see how platform commissions and operational leakage impact your 2026 restaurant unit economics.'
}

export const viewport: Viewport = {
  themeColor: '#020617'
}

export default function DeliveryCalculatorPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <ValifyeNavbar />
      <main className="mx-auto w-full max-w-5xl px-4 py-10 pt-24 sm:px-6 lg:px-8">
        <section className="space-y-6 border border-slate-800 bg-slate-900/70 p-6 shadow-[0_0_0_1px_rgba(15,23,42,0.8)] sm:p-8">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-slate-50">
            The 3rd Party Delivery Profit Killer
          </h1>
          <DeliveryMarginCalculator
            platformLabel="Delivery Platforms"
            currencySymbol="$"
          />
          <p className="text-sm leading-relaxed text-slate-300">
            In 2026, a 30% platform commission can erase most of your operating
            cushion before rent, wages, and spoilage are even considered. Local
            food businesses must pressure-test delivery math before signing
            leases, not after burn begins.
          </p>
        </section>
      </main>
    </div>
  )
}

