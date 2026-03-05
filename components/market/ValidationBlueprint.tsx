'use client'

import { AlertCircle, Target, TrendingDown, TrendingUp, Zap, FileWarning, DollarSign, Activity } from 'lucide-react'

// Define the Idea type locally if you don't have a shared types file
// Adjust this to match whatever your getIdeaBySlug returns
type Idea = {
  slug: string;
  niche: string;
  city: string;
  region: string | null;
  local_friction: any; // Using 'any' to handle raw Supabase returns before parsing
  gtm_playbook: any;
  failure_modes: string | null;
  global_anchor_json?: any; // The new forensic economics field
  unit_economics?: any; // Legacy fallback
}

// 🛡️ Validator's Bulletproof Parsers
const safeArrayParse = (data: any): string[] => {
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    try { 
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { 
      return []; 
    }
  }
  return [];
}

const safeJsonParse = (data: any): Record<string, any> => {
    if (data && typeof data === 'object' && !Array.isArray(data)) return data;
    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            return (parsed && typeof parsed === 'object') ? parsed : {};
        } catch(e) {
            return {};
        }
    }
    return {};
}

export function ValidationBlueprintDashboard({ idea }: { idea: Idea }) {
  // 1. Safely parse all incoming JSON to prevent React crashes
  const frictionList = safeArrayParse(idea.local_friction);
  const gtmSteps = safeArrayParse(idea.gtm_playbook);
  
  // 2. Prioritize the new 'global_anchor_json' over the legacy 'unit_economics'
  const economics = safeJsonParse(idea.global_anchor_json || idea.unit_economics);
  const hasEconomics = Object.keys(economics).length > 0;

  return (
    <div className="space-y-8 font-mono">
      {/* SECTION 1: Local Friction Map (Regulatory & Infra) */}
      {frictionList.length > 0 && (
        <section className="border border-border bg-card shadow-[4px_4px_0_0_hsl(var(--primary))]">
          <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-5 py-3">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">Local Friction Map</h2>
          </div>
          <div className="p-5">
            <ul className="space-y-4">
              {frictionList.map((item, idx) => (
                <li key={idx} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                  <span className="font-bold text-amber-500 mt-0.5">[{idx + 1}]</span>
                  <span>
                     {/* Clean up markdown bolding from the Python script if necessary */}
                     {item.replace(/\*\*/g, '')}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* SECTION 2: Forensic Unit Economics (Global Anchor JSON) */}
      {hasEconomics && (
          <section className="border border-border bg-card shadow-[4px_4px_0_0_hsl(var(--primary))]">
            <div className="flex items-center justify-between border-b border-border bg-muted/50 px-5 py-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">Local Unit Economics</h2>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border border-border px-2 py-0.5">
                  Est. 2026 Model
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
              <div className="bg-card p-4 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] uppercase text-muted-foreground mb-1">Unit Price</span>
                <span className="text-lg font-black">{economics.unit_price ? economics.unit_price.toLocaleString() : 'N/A'}</span>
              </div>
              <div className="bg-card p-4 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] uppercase text-muted-foreground mb-1">Mo. Volume</span>
                <span className="text-lg font-black">{economics.monthly_volume ? economics.monthly_volume.toLocaleString() : 'N/A'}</span>
              </div>
              <div className="bg-card p-4 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] uppercase text-muted-foreground mb-1">Gross Margin</span>
                <span className="text-lg font-black text-green-500">{economics.gross_margin_pct ? `${economics.gross_margin_pct}%` : 'N/A'}</span>
              </div>
              <div className="bg-card p-4 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] uppercase text-muted-foreground mb-1">Fixed Mo. Costs</span>
                <span className="text-lg font-black text-red-500">{economics.fixed_costs_monthly ? economics.fixed_costs_monthly.toLocaleString() : 'N/A'}</span>
              </div>
            </div>
            
            {economics.notes && (
                <div className="p-4 bg-muted/20 border-t border-border text-xs text-muted-foreground leading-relaxed border-l-2 border-l-primary">
                    <span className="font-bold text-foreground mr-2">LOGIC:</span>
                    {economics.notes}
                </div>
            )}
          </section>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* SECTION 3: 0-to-1 GTM Playbook */}
        {gtmSteps.length > 0 && (
          <section className="border border-border bg-card shadow-[4px_4px_0_0_hsl(var(--primary))]">
            <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-5 py-3">
              <Target className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">0-to-1 GTM Playbook</h2>
            </div>
            <div className="p-5">
              <ul className="space-y-5 border-l border-border ml-2 pl-4">
                {gtmSteps.map((step, idx) => (
                  <li key={idx} className="relative text-sm text-muted-foreground leading-relaxed">
                    <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-primary" />
                    {step.replace(/\*\*/g, '')}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* SECTION 4: Brutal Pre-Mortem (Failure Modes) */}
        {idea.failure_modes && (
          <section className="border border-red-900/30 bg-red-950/5 shadow-[4px_4px_0_0_#7f1d1d] flex flex-col">
            <div className="flex items-center gap-2 border-b border-red-900/30 bg-red-900/10 px-5 py-3">
              <FileWarning className="h-4 w-4 text-red-500" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-red-500">Brutal Pre-Mortem</h2>
            </div>
            <div className="p-5 flex-1">
              <p className="text-sm leading-relaxed text-red-200/80">
                {idea.failure_modes}
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}