import Link from 'next/link'
import {
  ArrowRight,
  Database,
  Zap,
  Scale,
  Activity,
  Calculator,
  TrendingDown,
  Percent,
  Landmark
} from 'lucide-react'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { ValifyeFooter } from '@/components/valifye-footer'
import { createClient } from '@/utils/supabase/server'

export const metadata = {
  title: 'Valifye | Forensic Market Intelligence Engine',
  description:
    'Stop building in the dark. Discover validated micro-SaaS opportunities and run them through our live intelligence engine.'
}

type LatestAudit = {
  slug: string
  idea_title: string
  final_verdict: string
  overall_integrity_score: number | null
}

export default async function HomePage() {
  const supabase = createClient()

  const { data: latestAudits } = await supabase
    .from('verdict_reports')
    .select('slug, idea_title, final_verdict, overall_integrity_score')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(3)

  const audits: LatestAudit[] = Array.isArray(latestAudits)
    ? (latestAudits as LatestAudit[])
    : []

  return (
    <div className="min-h-screen bg-background font-mono text-foreground">
      <ValifyeNavbar />

      <main className="mx-auto flex max-w-[1280px] flex-col gap-20 px-4 py-10 md:px-10 md:py-16 lg:py-20">
        {/* HERO */}
        <section className="border border-border bg-card p-8 text-left shadow-[4px_4px_0_0_hsl(var(--primary))] md:p-12">
          <div className="space-y-6">
            <h1 className="text-3xl font-black uppercase tracking-widest text-foreground md:text-5xl lg:text-6xl">
              Stop Building in the Dark.
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              You are looking at our open-source intelligence database. Browse hundreds of static
              market dossiers, or run your own custom parameters through our live valuation engine.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="https://app.valifye.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border-2 border-foreground bg-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] transition-all hover:bg-primary/90"
              >
                Launch Live Engine
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/ideas"
                className="inline-flex items-center gap-2 border-2 border-border bg-card px-6 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                Browse Dossier Database
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* INTELLIGENCE HUB – TRIPLE ENGINE */}
        <section className="space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
            Intelligence Hub
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {/* 01. MARKET BLUEPRINTS */}
            <article className="flex flex-col justify-between border border-border bg-card px-5 py-5 text-xs text-foreground shadow-[0_0_0_1px_hsl(var(--primary)/0.6)]">
              <header className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
                    01. MARKET BLUEPRINTS
                  </span>
                  <span className="rounded-sm border border-primary/50 bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.25em] text-primary">
                    STATIC
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Static 2026 dossiers for baseline metrics. City and niche blueprints rendered as machine-readable JSON.
                </p>
              </header>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                  /ideas
                </span>
                <Link
                  href="/ideas"
                  className="inline-flex items-center gap-1 border border-primary bg-background px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  Open Blueprints
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </article>

            {/* 02. FORENSIC VERDICTS */}
            <article className="flex flex-col justify-between border border-border bg-card px-5 py-5 text-xs text-foreground shadow-[0_0_0_1px_hsl(var(--primary)/0.6)]">
              <header className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
                    02. FORENSIC VERDICTS
                  </span>
                  <span className="rounded-sm border border-primary/50 bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.25em] text-primary">
                    DEEP AUDITS
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Brutal deep-dive audits and integrity scores. Each file is a full-stack logic trace of why an idea
                  deserves code or a kill-shot.
                </p>
              </header>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                  /reports
                </span>
                <Link
                  href="/reports"
                  className="inline-flex items-center gap-1 border border-primary bg-background px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  Open Verdicts
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </article>

            {/* 03. LOCAL pSEO */}
            <article className="flex flex-col justify-between border border-border bg-card px-5 py-5 text-xs text-foreground shadow-[0_0_0_1px_hsl(var(--primary)/0.6)]">
              <header className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
                    03. LOCAL pSEO
                  </span>
                  <span className="rounded-sm border border-primary/50 bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.25em] text-primary">
                    LIVE MAPS
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Hyper-local competitor analysis and micro-TAM maps. Cached city hubs built from Places data and
                  forensic unit economics.
                </p>
              </header>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                  /local-reports
                </span>
                <Link
                  href="/local-reports"
                  className="inline-flex items-center gap-1 border border-primary bg-background px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  Open Local pSEO
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </article>
          </div>
        </section>

        {/* FREE FORENSIC CALCULATORS */}
        <section className="space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
            Free Forensic Calculators
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Calculator,
                title: 'Delivery Margin Calculator',
                subtext:
                  'Stress-test third-party delivery fees before they consume your unit economics.',
                href: '/tools/delivery-calculator'
              },
              {
                icon: Landmark,
                title: 'SBA Loan Scanner',
                subtext:
                  'Pressure-test lender readiness and debt assumptions against 2026 rates.',
                href: '/tools/sba-loan-scanner'
              },
              {
                icon: TrendingDown,
                title: 'Franchise Profit Simulator',
                subtext:
                  'Measure royalty bleed and fee drag before long-term franchise commitments.',
                href: '/tools/franchise-profit-simulator'
              },
              {
                icon: Percent,
                title: 'UK VAT Cliff Scanner',
                subtext:
                  'Model the profitability valley around VAT threshold transition points.',
                href: '/tools/uk-vat-cliff-scanner'
              }
            ].map((tool) => (
              <article
                key={tool.href}
                className="flex flex-col justify-between border border-border bg-card p-5 text-xs shadow-[0_0_0_1px_hsl(var(--primary)/0.5)]"
              >
                <div className="space-y-3">
                  <tool.icon className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">
                    {tool.title}
                  </h3>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    {tool.subtext}
                  </p>
                </div>
                <Link
                  href={tool.href}
                  className="mt-5 inline-flex items-center gap-2 border border-primary bg-background px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  Open Tool
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* LATEST AUDITS – VERDICT TICKER */}
        <section className="space-y-4 border border-border bg-card px-5 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
              <Activity className="h-4 w-4 text-primary" />
              <span>Latest Audits</span>
            </div>
            <Link
              href="/reports"
              className="inline-flex items-center gap-1 border border-primary bg-background px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              View All Verdicts
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {audits.length === 0 ? (
            <div className="border border-border bg-background/60 px-4 py-3 text-[11px] text-muted-foreground">
              No published audits yet. Run the verdict pipeline to populate this ticker.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              {audits.map((audit) => (
                <Link
                  key={audit.slug}
                  href={`/reports/${audit.slug}`}
                  className="group flex flex-col justify-between border border-border bg-card px-4 py-3 text-left text-[11px] transition-colors hover:border-primary"
                >
                  <div className="mb-2 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 rounded-sm border border-primary/60 bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.25em] text-primary">
                        {audit.final_verdict}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                        {Number.isFinite(audit.overall_integrity_score)
                          ? `${audit.overall_integrity_score}/100`
                          : '—'}
                      </span>
                    </div>
                    <p className="line-clamp-2 font-semibold text-foreground group-hover:text-primary">
                      {audit.idea_title}
                    </p>
                  </div>
                  <span className="mt-auto text-[9px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                    Open Forensic Report →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          className="scroll-mt-20 space-y-8 border-t border-border pt-12"
        >
          <h2 className="text-lg font-bold uppercase tracking-widest text-foreground">
            How It Works
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex flex-col gap-4 border border-border bg-card p-6 shadow-[4px_4px_0_0_hsl(var(--primary))]">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Step 1
                </span>
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">
                The Honeypot
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Valifye.com provides static, baseline metrics for cities and niches. Pre-generated
                dossiers you can browse for free.
              </p>
            </div>
            <div className="flex flex-col gap-4 border border-border bg-card p-6 shadow-[4px_4px_0_0_hsl(var(--primary))]">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Step 2
                </span>
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">
                The Engine
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                App.valifye.com takes your specific capital, skills, and runway. Input your
                constraints; the engine runs a live valuation.
              </p>
            </div>
            <div className="flex flex-col gap-4 border border-border bg-card p-6 shadow-[4px_4px_0_0_hsl(var(--primary))]">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Step 3
                </span>
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">
                The Verdict
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Get a brutal go/no-go decision on your startup idea. No fluff. No maybes.
              </p>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section
          id="pricing"
          className="scroll-mt-20 space-y-6 border-t border-border pt-12"
        >
          <h2 className="text-lg font-bold uppercase tracking-widest text-foreground">
            Pricing
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col justify-between gap-4 border border-border bg-card p-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Public Database
                </p>
                <h3 className="mt-2 text-xl font-bold uppercase tracking-widest text-foreground">
                  Free
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  This site. Static dossiers, city and niche intelligence. Browse with no account.
                </p>
              </div>
              <Link
                href="/ideas"
                className="inline-flex w-fit items-center gap-2 border border-border bg-background px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                Browse
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex flex-col justify-between gap-4 border-2 border-primary bg-card p-6 shadow-[4px_4px_0_0_hsl(var(--primary))]">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  Live Engine
                </p>
                <h3 className="mt-2 text-xl font-bold uppercase tracking-widest text-foreground">
                  Requires Access
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  App.valifye.com. Custom parameters, live valuation, and a direct verdict. Early
                  access only.
                </p>
              </div>
              <a
                href="https://app.valifye.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2 border-2 border-foreground bg-primary px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] transition-all hover:bg-primary/90"
              >
                Launch App
                <ArrowRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="scroll-mt-20 space-y-6 border-t border-border pt-12"
        >
          <h2 className="text-lg font-bold uppercase tracking-widest text-foreground">
            FAQ
          </h2>
          <ul className="space-y-0">
            <li className="border border-border bg-card">
              <div className="flex flex-col gap-2 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-foreground">
                  What is the difference between this site and the app?
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  This site is a static directory of pre-generated reports. The app is a live,
                  custom validation tool where you input your parameters and receive a tailored
                  verdict.
                </p>
              </div>
            </li>
            <li className="border border-t-0 border-border bg-card">
              <div className="flex flex-col gap-2 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-foreground">
                  Is the data accurate?
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  It is a baseline forensic estimate for 2026. You must still do your own
                  street-level validation.
                </p>
              </div>
            </li>
            <li className="border border-t-0 border-border bg-card">
              <div className="flex flex-col gap-2 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-foreground">
                  Why is the design so aggressive?
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Because the market doesn&apos;t care about your feelings. We provide brutal
                  honesty, not false hope.
                </p>
              </div>
            </li>
          </ul>
        </section>
      </main>

      <ValifyeFooter />
    </div>
  )
}
