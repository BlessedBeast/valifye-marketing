'use client'

import { ArrowRight, Check, Target, Timer, Users, Zap } from 'lucide-react'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { ValifyeFooter } from '@/components/valifye-footer'
import { ValifyeButton } from '@/components/ui/valifye-button'

const FEATURES = [
  {
    icon: Zap,
    label: 'Brutal Validation',
    copy: 'No fluff, no vibes. Only hard signals that tell you if anyone actually cares.'
  },
  {
    icon: Target,
    label: 'Market Fit Radar',
    copy: 'See exactly which segment is reacting — and which ones are ignoring you.'
  },
  {
    icon: Users,
    label: 'Customer Truth Engine',
    copy: 'Structured conversations that force prospects to reveal what they would really pay for.'
  },
  {
    icon: Timer,
    label: '7‑Day Sprint',
    copy: 'A brutally clear week-long playbook that forces a verdict instead of endless tinkering.'
  },
  {
    icon: Check,
    label: 'BUILD / PIVOT / KILL',
    copy: 'Your idea leaves with a label. No maybes. No “we’ll see”.'
  },
  {
    icon: ArrowRight,
    label: 'Deployed Test Pages',
    copy: 'Launch validation pages in minutes with copy tuned for brutal honesty, not vanity clicks.'
  },
  {
    icon: Users,
    label: 'Signal Board',
    copy: 'Every “yes”, “no”, and “maybe” is logged, scored, and visualized in one brutal dashboard.'
  },
  {
    icon: Target,
    label: 'Offer Stress‑Test',
    copy: 'Push pricing, positioning, and promise until they break — before your runway does.'
  },
  {
    icon: Timer,
    label: 'Runway Protector',
    copy: 'Protect the next 6 months of your life by killing bad ideas in week one.'
  }
] as const

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ValifyeNavbar />

      <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-[1280px] flex-col gap-16 px-4 py-10 md:px-10 md:py-16 lg:py-20">
        {/* HERO */}
        <section className="relative grid gap-10 border border-border bg-card p-6 text-left shadow-[0_0_0_3px_hsl(var(--foreground))] md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:p-10">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_hsl(var(--primary))/8,_transparent_60%),_radial-gradient(circle_at_bottom_right,_hsl(var(--primary))/6,_transparent_55%)]" />

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-foreground bg-background px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span>Brutal startup validation, no fluff</span>
            </div>

            <h1 className="text-4xl font-black leading-tight tracking-tight md:text-5xl lg:text-6xl">
              Brutal truth for your next startup idea.
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Valifye is a brutal validation system for founders who are done building in the dark. In 7 days you&apos;ll
              know whether to <span className="font-semibold text-foreground">BUILD</span>,{' '}
              <span className="font-semibold text-foreground">PIVOT</span>, or{' '}
              <span className="font-semibold text-foreground">KILL</span> your idea — before you burn another month of
              runway.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <ValifyeButton
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
              >
                Get Brutal Validation
                <ArrowRight className="ml-2 h-4 w-4" />
              </ValifyeButton>
              <ValifyeButton
                variant="outline"
                className="border-foreground bg-background text-foreground hover:bg-foreground hover:text-background"
                size="lg"
              >
                Watch How It Works
              </ValifyeButton>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <span className="h-1 w-6 bg-primary" />
                Built for solo founders &amp; indie hackers
              </span>
              <span>Dark mode first • Brutal dashboards • Zero subscriptions</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 border border-dashed border-border bg-background p-4 md:p-6">
            <div className="flex items-center justify-between border-b border-border pb-3 text-xs font-semibold uppercase tracking-[0.16em]">
              <span className="text-muted-foreground">Next 7 Days</span>
              <span className="rounded-full border border-border px-2 py-0.5 text-[10px]">
                Brutal Validation Plan
              </span>
            </div>
            <div className="space-y-2 text-xs md:text-sm">
              <div className="flex items-center justify-between border border-border bg-card px-3 py-2">
                <span className="font-semibold">Day 1</span>
                <span className="text-muted-foreground">Define brutal success / failure line</span>
              </div>
              <div className="flex items-center justify-between border border-border bg-card px-3 py-2">
                <span className="font-semibold">Days 2–3</span>
                <span className="text-muted-foreground">Run anti‑polite customer interviews</span>
              </div>
              <div className="flex items-center justify-between border border-border bg-card px-3 py-2">
                <span className="font-semibold">Days 4–5</span>
                <span className="text-muted-foreground">Ship a brutal landing test</span>
              </div>
              <div className="flex items-center justify-between border border-border bg-card px-3 py-2">
                <span className="font-semibold">Days 6–7</span>
                <span className="text-muted-foreground">Score signals &amp; choose your verdict</span>
              </div>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              Every step is opinionated and unforgiving on purpose. Valifye exists to kill weak ideas quickly so the
              strong ones survive.
            </p>
          </div>
        </section>

        {/* How it Works / 9 FEATURE GRID */}
        <section id="how-it-works" className="scroll-mt-20 space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                The brutal feature stack
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight md:text-3xl">
                9 sharp edges built to slice through bad ideas.
              </h2>
            </div>
            <p className="max-w-md text-xs text-muted-foreground md:text-sm">
              Every feature exists to answer one question: <span className="font-semibold text-foreground">Should this
              exist?</span> If the answer is no, Valifye will tell you — loudly.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.label}
                className="flex flex-col justify-between border border-foreground bg-card p-4 text-left shadow-[3px_3px_0_0_hsl(var(--foreground))]"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center border border-foreground bg-background">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em]">
                    {feature.label}
                  </h3>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground md:text-sm">{feature.copy}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="scroll-mt-20 space-y-6">
          <div className="border border-border bg-card p-6 md:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              Limited time — first 100 only
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground md:text-3xl">
              Founding member: $27 per validation. One-time.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              No subscription. Full system access. Price goes to $49 when founding spots fill.
            </p>
            <div className="mt-4">
              <ValifyeButton className="bg-primary text-primary-foreground hover:bg-primary/90">
                Claim founding spot
              </ValifyeButton>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 space-y-6">
          <div className="border border-border bg-card p-6 md:p-8">
            <h2 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
              Frequently asked questions
            </h2>
            <ul className="mt-6 space-y-4 text-sm text-muted-foreground">
              <li>
                <strong className="text-foreground">When do I get access?</strong> — Founding members get access first, within 4–6 weeks. You&apos;ll be notified by email.
              </li>
              <li>
                <strong className="text-foreground">Is $27 monthly?</strong> — No. One-time per validation run. No subscription.
              </li>
              <li>
                <strong className="text-foreground">Refunds?</strong> — Full refund within 14 days if the system didn&apos;t help. No questions.
              </li>
            </ul>
          </div>
        </section>

        {/* BRUTAL CTA STRIP */}
        <section className="border border-foreground bg-primary text-primary-foreground px-5 py-6 text-[11px] font-semibold uppercase tracking-[0.22em] md:px-8">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary-foreground" />
                Brutal mode is the default, not a toggle.
              </span>
              <span>Kill the wrong ideas, double‑down on the right ones.</span>
            </div>
            <ValifyeButton
              size="sm"
              className="border border-primary-foreground bg-primary-foreground text-primary hover:bg-card hover:text-foreground"
            >
              Start My 7‑Day Brutal Test
            </ValifyeButton>
          </div>
        </section>
      </main>

      <ValifyeFooter />
    </div>
  )
}
