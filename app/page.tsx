'use client'

import { useState } from 'react'
import {
  Check,
  ArrowRight,
  Users,
  BarChart3,
  Clock,
  ChevronDown
} from 'lucide-react'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { ValifyeFooter } from '@/components/valifye-footer'
import { ValifyeButton } from '@/components/ui/valifye-button'

const FAQ_ITEMS = [
  {
    q: 'When do I get access?',
    a: "We're opening access to founding members first. Expected: within 4-6 weeks. You'll be notified by email the day your access goes live."
  },
  {
    q: 'Is the $27 a monthly fee?',
    a: "No. It's a one-time payment per validation run. Pay once, run one full idea through the system, get your verdict. No subscription, no hidden fees."
  },
  {
    q: 'What if I want to validate multiple ideas?',
    a: 'Each $27 payment covers one complete validation. Founding members get the $27 rate forever — so every future idea costs $27 instead of $49.'
  },
  {
    q: "What if Valifye doesn't work for me?",
    a: "If you run a validation and feel the system didn't help, email us within 14 days for a full refund. No questions, no friction."
  },
  {
    q: 'Why charge before the app is fully live?',
    a: "Honest answer: charging early is itself a form of validation. It also funds the final features we're building."
  },
  {
    q: 'I signed up with Google — what happens now?',
    a: "You're on the waitlist. Founding members get access first, free signups get access after — at standard pricing."
  }
]

