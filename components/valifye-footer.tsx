import Link from 'next/link'

const FOOTER_COLS = [
  {
    heading: 'Intelligence',
    links: [
      { label: 'Ideas Database', href: '/ideas' },
      { label: 'Verdict Reports', href: '/reports' },
      { label: 'Local Reports', href: '/local-reports' },
      { label: 'Market Blueprints', href: '/markets' },
      { label: 'Compare Markets', href: '/compare' },
      { label: 'Niche Profitability', href: '/profitable-niches' },
      { label: 'Market Saturation', href: '/market-saturation' },
      { label: 'Build / Kill Matrix', href: '/build-verdicts' },
    ],
  },
  {
    heading: 'Tools',
    links: [
      { label: 'All Free Tools', href: '/tools' },
      { label: 'Delivery Margin Calculator', href: '/tools/delivery-calculator' },
      { label: 'SBA Loan Scanner', href: '/tools/sba-loan-scanner' },
      { label: 'Franchise Profit Simulator', href: '/tools/franchise-profit-simulator' },
      { label: 'UK VAT Cliff Scanner', href: '/tools/uk-vat-cliff-scanner' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Showcase Reports', href: '/showcase' },
      { label: 'Solutions', href: '/solutions' },
      { label: 'Market Database', href: '/ideas' },
      { label: 'SaaS Vertical Playbooks', href: '/saas-verticals' },
      { label: 'Validation Guides', href: '/validation-guides' },
      { label: 'Regional Opportunities', href: '/local-opportunities' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Contact', href: 'mailto:hello@valifye.com' },
    ],
  },
] as const

export function ValifyeFooter() {
  return (
    <footer className="border-t border-[#1f2937] bg-[#0a0a0a]">
      <div className="px-6 py-16 md:px-12 lg:px-24">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {FOOTER_COLS.map((col) => (
            <div key={col.heading}>
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#f5a623]">
                {col.heading}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    {link.href.startsWith('mailto:') ? (
                      <a
                        href={link.href}
                        className="text-sm text-[#6b7280] transition-colors hover:text-white"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-[#6b7280] transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 border-t border-[#1f2937] px-6 py-5 sm:flex-row md:px-12 lg:px-24">
        <div className="flex items-center gap-3">
          <span className="font-black tracking-tight text-white">VALIFYE</span>
          <span className="text-[#1f2937]">·</span>
          <span className="font-mono text-[11px] uppercase tracking-wide text-[#4b5563]">
            Forensic Intelligence
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <span className="font-mono text-[11px] text-[#4b5563]">
            © {new Date().getFullYear()} Valifye · All systems operational
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#22c55e]" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#22c55e]">Live</span>
          </span>
        </div>
      </div>
    </footer>
  )
}
