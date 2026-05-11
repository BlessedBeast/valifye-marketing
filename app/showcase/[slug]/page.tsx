import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { MarketingShell } from '@/components/MarketingShell'
import { ArsenalTemplate } from '@/components/showcase/templates/ArsenalTemplate'
import { BattlefieldTemplate } from '@/components/showcase/templates/BattlefieldTemplate'
import { PivotTemplate } from '@/components/showcase/templates/PivotTemplate'
import { RiskTemplate } from '@/components/showcase/templates/RiskTemplate'
import { ScoutPivotTemplate } from '@/components/showcase/templates/ScoutPivotTemplate'
import { ScoutTemplate } from '@/components/showcase/templates/ScoutTemplate'
import {
  getMarketingShowcaseBySlug,
  type MarketingShowcaseReport
} from '@/lib/marketingShowcase'
import {
  buildShowcaseDatasetJsonLd,
  buildShowcaseMetadata
} from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const report = await getMarketingShowcaseBySlug(slug)

  if (!report) {
    return {
      title: 'Forensic Showcase | Valifye',
      description: 'Valifye forensic showcase report.'
    }
  }

  return buildShowcaseMetadata(report)
}

function ShowcaseTemplate({ report }: { report: MarketingShowcaseReport }) {
  if (report.template === 'battlefield') return <BattlefieldTemplate report={report} />
  if (report.template === 'pivot') return <PivotTemplate report={report} />
  if (report.template === 'arsenal') return <ArsenalTemplate report={report} />
  if (report.template === 'risk') return <RiskTemplate report={report} />
  if (report.template === 'scout_pivot') return <ScoutPivotTemplate report={report} />
  return <ScoutTemplate report={report} />
}

export default async function ShowcaseReportPage({ params }: Props) {
  const { slug } = await params
  const report = await getMarketingShowcaseBySlug(slug)

  if (!report) notFound()

  const jsonLd = buildShowcaseDatasetJsonLd(report)

  return (
    <MarketingShell className="max-w-[1100px] gap-8 font-mono">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ShowcaseTemplate report={report} />
    </MarketingShell>
  )
}
