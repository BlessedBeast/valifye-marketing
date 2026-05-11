import { AlertTriangle } from 'lucide-react'
import {
  getTemplateModules,
  RenderPreviewWithBlur,
  ShowcaseArticle,
  StandardModule,
  type TemplateProps
} from '@/components/showcase/templates/shared'
import type { ShowcaseModule } from '@/lib/marketingShowcase'

const FALLBACK_MODULES: ShowcaseModule[] = [
  {
    title: 'Critical Risk',
    summary:
      'The highest-probability failure mode is isolated before mitigation spending begins.',
    evidence:
      'Risk reports separate existential risk from normal execution variance.',
    source: 'Valifye risk taxonomy'
  },
  {
    title: 'Mitigation Steps',
    summary:
      'A short action list reduces exposure while preserving the fastest path to market signal.',
    steps: [
      'Validate the riskiest assumption with a cheap external proof.',
      'Cap budget exposure until the proof threshold is met.',
      'Replace vague confidence with a numeric go/no-go threshold.'
    ],
    evidence:
      'Mitigation steps are sequenced by reversibility and capital exposure.',
    source: 'Valifye mitigation engine'
  },
  {
    title: 'Tripwires',
    summary:
      'Defines the indicators that should force a pause, pivot, or kill decision.'
  }
]

export function RiskTemplate({ report }: TemplateProps) {
  const modules = getTemplateModules(report, FALLBACK_MODULES)

  return (
    <ShowcaseArticle report={report} eyebrow="Risk Register">
      <div className="border border-amber-700 bg-amber-950/30 px-5 py-4 text-[10px] font-bold uppercase tracking-[0.25em] text-amber-200">
        <span className="inline-flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Mitigation Steps / Tripwires
        </span>
      </div>
      <RenderPreviewWithBlur
        modules={modules}
        slug={report.slug}
        renderModule={(module, index) => (
          <StandardModule
            module={module}
            className={index === 0 ? 'border-amber-700 bg-amber-950/20' : undefined}
            columns="md:grid-cols-2"
          />
        )}
      />
    </ShowcaseArticle>
  )
}
