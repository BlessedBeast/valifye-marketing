import Link from 'next/link'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { ValifyeFooter } from '@/components/valifye-footer'

export const metadata = {
  title: 'Terms of Service | Valifye',
  description: 'Valifye terms of service: acceptance, nature of intelligence, acceptable use, contact.'
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background font-mono text-foreground">
      <ValifyeNavbar />
      <main className="mx-auto max-w-3xl px-6 py-20 font-mono text-sm leading-relaxed text-muted-foreground">
        <nav className="mb-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
          <Link href="/" className="transition-colors hover:text-primary">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Terms of Service</span>
        </nav>

        <h1 className="mb-12 border-b border-border pb-4 text-2xl font-bold uppercase tracking-widest text-foreground">
          Terms of Service
        </h1>

        <section className="mb-10 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">
            Acceptance
          </h2>
          <p>
            By accessing or using Valifye, you agree to these terms. If you do not agree, do not
            use the site or any of its content. We may change these terms at any time; continued
            use after changes constitutes acceptance of the updated terms.
          </p>
        </section>

        <section className="mb-10 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">
            Nature of Intelligence
          </h2>
          <p>
            Valifye provides AI-synthesized market blueprints and related intelligence for
            informational and research purposes only. Content is derived from public and licensed
            sources and is not financial, legal, or business advice. We do not guarantee accuracy,
            completeness, or fitness for any particular purpose. We do not guarantee financial
            success, revenue, or any business outcome. Any decision to act on the information
            presented—including investment, hiring, or operational decisions—is solely your
            responsibility. Liability for loss, bankruptcy, or any adverse outcome arising from use
            of our content rests solely on the user.
          </p>
        </section>

        <section className="mb-10 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">
            Acceptable Use
          </h2>
          <p>
            You may use the site and its content for lawful, personal or internal business
            research. You may not scrape, crawl, or automate access to the site or its data
            without prior written permission. You may not resell, republish, or redistribute
            bulk extracts of our content in a way that undermines our service or violates
            applicable law. We reserve the right to restrict or terminate access for abuse or
            violation of these terms.
          </p>
        </section>

        <section className="mb-10 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">
            Contact
          </h2>
          <p>
            For questions about these terms or to request permission for automated or bulk use,
            contact us at{' '}
            <a
              href="mailto:hello@valifye.com"
              className="font-semibold text-foreground underline underline-offset-2 transition-colors hover:text-primary"
            >
              hello@valifye.com
            </a>
            .
          </p>
        </section>

        <p className="border-t border-border pt-6 text-[11px] uppercase tracking-widest text-muted-foreground/80">
          Last updated: 2026. Valifye reserves the right to update these terms; the current
          version is always published on this page.
        </p>
      </main>
      <ValifyeFooter />
    </div>
  )
}
