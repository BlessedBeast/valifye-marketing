import Link from 'next/link'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { ValifyeFooter } from '@/components/valifye-footer'

export const metadata = {
  title: 'Privacy Policy | Valifye',
  description: 'Valifye privacy policy: data collection, cookies, security, and contact.'
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background font-mono text-foreground">
      <ValifyeNavbar />
      <main className="mx-auto max-w-3xl px-6 py-20 font-mono text-sm leading-relaxed text-muted-foreground">
        <nav className="mb-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
          <Link href="/" className="transition-colors hover:text-primary">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Privacy Policy</span>
        </nav>

        <h1 className="mb-12 border-b border-border pb-4 text-2xl font-bold uppercase tracking-widest text-foreground">
          Privacy Policy
        </h1>

        <section className="mb-10 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">
            Data Collection
          </h2>
          <p>
            Valifye operates a minimal-data model. We do not maintain user accounts or persistent
            profiles by default. The site serves market validation blueprints and related intelligence
            derived from public and licensed sources. We store contact data only when you explicitly
            reach out—for example, by email—and only to the extent necessary to respond. No
            email addresses or other identifiers are collected for merely browsing the site or
            reading blueprints.
          </p>
        </section>

        <section className="mb-10 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">
            Cookies
          </h2>
          <p>
            We use standard, industry-typical analytics and operational cookies where necessary:
            for measuring traffic, diagnosing errors, and improving site performance. We do not
            sell cookie-derived data to third parties. You can control cookie behaviour via your
            browser settings; disabling certain cookies may limit some non-essential features.
          </p>
        </section>

        <section className="mb-10 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">
            Security
          </h2>
          <p>
            Data in transit is protected using TLS. Any data we retain—such as correspondence
            linked to an email address—is stored with access controls and treated as confidential.
            We do not guarantee absolute security of transmission or storage; we apply reasonable
            measures appropriate to the sensitivity of the data we hold.
          </p>
        </section>

        <section className="mb-10 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">
            Contact
          </h2>
          <p>
            For privacy-related requests, questions, or to request deletion of any data we hold
            about you, contact us at{' '}
            <a
              href="mailto:hello@valifye.com"
              className="font-semibold text-foreground underline underline-offset-2 transition-colors hover:text-primary"
            >
              hello@valifye.com
            </a>
            . We will process requests in line with applicable law and our operational capacity.
          </p>
        </section>

        <p className="border-t border-border pt-6 text-[11px] uppercase tracking-widest text-muted-foreground/80">
          Last updated: 2026. Valifye reserves the right to update this policy; the current version
          is always published on this page.
        </p>
      </main>
      <ValifyeFooter />
    </div>
  )
}
