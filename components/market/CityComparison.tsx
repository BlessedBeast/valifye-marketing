import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { Idea } from '@/lib/ideaData'
import {
  HEAT_CONFIG,
  getOpportunityLabel,
  getDifficultyLabel
} from '@/lib/ideaData'

interface CityComparisonProps {
  currentIdea: Idea
  comparisons: Idea[]
}

export function CityComparison({
  currentIdea,
  comparisons
}: CityComparisonProps) {
  if (comparisons.length === 0) return null

  const allIdeas = [currentIdea, ...comparisons]

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <p className="text-sm font-semibold text-foreground">
          {currentIdea.niche} — City Comparison
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          How {currentIdea.city} stacks up against other cities for the same
          niche
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50">
              {[
                'City',
                'Heat',
                'Competitors',
                'Opportunity',
                'Difficulty',
                'Trend'
              ].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {allIdeas.map((idea) => {
              const c = HEAT_CONFIG[idea.market_heat]
              const oppLabel = getOpportunityLabel(idea.opportunity_score)
              const diffLabel = getDifficultyLabel(idea.difficulty_score)
              const isCurrent = idea.slug === currentIdea.slug
              const Icon = c.icon

              return (
                <tr
                  key={idea.slug}
                  className={`transition-colors ${
                    isCurrent ? 'bg-primary/5' : 'hover:bg-muted/20'
                  }`}
                >
                  {/* City */}
                  <td className="px-4 py-3">
                    {isCurrent ? (
                      <span className="font-semibold text-foreground">
                        {idea.city}
                        <span className="ml-1.5 text-xs font-medium text-primary">
                          (current)
                        </span>
                      </span>
                    ) : (
                      <Link
                        href={`/ideas/${idea.slug}`}
                        className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                      >
                        {idea.city}
                        <ArrowUpRight size={12} />
                      </Link>
                    )}
                  </td>

                  {/* Heat */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold ${c.badgeClass}`}
                    >
                      <Icon size={10} />
                      {idea.market_heat}
                    </span>
                  </td>

                  {/* Competitors */}
                  <td className="px-4 py-3 font-medium text-foreground">
                    {idea.local_competitors.toLocaleString()}
                  </td>

                  {/* Opportunity score */}
                  <td
                    className={`px-4 py-3 font-semibold ${oppLabel.color}`}
                  >
                    {idea.opportunity_score}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      /100
                    </span>
                  </td>

                  {/* Difficulty score */}
                  <td
                    className={`px-4 py-3 font-semibold ${diffLabel.color}`}
                  >
                    {idea.difficulty_score}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      /100
                    </span>
                  </td>

                  {/* Trend */}
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium ${
                        idea.trend === 'growing'
                          ? 'text-green-400'
                          : idea.trend === 'stable'
                          ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}
                    >
                      {idea.trend === 'growing'
                        ? '↑'
                        : idea.trend === 'stable'
                        ? '→'
                        : '↓'}{' '}
                      {idea.trend_pct}%
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

