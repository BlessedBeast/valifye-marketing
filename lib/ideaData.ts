import { Flame, Thermometer, Snowflake } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type HeatType = 'Hot' | 'Warm' | 'Cool'
export type ConfidenceType = 'high' | 'medium' | 'low'
export type TrendType = 'growing' | 'stable' | 'declining'
export type BusinessShape = 'Service' | 'SaaS' | 'E-commerce' | 'Info'

export interface Idea {
  slug: string
  region?: string
  niche: string
  city: string
  market_heat: HeatType
  estimated_tam: string
  local_competitors: number
  market_narrative: string
  confidence: ConfidenceType
  top_complaints: string[]
  faq_outlook?: string
  // Scores
  opportunity_score: number
  difficulty_score: number
  // Trend
  trend: TrendType
  trend_pct: number
  // Financials
  revenue_potential: { low: number; mid: number; high: number }
  avg_revenue_per_unit: number
  startup_cost_range: { low: number; high: number }
  breakeven_months: number
  // Optional
  business_shape?: BusinessShape
  // Validation Blueprint fields
  local_friction: string[]
  gtm_playbook: string[]
  failure_modes: string
  unit_economics: Record<string, unknown>
}

// ─── Heat Config ──────────────────────────────────────────────────────────────

export const HEAT_CONFIG: Record<
  HeatType,
  {
    icon: LucideIcon
    label: string
    badgeClass: string
    dotClass: string
    borderClass: string
    gradientClass: string
    barColor: string
  }
> = {
  Hot: {
    icon: Flame,
    label: 'Hot',
    badgeClass: 'bg-red-500/10 text-red-400 border-red-500/20',
    dotClass: 'bg-red-500',
    borderClass: 'border-red-500/30',
    gradientClass: 'from-red-500/10',
    barColor: 'bg-red-500'
  },
  Warm: {
    icon: Thermometer,
    label: 'Warm',
    badgeClass: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    dotClass: 'bg-orange-500',
    borderClass: 'border-orange-500/30',
    gradientClass: 'from-orange-500/10',
    barColor: 'bg-orange-500'
  },
  Cool: {
    icon: Snowflake,
    label: 'Cool',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    dotClass: 'bg-blue-500',
    borderClass: 'border-blue-500/30',
    gradientClass: 'from-blue-500/10',
    barColor: 'bg-blue-500'
  }
}

// ─── Score Helpers ─────────────────────────────────────────────────────────────

export function getSaturationScore(n: number): number {
  if (n > 500) return 90
  if (n > 200) return 70
  if (n > 100) return 50
  if (n > 50) return 30
  return 15
}

export function getOpportunityLabel(
  score: number
): { label: string; color: string } {
  if (score >= 80) return { label: 'Excellent', color: 'text-green-400' }
  if (score >= 60) return { label: 'Good', color: 'text-emerald-400' }
  if (score >= 40) return { label: 'Moderate', color: 'text-yellow-400' }
  return { label: 'Low', color: 'text-red-400' }
}

export function getDifficultyLabel(
  score: number
): { label: string; color: string } {
  if (score >= 80) return { label: 'Very Hard', color: 'text-red-400' }
  if (score >= 60) return { label: 'Hard', color: 'text-orange-400' }
  if (score >= 40) return { label: 'Moderate', color: 'text-yellow-400' }
  return { label: 'Easy', color: 'text-green-400' }
}

// Stroke color for SVG ScoreRing (can't use Tailwind inside SVG stroke attribute)
export function getScoreStrokeColor(
  score: number,
  type: 'opportunity' | 'difficulty'
): string {
  if (type === 'opportunity') {
    if (score >= 80) return '#22c55e' // green-500
    if (score >= 60) return '#10b981' // emerald-500
    if (score >= 40) return '#eab308' // yellow-500
    return '#ef4444' // red-500
  }

  if (score >= 80) return '#ef4444'
  if (score >= 60) return '#f97316'
  if (score >= 40) return '#eab308'
  return '#22c55e'
}

export function getHeatStrokeColor(heat: HeatType): string {
  if (heat === 'Hot') return '#ef4444'
  if (heat === 'Warm') return '#f97316'
  return '#3b82f6'
}

// (Intentionally no MOCK_IDEAS — all data now flows from Supabase `market_data`.)
