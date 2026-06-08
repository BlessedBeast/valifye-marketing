import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Bot,
  Ban,
  Ghost,
  Link2,
  MessageSquareQuote,
  Rocket,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

import { FoundersLoungeCta } from '@/components/founders-lounge/FoundersLoungeCta'
import { ValifyeFooter } from '@/components/valifye-footer'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { KARMA_RULES, USER_TIERS } from '@/lib/community/constants'
import { buildCanonical, SITE_URL } from '@/lib/seo'

const PAGE_TITLE = 'Valifye Founders Lounge - The Reddit Alternative for Indie Hackers'
const PAGE_DESCRIPTION =
  'A friction-free founder community with karma-gated promotion, AI market scans on every post, and verified builders. Stop getting banned for building — validate ideas, earn karma, and launch with signal.'

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: buildCanonical('/founders-lounge'),
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: buildCanonical('/founders-lounge'),
    type: 'website',
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
  keywords: [
    'indie hackers community',
    'founder community',
    'reddit alternative for startups',
    'validate startup ideas',
    'karma gated promotion',
    'AI market scan',
    'verified builder badge',
  ],
}

const OTHER_FORUM_PAIN_POINTS = [
  {
    icon: Ban,
    title: 'Bots delete your links',
    description:
      'Automod nukes product URLs before anyone reads your post. You build in silence while the algorithm decides you are spam.',
  },
  {
    icon: Link2,
    title: 'Self-promotion is a crime',
    description:
      'Share what you shipped and catch a ban. The rules punish builders who actually have something to show.',
  },
  {
    icon: Ghost,
    title: 'Ghost towns and noise',
    description:
      'Low-signal threads, dead subreddits, and engagement bait drown out founders who want honest feedback.',
  },
] as const

const LOUNGE_BENEFITS = [
  {
    icon: ShieldCheck,
    title: 'Karma-gated promotion',
    description: `Earn ${KARMA_RULES.REVIEW_GIVEN.delta} karma per quality review. Unlock product links at ${USER_TIERS.builder.minKarma}+ karma — promotion you earned, not bought.`,
  },
  {
    icon: Bot,
    title: 'AI market scans on every post',
    description:
      'The Valifye Bot runs an instant market data scan on every thread — competitor context, demand signals, and a forensic read before the comments even start.',
  },
  {
    icon: Sparkles,
    title: 'Verified builders only',
    description:
      'Badge tiers separate lurkers from operators. Verified Founders pin launches, drop links, and get found on the global leaderboard.',
  },
] as const

const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    icon: MessageSquareQuote,
    title: 'Post your idea in Validate',
    description:
      'Drop your concept in the Validate space — problem statement, target user, and what you need pressure-tested. No link required to start.',
    href: '/community/validate',
  },
  {
    step: '02',
    icon: Bot,
    title: 'Valifye Bot runs a market scan',
    description:
      'Within seconds, the Valifye Bot posts an automated market intelligence scan on your thread — whitespace signals, competitive density, and a BUILD / PIVOT / KILL read.',
  },
  {
    step: '03',
    icon: TrendingUp,
    title: 'Review 3 founders to earn Karma',
    description: `Leave ${KARMA_RULES.REVIEW_GIVEN.minReviewChars}+ character reviews on other threads. Each qualifying review earns +${KARMA_RULES.REVIEW_GIVEN.delta} karma and climbs you toward Builder tier.`,
    href: '/community/leaderboard',
  },
  {
    step: '04',
    icon: Rocket,
    title: 'Unlock Launch and drop your link',
    description: `Hit ${USER_TIERS.builder.minKarma} karma to unlock the Launch space. Post your product URL where founders actually want to see it — not where moderators delete it.`,
    href: '/community/launch',
  },
] as const

