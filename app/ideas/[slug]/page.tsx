import { AlertTriangle, ArrowLeft, ArrowRight, BarChart3, LineChart, Search, Skull, Target, Users } from 'lucide-react'
import Link from 'next/link'
import { ValifyeButton } from '@/components/ui/valifye-button'

type VerdictType = 'BUILD' | 'KILL'

const MOCK_VERDICT: VerdictType = 'BUILD'

export default async function IdeaDossierPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const readableName = slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  const isBuild = MOCK_VERDICT === 'BUILD'

  return (
    <div className="space-y-8">
      {/* TOP BAR */}
      <header className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        <Link
          href="/ideas"
          className="inline-flex items-center gap-2 border border-border bg-card px-3 py-1 text-[11px] hover:border-primary hover:text-primary"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to archive
        </Link>
        <span className="inline-flex items-center gap-2">
          <Users className="h-3 w-3" />
          Intelligence dossier for
          <span className="text-foreground">{readableName}</span>
        </span>
      </header>

      {/* VERDICT HEADER */}
      <section className="border border-foreground bg-card px-6 py-6 text-left shadow-[4px_4px_0_0_hsl(var(--foreground))] md:px-8 md:py-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              Brutal Reality Verdict
            </p>
            <div className="space-y-3">
              <div className="inline-flex items-center gap-3 rounded-none border border-foreground bg-background px-4 py-2">
                {isBuild ? (
                  <>
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                      Verdict: Build
                    </span>
                  </>
                ) : (
                  <>
                    <Skull className="h-4 w-4 text-red-400" />
                    <span className="text-xs font-semibold uppercase tracking-[0.25em] text-red-400">
                      Verdict: Kill
                    </span>
                  </>
                )}
              </div>
              <h1 className="text-3xl font-black leading-tight tracking-tight md:text-4xl">
                {readableName}
              </h1>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              This dossier compresses a 7‑day validation sprint into one brutal page. Every interview, landing page
              visit, and pricing push is distilled into a single verdict you cannot ignore.
            </p>
          </div>

          <div className="space-y-3 text-right text-xs md:min-w-[220px]">
            <div className="inline-flex items-baseline gap-3 border border-border bg-background px-4 py-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Confidence
              </span>
              <span className="text-3xl font-black text-primary">
                {isBuild ? '82%' : '23%'}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Confidence score is computed from interview truth density, offer stress tests, and real payment attempts.
            </p>
            {isBuild ? (
              <ValifyeButton className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Move to Build Roadmap
                <ArrowRight className="ml-2 h-3 w-3" />
              </ValifyeButton>
            ) : (
              <ValifyeButton
                variant="outline"
                className="w-full border-red-500/60 text-red-400 hover:bg-red-500/10"
              >
                Log Post‑Mortem Notes
              </ValifyeButton>
            )}
          </div>
        </div>
      </section>

      {/* MAIN GRID */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        {/* LEFT: FACTS */}
        <div className="space-y-4">
          {/* TAM Analysis */}
          <div className="border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em]">
                  TAM Analysis
                </h2>
              </div>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Top‑down + bottom‑up</span>
            </div>
            <div className="flex items-end gap-4">
              <p className="text-3xl font-black text-foreground">
                $84M
              </p>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Estimated annual spend across your validated segment assuming a conservative 2.4% capture over 5 years.
              </p>
            </div>
          </div>

          {/* Competitor Scan */}
          <div className="border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" />
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em]">
                  Competitor Scan
                </h2>
              </div>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                3 primary, 7 adjacent
              </span>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start justify-between gap-3">
                <span className="font-medium text-foreground">BigCo Ops Suite</span>
                <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Expensive • bloated • non‑founder friendly
                </span>
              </li>
              <li className="flex items-start justify-between gap-3">
                <span className="font-medium text-foreground">Indie CRM Tools</span>
                <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Generalist • no validation workflows
                </span>
              </li>
              <li className="flex items-start justify-between gap-3">
                <span className="font-medium text-foreground">DIY Spreadsheets</span>
                <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  High friction • zero guardrails
                </span>
              </li>
            </ul>
          </div>

          {/* Keyword Research */}
          <div className="border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LineChart className="h-4 w-4 text-primary" />
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em]">
                  Keyword Research
                </h2>
              </div>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Demand surface
              </span>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>
                Core intent phrases show <span className="font-semibold text-foreground">3.4k searches/month</span> with
                low‑to‑medium competition. Most queries mention &quot;validation&quot;, &quot;pre‑sales&quot;, and
                &quot;before I build&quot;.
              </p>
              <p>
                Opportunity lies in capturing high‑intent &quot;before launch&quot; queries that incumbents ignore in
                favour of generic startup content.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: EVIDENCE + RED FLAGS */}
        <aside className="space-y-4">
          {/* Evidence Timeline */}
          <div className="border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em]">
                  Smart Evidence Timeline
                </h2>
              </div>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Interviews • pages • payments
              </span>
            </div>

            <ol className="space-y-4 border-l border-border pl-4 text-xs">
              <li className="relative space-y-1">
                <span className="absolute -left-[9px] top-0 h-2 w-2 rounded-full bg-primary" />
                <p className="font-semibold text-foreground">Interview #3 – &quot;I would pay to never do this again.&quot;</p>
                <p className="text-[11px] text-muted-foreground">
                  Prospect volunteered pricing and asked for early access without being prompted — strong pain confirmation.
                </p>
              </li>
              <li className="relative space-y-1">
                <span className="absolute -left-[9px] top-0 h-2 w-2 rounded-full bg-primary" />
                <p className="font-semibold text-foreground">Landing page v1 – 7.4% email capture</p>
                <p className="text-[11px] text-muted-foreground">
                  Cold traffic from founder communities; copy emphasised &quot;brutal truth&quot; over &quot;AI magic&quot;.
                </p>
              </li>
              <li className="relative space-y-1">
                <span className="absolute -left-[9px] top-0 h-2 w-2 rounded-full bg-primary" />
                <p className="font-semibold text-foreground">Pre‑payment test – 5 x $49 deposits</p>
                <p className="text-[11px] text-muted-foreground">
                  Payment intent confirms the problem is not just interesting — it&apos;s purchase‑worthy.
                </p>
              </li>
            </ol>
          </div>

          {/* Red Flags Sidebar */}
          <div className="border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em]">
                  Red Flags
                </h2>
              </div>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                AI‑detected sugarcoating
              </span>
            </div>
            <ul className="space-y-3 text-xs">
              <li className="border border-red-500/40 bg-red-500/5 p-3 text-red-300">
                &quot;This is cool, I&apos;d totally use it&quot; — flagged as polite approval. No concrete workflow or
                budget mentioned.
              </li>
              <li className="border border-red-500/40 bg-red-500/5 p-3 text-red-300">
                Prospect repeatedly changed subject when asked about current spend, indicating low willingness to pay.
              </li>
              <li className="border border-red-500/40 bg-red-500/5 p-3 text-red-300">
                Two interviewees only engaged after hearing &quot;it&apos;s AI‑powered&quot; — tagged as hype‑driven,
                not pain‑driven interest.
              </li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  )
}

