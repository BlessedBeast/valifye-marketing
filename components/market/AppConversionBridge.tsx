import Link from 'next/link'
import { ArrowRight, Lock } from 'lucide-react'

interface AppConversionBridgeProps {
  niche: string
  city: string
}

export function AppConversionBridge({ niche, city }: AppConversionBridgeProps) {
  const refSlug = `pseo_${city.toLowerCase().replace(/\s+/g, '_')}`
  const appUrl = `https://app.valifye.com/?ref=${refSlug}`

  return (
    <section className="border border-border bg-card p-8 font-mono shadow-[4px_4px_0_0_hsl(var(--primary))]">
      <div className="space-y-4">
        <h2 className="text-lg font-bold uppercase tracking-widest text-foreground">
          Don&apos;t Build in the Dark.
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          This blueprint is a static sample—a snapshot of {niche} in {city}. It does not account for
          your runway, team size, or capital constraints. To run your specific scenario through our
          live engine and get a verdict tuned to your reality, you need to use the app. No fluff.
          No generic advice. Input your numbers; get a cold, database-backed recommendation.
        </p>
        <div className="pt-2">
          <a
            href={appUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-2 border-foreground bg-primary px-4 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] transition-all hover:bg-primary/90 hover:shadow-[2px_2px_0_0_hsl(var(--foreground))]"
          >
            <Lock className="h-4 w-4" />
            <span>Enter validation engine</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/80">
          System portal · Ref: {refSlug}
        </p>
      </div>
    </section>
  )
}
