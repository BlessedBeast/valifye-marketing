import type { Metadata, Viewport } from 'next'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { SBALoanScanner } from '@/components/SBALoanScanner'

export const metadata: Metadata = {
  title: 'SBA 7(a) Debt Trap Scanner | Valifye Tools',
  description:
    'Evaluate lender-readiness and local proof quality before taking SBA debt in 2026 conditions.'
}

export const viewport: Viewport = {
  themeColor: '#020617'
}

export default function SBALoanScannerPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <ValifyeNavbar />
      <main className="mx-auto w-full max-w-5xl px-4 py-10 pt-24 sm:px-6 lg:px-8">
        <section className="space-y-6 border border-slate-800 bg-slate-900/70 p-6 shadow-[0_0_0_1px_rgba(15,23,42,0.8)] sm:p-8">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-slate-50">
            SBA 7(a) Debt Trap Scanner
          </h1>
          <SBALoanScanner currencySymbol="$" />
          <p className="text-sm leading-relaxed text-slate-300">
            High 2026 rates plus strict DSCR underwriting can destroy cash flow
            for new operators inside the first year. If your local proof is
            thin and debt coverage is modeled on optimistic assumptions, a
            buyer can be insolvent within 12 months.
          </p>
        </section>
      </main>
    </div>
  )
}

