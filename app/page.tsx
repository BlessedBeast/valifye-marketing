import Link from 'next/link'
import { ArrowRight, Database, Zap, Scale } from 'lucide-react'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { ValifyeFooter } from '@/components/valifye-footer'

export const metadata = {
  title: 'Valifye | Forensic Market Intelligence Engine',
  description:
    'Stop building in the dark. Discover validated micro-SaaS opportunities and run them through our live intelligence engine.'
}

export default function HomePage() {
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