export default function HomePage() {
  const [spotsLeft] = useState(87)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background">
      <ValifyeNavbar onJoinWaitlist={() => scrollTo('pricing')} />

      {/* HERO */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--muted-foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--muted-foreground)) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />
        <div className="pointer-events-none absolute left-10 top-20 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute right-10 top-40 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />

        <div className="relative mx-auto max-w-3xl space-y-8 px-4 text-center">
          <div className="inline-flex rounded-full border border-primary/30 bg-primary/5 px-4 py-2">
            <span className="text-xs font-semibold tracking-wide text-primary">
              For Founders Who Are Done Wasting Time
            </span>
          </div>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Stop Building Things{' '}
            <span className="text-primary">Nobody Wants.</span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Valifye gives you a structured system to validate any startup idea
            in 7 days — and a clear
            <span className="font-semibold text-foreground">
              {' '}
              BUILD / PIVOT / KILL{' '}
            </span>
            verdict before you write a single line of code.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ValifyeButton
              size="lg"
              onClick={() => scrollTo('pricing')}
            >
              Claim Your Founding Spot — $27
              <ArrowRight size={18} className="ml-2" />
            </ValifyeButton>
            <ValifyeButton
              variant="outline"
              size="lg"
              onClick={() => scrollTo('pricing')}
            >
              Join Free Waitlist
            </ValifyeButton>
          </div>

          <p className="text-sm text-muted-foreground">
            🔒 First 100 founders only.{' '}
            <span className="font-semibold text-primary">
              {spotsLeft} spots remaining
            </span>
            . No subscriptions.
          </p>
        </div>
      </section>

      {/* PAIN */}
      <section className="bg-card/30 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl space-y-12 px-4">
          <div className="space-y-3 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              The $15,000 Mistake Most Founders Make
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base">
              6 months building. Launch day arrives. 2 paying customers. $47
              MRR. You don&apos;t have a product problem — you have a validation
              problem.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                icon: Users,
                title: 'You ask friends. They say yes.',
                accent: "They're lying.",
                desc: "They say 'great idea!' because they love you. Not because they'd pay."
              },
              {
                icon: BarChart3,
                title: 'You post surveys. You get interest.',
                accent: 'Not customers.',
                desc: "People say 'I'd use that!' — then never show up."
              },
              {
                icon: Clock,
                title: 'You launch. Crickets.',
                accent: 'Then you rebuild.',
                desc: 'Then you rebuild. And rebuild. Until the money runs out.'
              }
            ].map((card) => (
              <div
                key={card.title}
                className="space-y-3 rounded-xl border border-border bg-card p-6"
              >
                <card.icon
                  size={24}
                  className="text-muted-foreground"
                />
                <h3 className="font-semibold text-foreground">
                  {card.title}
                </h3>
                <p className="text-sm font-semibold text-primary">
                  {card.accent}
                </p>
                <p className="text-sm text-muted-foreground">{card.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-sm italic text-muted-foreground">
            The problem isn&apos;t your execution. It&apos;s that you validated
            with the wrong signals.
          </p>
        </div>
      </section>

      {/* SOLUTION */}
      <section className="bg-background py-20 sm:py-28">
        <div className="mx-auto max-w-4xl space-y-12 px-4">
          <div className="space-y-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              The System
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              A Complete Validation Operating System
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              {
                emoji: '🎤',
                title: 'Interview Framework',
                desc: 'The exact questions that get honest answers. Based on The Mom Test.'
              },
              {
                emoji: '🌐',
                title: 'Landing Page Generator',
                desc: 'Describe your idea. Get a deployed validation landing page in 60 seconds.'
              },
              {
                emoji: '📊',
                title: 'Evidence Tracker',
                desc: 'Track every signal from every conversation. Stop relying on vibes.'
              },
              {
                emoji: '🧮',
                title: 'Validation Score',
                desc: 'Your evidence gets scored across 4 dimensions. No more guessing.'
              }
            ].map((item) => (
              <div
                key={item.title}
                className="space-y-3 rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
              >
                <div className="text-2xl">{item.emoji}</div>
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-md space-y-3 rounded-xl border-2 border-primary/30 bg-card p-6 text-center transition-colors hover:border-primary/50">
              <div className="text-2xl">✅</div>
              <h3 className="font-semibold text-foreground">
                BUILD / PIVOT / KILL Verdict
              </h3>
              <p className="text-sm text-muted-foreground">
                A clear, data-backed decision. Not based on feelings. Based on
                proof.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="bg-card/30 py-20 sm:py-28"
      >
        <div className="mx-auto max-w-4xl space-y-10 px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              7 Days. One Verdict.
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {[
              {
                step: 1,
                title: 'Describe Your Idea',
                desc: 'Valifye generates your validation plan.'
              },
              {
                step: 2,
                title: 'Run 10 Interviews',
                desc: 'Use the built-in Mom Test framework.'
              },
              {
                step: 3,
                title: 'Launch a Test Page',
                desc: 'Track real signups and conversions.'
              },
              {
                step: 4,
                title: 'Get Your Verdict',
                desc: 'BUILD, PIVOT, or KILL — with evidence.'
              }
            ].map((item) => (
              <div
                key={item.step}
                className="space-y-3 text-center"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary font-bold">
                  {item.step}
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-background py-20 sm:py-28">
        <div className="mx-auto max-w-4xl space-y-12 px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              What Founders Are Saying
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                quote:
                  'I got a KILL verdict in 4 days. Best decision I ever made. Would have wasted 6 months.',
                name: 'Dev K.',
                role: 'SaaS Founder'
              },
              {
                quote:
                  'The interview framework alone is worth it. I finally got honest answers.',
                name: 'Priya M.',
                role: 'First-time Founder'
              },
              {
                quote:
                  "I pivoted based on the evidence. Now I'm building something people actually asked for.",
                name: 'James T.',
                role: 'Indie Hacker'
              }
            ].map((t) => (
              <div
                key={t.name}
                className="space-y-4 rounded-xl border border-border bg-card p-6"
              >
                <div className="text-sm text-primary">★★★★★</div>
                <p className="text-sm italic text-muted-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Join{' '}
            <span className="font-semibold text-primary">100</span> founders on
            the waitlist
          </p>
        </div>
      </section>

      {/* PRICING */}
      <section
        id="pricing"
        className="bg-card/30 py-20 sm:py-28"
      >
        <div className="mx-auto max-w-3xl space-y-10 px-4">
          <div className="space-y-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              ⚡ Limited Time — First 100 Only
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Become a Founding Member. Pay Once. Save Forever.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Founding Member */}
            <div className="relative space-y-4 rounded-xl border-2 border-primary bg-card p-8">
              <div className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                Founding Member — {spotsLeft} Left
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">
                    $27
                  </span>
                  <span className="ml-2 text-lg text-muted-foreground line-through">
                    $49
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Per Validation — One Time
                </p>
              </div>

              <ul className="space-y-2 text-sm text-foreground">
                {[
                  'Full validation system access',
                  'AI interview framework',
                  'Landing page generator',
                  'Evidence tracker + scoring',
                  'BUILD / PIVOT / KILL verdict'
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2"
                  >
                    <Check
                      size={16}
                      className="flex-shrink-0 text-primary"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <ValifyeButton className="w-full">
                Claim Founding Spot Now
              </ValifyeButton>

              <p className="text-center text-xs text-muted-foreground">
                Price goes to $49 when founding spots fill
              </p>
            </div>

            {/* Standard */}
            <div className="space-y-4 rounded-xl border border-border bg-card p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                STANDARD (AT LAUNCH)
              </p>
              <div className="space-y-1">
                <span className="text-4xl font-bold text-foreground">$49</span>
                <p className="text-sm text-muted-foreground">
                  Per Validation — One Time
                </p>
              </div>

              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  'Full validation system access',
                  'AI interview framework',
                  'Landing page generator',
                  'Evidence tracker + scoring',
                  'BUILD / PIVOT / KILL verdict'
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2"
                  >
                    <Check
                      size={16}
                      className="flex-shrink-0 text-muted-foreground"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <ValifyeButton
                variant="outline"
                className="w-full"
              >
                Join Free Waitlist Instead
              </ValifyeButton>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            🔒 Secured payment. Full refund if you&apos;re unhappy.
          </p>
        </div>
      </section>

      {/* FOUNDING BENEFITS */}
      <section className="bg-background py-20 sm:py-28">
        <div className="mx-auto max-w-2xl space-y-8 px-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-foreground">
              What Founding Members Get
            </h3>
          </div>

          <div className="space-y-4">
            {[
              'Lifetime 50% discount — every validation, forever',
              'Direct founder access — Slack/WhatsApp group with the team',
              'Roadmap voting — you decide what we build next',
              'First access when app opens — skip the waitlist entirely',
              'Founding Member badge in-app — visible to other users'
            ].map((benefit) => (
              <div
                key={benefit}
                className="flex items-start gap-3"
              >
                <Check
                  size={18}
                  className="mt-0.5 flex-shrink-0 text-primary"
                />
                <span className="text-sm text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="bg-card/30 py-20 sm:py-28"
      >
        <div className="mx-auto max-w-2xl space-y-8 px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => {
              const isOpen = openFaq === i
              return (
                <div
                  key={item.q}
                  className="overflow-hidden rounded-xl border border-border"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaq((current) => (current === i ? null : i))
                    }
                    className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-semibold text-foreground transition-colors hover:text-primary"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      size={16}
                      className={`text-muted-foreground transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4 text-sm leading-relaxed text-muted-foreground">
                      {item.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-y border-primary/20 bg-primary/5 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl space-y-8 px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            <span className="text-5xl text-primary">{spotsLeft}</span> Founding
            Spots Left.
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            After these fill, the price is $49 per validation. Forever.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ValifyeButton
              size="lg"
              onClick={() => scrollTo('pricing')}
            >
              Claim Your Founding Spot — $27
              <ArrowRight size={18} className="ml-2" />
            </ValifyeButton>
            <ValifyeButton
              variant="outline"
              size="lg"
              onClick={() => scrollTo('pricing')}
            >
              Join Free Waitlist
            </ValifyeButton>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <span>🔒 Secured Payment</span>
            <span>💳 No Subscription</span>
            <span>↩️ 14-Day Refund</span>
            <span>✅ 100 Founders Waiting</span>
          </div>
        </div>
      </section>

      <ValifyeFooter />
    </div>
  )
}
