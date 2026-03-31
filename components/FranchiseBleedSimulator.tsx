'use client'

import { ShieldAlert, Percent, Scissors } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type FranchiseBleedSimulatorProps = {
  currencySymbol?: string
}

export function FranchiseBleedSimulator({ currencySymbol = '$' }: FranchiseBleedSimulatorProps) {
  return (
    <Card className="border-red-900/60 bg-zinc-950 text-zinc-100 shadow-[0_0_40px_rgba(248,113,113,0.15)]">
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-red-900/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-red-500/60 bg-red-900/40">
            <ShieldAlert className="h-4 w-4 text-red-300" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold tracking-[0.2em] text-red-200">
              FRANCHISE BLEED SCAN
            </CardTitle>
            <p className="mt-1 text-[11px] font-mono uppercase tracking-[0.18em] text-red-300/80">
              Check royalty and overhead drag
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        <p className="text-sm leading-relaxed text-zinc-300">
          Most franchise decks hide unit-level bleed behind glossy averages. Before signing, you need a
          harsh view of royalties, ad funds, mandated vendors, and local rent pressure.
        </p>
        <div className="grid gap-4 text-xs text-zinc-200 sm:grid-cols-3">
          <div className="flex items-start gap-2">
            <Scissors className="mt-0.5 h-3.5 w-3.5 text-red-300" />
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-red-200">
                Royalty Drag
              </p>
              <p className="mt-1 text-[11px] text-zinc-300/90">
                Is the percentage skim still survivable when your local wages and rents spike 20%?
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Percent className="mt-0.5 h-3.5 w-3.5 text-red-300" />
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-red-200">
                Ad + Vendor Fees
              </p>
              <p className="mt-1 text-[11px] text-zinc-300/90">
                National ad funds and locked-in suppliers compress your true local margin window.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 text-red-300" />
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-red-200">
                Default Scenarios
              </p>
              <p className="mt-1 text-[11px] text-zinc-300/90">
                Stress-test time to default: 10–20% same-store decline, 2–3% rate hikes, and wage creep.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-2 rounded-lg border border-red-900/70 bg-red-950/40 px-4 py-3 text-[11px] text-red-200">
          Treat franchise FDD numbers as a marketing document. This simulator pairs them with your street-level
          costs before you lock in a decade-long contract.
        </div>
        <Button
          asChild
          className="mt-4 w-full border border-red-500/60 bg-red-500 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-950 hover:bg-red-400 sm:w-auto"
        >
          <Link href="/audit">Run Full Franchise Audit</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

