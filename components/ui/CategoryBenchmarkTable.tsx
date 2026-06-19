import { cn } from '@/lib/utils'

export interface CategoryBenchmarks {
  cogs_low: number
  cogs_high: number
  labor_low: number
  labor_high: number
  rent_low: number
  rent_high: number
  op_margin_low: number
  op_margin_high: number
}

export interface CategoryBenchmarkTableProps {
  benchmarks: CategoryBenchmarks
  className?: string
  /** Accessible label for the benchmark table */
  label?: string
}

function formatPercentRange(low: number, high: number): string {
  const lo = Number.isFinite(low) ? Math.round(low) : 0
  const hi = Number.isFinite(high) ? Math.round(high) : 0
  if (lo <= 0 && hi <= 0) return '—'
  if (lo === hi) return `${lo}%`
  return `${lo}%–${hi}%`
}

export function CategoryBenchmarkTable({
  benchmarks,
  className,
  label = 'Category benchmark ranges'
}: CategoryBenchmarkTableProps) {
  const rows = [
    {
      label: 'COGS',
      value: formatPercentRange(benchmarks.cogs_low, benchmarks.cogs_high)
    },
    {
      label: 'Labor',
      value: formatPercentRange(benchmarks.labor_low, benchmarks.labor_high)
    },
    {
      label: 'Rent',
      value: formatPercentRange(benchmarks.rent_low, benchmarks.rent_high)
    },
    {
      label: 'Operating Margin',
      value: formatPercentRange(
        benchmarks.op_margin_low,
        benchmarks.op_margin_high
      )
    }
  ] as const

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-zinc-800/90 bg-zinc-950/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]',
        className
      )}
      aria-label={label}
    >
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">{label}</caption>
        <tbody>
          {rows.map((entry, index) => (
            <tr
              key={entry.label}
              className={cn(index > 0 && 'border-t border-zinc-800/90')}
            >
              <th
                scope="row"
                className="w-[42%] px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 md:px-6 md:py-4"
              >
                {entry.label}
              </th>
              <td className="px-4 py-3 font-mono text-sm font-semibold tabular-nums text-zinc-100 md:px-6 md:py-4">
                {entry.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
