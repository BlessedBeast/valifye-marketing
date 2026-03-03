'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { Idea } from '@/lib/ideaData'
import { getOpportunityLabel, getDifficultyLabel } from '@/lib/ideaData'

function generateFAQs(idea: Idea) {
  const opp = getOpportunityLabel(idea.opportunity_score)
  const diff = getDifficultyLabel(idea.difficulty_score)

  return [
    {
      q: `Is ${idea.niche} a good business idea in ${idea.city}?`,
      a: `Based on our analysis, ${idea.niche} in ${idea.city} has an opportunity score of ${idea.opportunity_score}/100 (${opp.label}) with a difficulty rating of ${idea.difficulty_score}/100 (${diff.label}). The market is currently ${idea.trend} at ${idea.trend_pct}% year-over-year. ${idea.market_narrative}`
    },
    {
      q: `How many ${idea.niche} competitors are in ${idea.city}?`,
      a: `There are currently ${idea.local_competitors.toLocaleString()} established ${idea.niche} businesses in ${idea.city}. Despite this, ${idea.top_complaints.length} verified market gaps suggest clear differentiation opportunities — particularly around ${idea.top_complaints[0]?.toLowerCase()}.`
    },
    {
      q: `What is the market size for ${idea.niche} in ${idea.city}?`,
      a: `The total addressable market (TAM) for ${idea.niche} in ${idea.city} is estimated at ${idea.estimated_tam}. Revenue potential ranges from $${idea.revenue_potential.low.toLocaleString()} (conservative) to $${idea.revenue_potential.high.toLocaleString()} (optimistic) annually.`
    },
    {
      q: `How much does it cost to start a ${idea.niche} in ${idea.city}?`,
      a: `Startup costs for a ${idea.niche} in ${idea.city} typically range from $${idea.startup_cost_range.low.toLocaleString()} to $${idea.startup_cost_range.high.toLocaleString()}, with an estimated breakeven timeline of approximately ${idea.breakeven_months} months at moderate customer volume.`
    },
    {
      q: `What are the biggest problems customers have with ${idea.niche} businesses in ${idea.city}?`,
      a: `The top customer complaints we've identified are: ${idea.top_complaints
        .map((c, i) => `${i + 1}) ${c}`)
        .join(
          '; '
        )}. Each represents a gap in the current market that a new entrant could exploit.`
    },
    {
      q: `Is ${idea.niche} demand growing or declining in ${idea.city}?`,
      a: `Demand for ${idea.niche} in ${idea.city} is ${idea.trend} at ${idea.trend_pct}% year-over-year. ${
        idea.trend === 'growing'
          ? 'This upward trend suggests increasing consumer interest and market expansion.'
          : idea.trend === 'stable'
          ? 'The market has reached a mature equilibrium with consistent demand.'
          : 'The declining trend may signal market saturation or shifting consumer preferences.'
      }`
    }
  ]
}

export function MarketFAQ({ idea }: { idea: Idea }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const faqs = generateFAQs(idea)

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <p className="text-sm font-semibold text-foreground">
          Frequently Asked Questions
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Common questions about starting a {idea.niche} in {idea.city}
        </p>
      </div>

      {/* FAQ list */}
      <div className="divide-y divide-border/50">
        {faqs.map((faq, i) => (
          <div key={faq.q}>
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="group flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-muted/20"
            >
              <span className="pr-4 text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                {faq.q}
              </span>
              <ChevronDown
                size={16}
                className={`flex-shrink-0 text-muted-foreground transition-transform duration-200 ${
                  openIndex === i ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openIndex === i && (
              <div className="px-6 pb-5">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

