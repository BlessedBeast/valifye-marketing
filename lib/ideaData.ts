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

// ─── Mock Data ─────────────────────────────────────────────────────────────────

export const MOCK_IDEAS: Idea[] = [
  {
    slug: 'coffee-shop-in-austin',
    niche: 'Coffee Shop',
    city: 'Austin',
    market_heat: 'Hot',
    estimated_tam: '$720M',
    local_competitors: 847,
    market_narrative:
      "Austin's coffee market is highly competitive but shows strong demand driven by remote workers and tech professionals. Clear service inefficiencies create opportunity.",
    confidence: 'high',
    top_complaints: [
      'Long wait times during peak hours',
      'Overpriced specialty drinks',
      'Limited parking availability'
    ],
    opportunity_score: 62,
    difficulty_score: 74,
    trend: 'growing',
    trend_pct: 12,
    revenue_potential: { low: 180000, mid: 420000, high: 780000 },
    avg_revenue_per_unit: 4.75,
    startup_cost_range: { low: 80000, high: 250000 },
    breakeven_months: 14,
    business_shape: 'Service'
  },
  {
    slug: 'ev-charging-station-in-denver',
    niche: 'EV Charging Station',
    city: 'Denver',
    market_heat: 'Warm',
    estimated_tam: '$150M',
    local_competitors: 62,
    market_narrative:
      "Denver's EV infrastructure is expanding but underserved in suburban zones. Reliability and payment friction are major gaps.",
    confidence: 'high',
    top_complaints: [
      'Unreliable charging equipment',
      'Limited suburban coverage',
      'Complex payment systems'
    ],
    opportunity_score: 81,
    difficulty_score: 58,
    trend: 'growing',
    trend_pct: 34,
    revenue_potential: { low: 90000, mid: 240000, high: 520000 },
    avg_revenue_per_unit: 12.5,
    startup_cost_range: { low: 50000, high: 180000 },
    breakeven_months: 18,
    business_shape: 'Service'
  },
  {
    slug: 'pet-grooming-in-chicago',
    niche: 'Pet Grooming',
    city: 'Chicago',
    market_heat: 'Warm',
    estimated_tam: '$330M',
    local_competitors: 214,
    market_narrative:
      "Chicago's pet grooming sector shows steady growth with premium urban pet owners willing to pay for convenience.",
    confidence: 'high',
    top_complaints: [
      'Long appointment wait times',
      'Inconsistent quality',
      'No mobile/home service options'
    ],
    opportunity_score: 71,
    difficulty_score: 42,
    trend: 'growing',
    trend_pct: 8,
    revenue_potential: { low: 120000, mid: 310000, high: 580000 },
    avg_revenue_per_unit: 65,
    startup_cost_range: { low: 30000, high: 120000 },
    breakeven_months: 10,
    business_shape: 'Service'
  },
  {
    slug: 'medspa-in-new-york',
    niche: 'MedSpa',
    city: 'New York',
    market_heat: 'Hot',
    estimated_tam: '$2.1B',
    local_competitors: 1240,
    market_narrative:
      "NYC's MedSpa market is enormous but fragmented. Premium positioning and tech-forward booking create clear differentiation.",
    confidence: 'medium',
    top_complaints: [
      'Opaque pricing',
      'Long waiting lists',
      'Inconsistent practitioner quality'
    ],
    opportunity_score: 55,
    difficulty_score: 82,
    trend: 'growing',
    trend_pct: 18,
    revenue_potential: { low: 350000, mid: 900000, high: 2200000 },
    avg_revenue_per_unit: 280,
    startup_cost_range: { low: 200000, high: 600000 },
    breakeven_months: 22,
    business_shape: 'Service'
  },
  {
    slug: 'online-fitness-coaching-in-london',
    niche: 'Online Fitness Coaching',
    city: 'London',
    market_heat: 'Warm',
    estimated_tam: '$890M',
    local_competitors: 430,
    market_narrative:
      "London's online fitness market exploded post-COVID and has stabilized at high demand. Niche specialization is the winning strategy.",
    confidence: 'high',
    top_complaints: [
      'Generic programs not personalized',
      'Poor accountability features',
      'No nutrition guidance included'
    ],
    opportunity_score: 68,
    difficulty_score: 35,
    trend: 'stable',
    trend_pct: 3,
    revenue_potential: { low: 60000, mid: 180000, high: 450000 },
    avg_revenue_per_unit: 99,
    startup_cost_range: { low: 5000, high: 30000 },
    breakeven_months: 4,
    business_shape: 'Info'
  },
  {
    slug: 'co-working-space-in-bangalore',
    niche: 'Co-working Space',
    city: 'Bangalore',
    market_heat: 'Hot',
    estimated_tam: '$450M',
    local_competitors: 320,
    market_narrative:
      "Bangalore's startup ecosystem drives massive co-working demand. Tier-2 neighborhoods are severely underserved.",
    confidence: 'high',
    top_complaints: [
      'Poor internet reliability',
      'Overcrowding during peak hours',
      'Limited private meeting rooms'
    ],
    opportunity_score: 76,
    difficulty_score: 61,
    trend: 'growing',
    trend_pct: 22,
    revenue_potential: { low: 200000, mid: 500000, high: 1100000 },
    avg_revenue_per_unit: 150,
    startup_cost_range: { low: 100000, high: 350000 },
    breakeven_months: 16,
    business_shape: 'Service'
  }
]


