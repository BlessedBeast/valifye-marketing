import Link from 'next/link'

type PseoHubGridProps = {
  items: Array<{
    href: string
    title: string
    subtitle?: string
    badge?: string
  }>
  emptyMessage?: string
}

export function PseoHubGrid({
  items,
  emptyMessage = 'No published pages yet.',
}: PseoHubGridProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-[#1f2937] bg-[#0d0d0d] px-6 py-10 text-center text-sm text-[#6b7280]">
        {emptyMessage}
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="group block rounded-xl border border-[#1f2937] bg-[#0d0d0d] p-5 transition-all hover:border-[#f5a623]/40 hover:bg-[#111111]"
        >
          {item.badge ? (
            <span className="mb-3 inline-block rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#f5a623] bg-[#f5a623]/10">
              {item.badge}
            </span>
          ) : null}
          <h2 className="mb-2 text-base font-bold text-white transition-colors group-hover:text-[#f5a623]">
            {item.title}
          </h2>
          {item.subtitle ? (
            <p className="line-clamp-2 text-sm leading-relaxed text-[#6b7280]">{item.subtitle}</p>
          ) : null}
          <span className="mt-4 inline-flex items-center gap-1 font-mono text-[11px] tracking-wide text-[#f5a623]">
            VIEW REPORT
            <span className="transition-transform group-hover:translate-x-1" aria-hidden>
              →
            </span>
          </span>
        </Link>
      ))}
    </div>
  )
}
