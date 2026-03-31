import Link from 'next/link'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { ValifyeFooter } from '@/components/valifye-footer'

export default function AuditLandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ValifyeNavbar />
      <main className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-16 sm:px-6 lg:px-8">
        <section className="space-y-6 border border-border bg-card p-6 shadow-[4px_4px_0_0_hsl(var(--primary))] sm:p-8">
          <div className="inline-flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Forensic Local Audit</span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight sm:text-3xl">
            Lock in a VAT‑proof, lender‑ready pricing model.
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            This audit bundles your local wage data, competitor density, and tax cliffs into a single
            10‑page logic trace. Attach it to SBA applications, franchise negotiations, or investor memos as
            proof that your numbers survive real‑world conditions.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
            <span>Step 1 · Purchase Audit</span>
            <span className="h-px w-8 bg-border" />
            <span>Step 2 · Complete Intake Form</span>
            <span className="h-px w-8 bg-border" />
            <span>Step 3 · Receive PDF + JSON</span>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="https://app.valifye.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border-2 border-foreground bg-primary px-5 py-2 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] transition-all hover:bg-primary/90"
            >
              Start Audit Checkout
              <ArrowRight className="h-3 w-3" />
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-2 border border-border bg-card px-4 py-2 text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Back to intelligence hub
            </Link>
          </div>
        </section>
      </main>
      <ValifyeFooter />
    </div>
  )
}

