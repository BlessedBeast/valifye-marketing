import type { Metadata, Viewport } from 'next'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { UKVATCliffScanner } from '@/components/UKVATCliffScanner'

export const metadata: Metadata = {
  title: 'The £90k UK VAT Cliff Trap | Valifye Tools',
  description:
    'Model the VAT threshold shock and identify the UK profitability valley before crossing £90k turnover.'
}

export const viewport: Viewport = {
  themeColor: '#020617'
}

export default function UKVATCliffScannerPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <ValifyeNavbar />
      <main className="mx-auto w-full max-w-5xl px-4 py-10 pt-24 sm:px-6 lg:px-8">
        <section className="space-y-6 border border-slate-800 bg-slate-900/70 p-6 shadow-[0_0_0_1px_rgba(15,23,42,0.8)] sm:p-8">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-slate-50">
            The £90k UK VAT Cliff Trap
          </h1>
          <UKVATCliffScanner isEU={false} currencySymbol="£" />
          <p className="text-sm leading-relaxed text-slate-300">
            The UK profitability valley appears when businesses cross VAT
            registration and absorb a sudden tax shock into unchanged pricing.
            In many cases, earning £95,000 can leave less take-home than
            £85,000 unless pricing and margin architecture are redesigned.
          </p>
        </section>
      </main>
    </div>
  )
}

