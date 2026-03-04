'use client'

import { useState } from 'react'
import { AlertTriangle, ClipboardList, Copy, Check, LineChart, MapPin } from 'lucide-react'
import type { Idea } from '@/lib/ideaData'
import { cn } from '@/lib/utils'

interface ValidationBlueprintDashboardProps {
  idea: Idea
  urlOverride?: string
}

export function ValidationBlueprintDashboard({ idea, urlOverride }: ValidationBlueprintDashboardProps) {
  const {
    slug,
    niche,
    city,
    region,
    local_friction,
    gtm_playbook,
    failure_modes,
    unit_economics
  } = idea

  const econ = (unit_economics || {}) as Record<string, unknown>
  const marginRaw = typeof econ.margin_pct === 'number' ? econ.margin_pct : Number(econ.margin_pct ?? 0)
  const margin = Number.isFinite(marginRaw) ? marginRaw : 0
  const marginClamped = Math.max(0, Math.min(100, margin))

  const currencyCode =
    (econ.currency_code as string) ||
    (econ.currency as string) ||
    (econ.ccy as string) ||
    'LOCAL'

  const canonicalUrl =
    urlOverride ?? (typeof window !== 'undefined' ? window.location.href : slug ? `/ideas/${slug}` : '')

  const [copied, setCopied] = useState(false)

  const handleCopyGtm = async () => {
    if (!gtm_playbook?.length || typeof navigator === 'undefined' || !navigator.clipboard) return
    try {
      await navigator.clipboard.writeText(gtm_playbook.join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // swallow
    }
  }

  // ─── Schema.org JSON-LD (AEO/GEO) ────────────────────────────────────────────

  const frictionDatasetLd = {
    '@type': 'Dataset',
    name: `Local friction map for ${niche} in ${city}`,
    description: 'Set of city-specific operational and regulatory hurdles founders face in this niche.',
    variableMeasured: local_friction,
    spatialCoverage: {
      '@type': 'City',
      name: city
    }
  }

  const howToLd = {
    '@type': 'HowTo',
    name: `0-to-1 GTM playbook for ${niche} in ${city}`,
    description: 'Hyper-local step-by-step GTM sequence to acquire the first customers in this city.',
    step: gtm_playbook.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: `Step ${index + 1}`,
      text: step
    })),
    areaServed: {
      '@type': 'City',
      name: city
    }
  }

  const econPriceLd = {
    '@type': 'PriceSpecification',
    priceCurrency: currencyCode,
    price: typeof econ.unit_price === 'number' ? econ.unit_price : undefined,
    eligibleQuantity: typeof econ.monthly_volume === 'number' ? econ.monthly_volume : undefined,
    description:
      (econ.logic as string) ||
      'Local margin, rent, and labor impact estimates for this niche in the specified city and currency.'
  }

  const econDatasetLd = {
    '@type': 'Dataset',
    name: `Unit economics for ${niche} in ${city}`,
    description: 'Dataset describing margin percentage, rent impact, labor impact, and local cost logic.',
    variableMeasured: ['margin_pct', 'rent_impact', 'labor_impact'],
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'margin_pct',
        value: econ.margin_pct
      },
      {
        '@type': 'PropertyValue',
        name: 'rent_impact',
        value: econ.rent_impact
      },
      {
        '@type': 'PropertyValue',
        name: 'labor_impact',
        value: econ.labor_impact
      },
      {
        '@type': 'PropertyValue',
        name: 'currency',
        value: currencyCode
      }
    ],
    distribution: [
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/json',
        contentUrl: canonicalUrl || undefined
      }
    ]
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [frictionDatasetLd, howToLd, econPriceLd, econDatasetLd]
  }

  // ─── Dashboard Layout ────────────────────────────────────────────────────────

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quadrant 1: Local Friction Map */}
        <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em]">
                Local Friction Map
              </h2>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-300">
              Risk Radar
            </span>
          </header>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            {local_friction.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-2 rounded-lg border border-border bg-background/80 p-3"
              >
                <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-300">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500/15">
                    <AlertTriangle className="h-3 w-3" />
                  </span>
                  Hurdle {idx + 1}
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Quadrant 2: 0-to-1 GTM Stepper */}
        <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
          <header className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em]">
                0‑to‑1 GTM Stepper
              </h2>
            </div>
            <button
              type="button"
              onClick={handleCopyGtm}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy GTM
                </>
              )}
            </button>
          </header>

          <ol className="space-y-3 border-l border-border pl-4">
            {gtm_playbook.map((step, idx) => (
              <li key={idx} className="relative space-y-1 text-sm">
                <span className="absolute -left-[9px] top-1 h-2 w-2 rounded-full bg-primary" />
                <p className="font-semibold text-foreground">
                  Step {idx + 1}
                </p>
                <p className="text-xs text-muted-foreground">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Quadrant 3: Economic Reality Gauge */}
        <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LineChart className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em]">
                Economic Reality
              </h2>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {currencyCode} Margin
            </span>
          </header>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Thin</span>
              <span className="text-base font-semibold text-foreground">
                {marginClamped.toFixed(0)}% margin
              </span>
              <span>Healthy</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  marginClamped < 25
                    ? 'bg-red-500'
                    : marginClamped < 50
                      ? 'bg-orange-500'
                      : marginClamped < 75
                        ? 'bg-yellow-500'
                        : 'bg-emerald-500'
                )}
                style={{ width: `${marginClamped}%` }}
              />
            </div>

            <div className="overflow-hidden rounded-lg border border-border bg-background/80 text-xs">
              <div className="grid grid-cols-2 border-b border-border bg-muted/40 px-3 py-2 font-semibold text-foreground">
                <span>Metric</span>
                <span className="text-right">Value</span>
              </div>
              <div className="divide-y divide-border">
                {'unit_price' in econ && (
                  <div className="grid grid-cols-2 px-3 py-2 text-muted-foreground">
                    <span>Unit price</span>
                    <span className="text-right text-foreground">
                      {String(econ.unit_price)} {currencyCode}
                    </span>
                  </div>
                )}
                {'fixed_costs_monthly' in econ && (
                  <div className="grid grid-cols-2 px-3 py-2 text-muted-foreground">
                    <span>Fixed costs / month</span>
                    <span className="text-right text-foreground">
                      {String(econ.fixed_costs_monthly)} {currencyCode}
                    </span>
                  </div>
                )}
                {'monthly_volume' in econ && (
                  <div className="grid grid-cols-2 px-3 py-2 text-muted-foreground">
                    <span>Monthly volume</span>
                    <span className="text-right text-foreground">
                      {String(econ.monthly_volume)}
                    </span>
                  </div>
                )}
                {'rent_impact' in econ && (
                  <div className="grid grid-cols-2 px-3 py-2 text-muted-foreground">
                    <span>Rent impact</span>
                    <span className="text-right text-foreground capitalize">
                      {String(econ.rent_impact).toLowerCase()}
                    </span>
                  </div>
                )}
                {'labor_impact' in econ && (
                  <div className="grid grid-cols-2 px-3 py-2 text-muted-foreground">
                    <span>Labor impact</span>
                    <span className="text-right text-foreground capitalize">
                      {String(econ.labor_impact).toLowerCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {econ.logic && (
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                {String(econ.logic)}
              </p>
            )}
          </div>
        </section>

        {/* Quadrant 4: Brutal Pre‑Mortem */}
        <section className="rounded-xl border border-red-500/50 bg-gradient-to-br from-red-950 via-zinc-950 to-amber-900/30 px-5 py-5 text-sm text-red-100">
          <header className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-300" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em]">
                Brutal Pre‑Mortem
              </h2>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-red-500/70 bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-100">
              Bankruptcy Lens
            </span>
          </header>
          <p className="text-xs leading-relaxed text-red-100/90">
            {failure_modes}
          </p>
        </section>
      </div>
    </>
  )
}