export default function FoundersLoungePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] font-mono text-white">
      <ValifyeNavbar />

      <main>
        {/* Hero */}
        <section
          aria-labelledby="founders-lounge-hero"
          className="relative overflow-hidden border-b border-[#1f2937] px-6 pb-20 pt-28 md:px-12 lg:px-24"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,166,35,0.08)_0%,_transparent_55%)]"
            aria-hidden
          />
          <div className="relative mx-auto max-w-4xl text-center">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.25em] text-[#f5a623]">
              Valifye Founders Lounge
            </p>
            <h1
              id="founders-lounge-hero"
              className="text-balance text-4xl font-black leading-[1.08] tracking-tight md:text-5xl lg:text-6xl"
            >
              Stop Getting Banned for Building.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-[#9ca3af] md:text-xl">
              A friction-free, high-signal community for founders — karma-gated promotion,
              AI market scans on every post, and verified builders who actually ship.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <FoundersLoungeCta label="Join the Lounge (Free)" />
              <Link
                href="/community"
                className="inline-flex items-center justify-center rounded-full border border-[#374151] px-8 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:border-[#f5a623] hover:text-[#f5a623]"
              >
                Browse the Feed
              </Link>
            </div>
            <p className="mt-6 text-xs uppercase tracking-wider text-[#6b7280]">
              Free to join · Google sign-in · No credit card
            </p>
          </div>
        </section>

        {/* Problem vs Solution */}
        <section
          aria-labelledby="problem-solution-heading"
          className="border-b border-[#1f2937] px-6 py-20 md:px-12 lg:px-24"
        >
          <div className="mx-auto max-w-6xl">
            <header className="mx-auto mb-14 max-w-2xl text-center">
              <h2
                id="problem-solution-heading"
                className="text-3xl font-black tracking-tight md:text-4xl"
              >
                Other Forums vs. Valifye Lounge
              </h2>
              <p className="mt-4 text-[#9ca3af]">
                Indie hackers deserve a home built for builders — not one that treats shipping
                like spam.
              </p>
            </header>

            <div className="grid gap-6 lg:grid-cols-2">
              <article className="rounded-2xl border border-[#374151]/80 bg-[#0d0d0d] p-6 md:p-8">
                <h3 className="mb-6 text-sm font-bold uppercase tracking-[0.2em] text-[#ef4444]">
                  Other Forums
                </h3>
                <ul className="space-y-6">
                  {OTHER_FORUM_PAIN_POINTS.map((item) => (
                    <li key={item.title} className="flex gap-4">
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/5 text-[#ef4444]"
                        aria-hidden
                      >
                        <item.icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-bold text-white">{item.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-[#6b7280]">
                          {item.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="rounded-2xl border border-[#22c55e]/30 bg-[#22c55e]/5 p-6 md:p-8">
                <h3 className="mb-6 text-sm font-bold uppercase tracking-[0.2em] text-[#22c55e]">
                  Valifye Lounge
                </h3>
                <ul className="space-y-6">
                  {LOUNGE_BENEFITS.map((item) => (
                    <li key={item.title} className="flex gap-4">
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]"
                        aria-hidden
                      >
                        <item.icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-bold text-white">{item.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-[#9ca3af]">
                          {item.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section
          aria-labelledby="how-it-works-heading"
          className="border-b border-[#1f2937] px-6 py-20 md:px-12 lg:px-24"
        >
          <div className="mx-auto max-w-6xl">
            <header className="mx-auto mb-14 max-w-2xl text-center">
              <h2 id="how-it-works-heading" className="text-3xl font-black tracking-tight md:text-4xl">
                How It Works
              </h2>
              <p className="mt-4 text-[#9ca3af]">
                From idea validation to product launch — a clear path with real incentives.
              </p>
            </header>

            <ol className="grid gap-6 md:grid-cols-2">
              {HOW_IT_WORKS_STEPS.map((item) => (
                <li
                  key={item.step}
                  className="relative rounded-2xl border border-[#1f2937] bg-[#0d0d0d] p-6 transition-colors hover:border-[#f5a623]/30 md:p-8"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f5a623]">
                      Step {item.step}
                    </span>
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1f2937] bg-[#111111] text-[#f5a623]"
                      aria-hidden
                    >
                      <item.icon className="h-4 w-4" />
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#6b7280]">
                    {item.description}
                  </p>
                  {'href' in item && item.href ? (
                    <Link
                      href={item.href}
                      className="mt-4 inline-block text-xs font-bold uppercase tracking-wider text-[#f5a623] hover:underline"
                    >
                      Explore space →
                    </Link>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Final CTA */}
        <section
          aria-labelledby="final-cta-heading"
          className="px-6 py-24 md:px-12 lg:px-24"
        >
          <div className="mx-auto max-w-3xl rounded-2xl border border-[#f5a623]/30 bg-[radial-gradient(ellipse_at_center,_rgba(245,166,35,0.12)_0%,_#0d0d0d_70%)] px-6 py-16 text-center md:px-12">
            <h2
              id="final-cta-heading"
              className="text-balance text-3xl font-black tracking-tight md:text-4xl"
            >
              Claim your Verified Builder badge today.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[#9ca3af]">
              Join founders who validate before they build, earn karma through real reviews,
              and unlock Launch when you have something worth linking to.
            </p>
            <div className="mt-10">
              <FoundersLoungeCta label="Join the Lounge (Free)" />
            </div>
            <p className="mt-6 text-xs uppercase tracking-wider text-[#6b7280]">
              Already a member?{' '}
              <Link href="/community" className="text-[#f5a623] hover:underline">
                Go to the feed
              </Link>
            </p>
          </div>
        </section>
      </main>

      <ValifyeFooter />
    </div>
  )
}
