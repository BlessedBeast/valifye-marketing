import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs))
}

export function getMarketVerdict(score: number, avg: number) {
  const diff = score - avg

  if (diff >= 15)
    return {
      grade: 'A+',
      label: 'Market Leader',
      color: 'text-emerald-500',
      description:
        'This city is in the top 5% of regional opportunities for this niche.',
      diff
    }
  if (diff >= 5)
    return {
      grade: 'A',
      label: 'Strong Opportunity',
      color: 'text-green-500',
      description:
        'Outperforming regional benchmarks with high demand-to-saturation ratios.',
      diff
    }
  if (diff >= -5)
    return {
      grade: 'B',
      label: 'Balanced Market',
      color: 'text-blue-500',
      description:
        'Competition and demand are aligned with regional averages.',
      diff
    }
  return {
    grade: 'C',
    label: 'High Competition',
    color: 'text-amber-500',
    description:
      'A mature market requiring significant differentiation to capture share.',
    diff
  }
}
