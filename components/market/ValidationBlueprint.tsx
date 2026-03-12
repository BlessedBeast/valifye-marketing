'use client'

import { AlertCircle, Target, FileWarning, DollarSign } from 'lucide-react'

// 🏗️ Unified Idea Type
type Idea = {
  slug: string;
  niche: string;
  city: string;
  region?: string | null | undefined;
  local_friction: any;
  gtm_playbook: any;
  failure_modes?: string | null | undefined;
  unit_economics?: any; 
}

// 🛡️ Validator's Bulletproof Parsers — only allow string elements to avoid .replace / .map crashes
const safeArrayParse = (data: any): string[] => {
  let arr: unknown[] = [];
  if (Array.isArray(data)) arr = data;
  else if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      arr = Array.isArray(parsed) ? parsed : [];
    } catch {
      arr = [];
    }
  }
  return arr.filter((x): x is string => typeof x === 'string');
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
  // 1. Parse incoming data streams
  const frictionList = safeArrayParse(idea.local_friction);
  const gtmSteps = safeArrayParse(idea.gtm_playbook);
  const economics = safeJsonParse(idea.unit_economics);
  
  const hasEconomics = Object.keys(economics).length > 0;

  return (
    <div className="space-y-8 font-mono">
      
      {/* SECTION 1: Local Friction Map */}
      {frictionList.length > 0 && (
        <section className="border border-border bg-card shadow-[4px_4px_0_0_hsl(var(--primary))]">
          <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-5 py-3">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">Local Friction Map</h2>
          </div>
          <div className="p-5">
            <ul className="space-y-4">
              {frictionList.map((item, idx) => {
                if (typeof item !== 'string') return null;
                return (
                  <li key={idx} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                    <span className="font-bold text-amber-500 mt-0.5">[{idx + 1}]</span>
                    <span>{item.replace(/\*\*/g, '')}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* SECTION 2: Forensic Unit Economics */}
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
                <span className="text-lg font-black text-foreground">
                  {typeof economics.unit_price === 'number' && Number.isFinite(economics.unit_price)
                    ? `$${economics.unit_price.toLocaleString()}`
                    : 'Var.'}
                </span>
              </div>

              <div className="bg-card p-4 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] uppercase text-muted-foreground mb-1">Gross Margin</span>
                <span className={`text-lg font-black ${economics.margin_pct != null && economics.margin_pct !== '' ? 'text-green-500' : 'text-red-500'}`}>
                  {economics.margin_pct != null && economics.margin_pct !== '' ? `${String(economics.margin_pct)}%` : 'N/A'}
                </span>
              </div>

              <div className="bg-card p-4 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] uppercase text-muted-foreground mb-1">Rent Impact</span>
                <span className={`text-lg font-black ${
                  economics.rent_impact === 'High' ? 'text-red-500' :
                  economics.rent_impact === 'Medium' ? 'text-amber-500' : 'text-foreground'
                }`}>
                  {typeof economics.rent_impact === 'string' ? economics.rent_impact : 'N/A'}
                </span>
              </div>

              <div className="bg-card p-4 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] uppercase text-muted-foreground mb-1">Fixed Mo. Costs</span>
                <span className="text-lg font-black text-red-500">
                  {typeof economics.fixed_costs_monthly === 'number' && Number.isFinite(economics.fixed_costs_monthly)
                    ? `$${economics.fixed_costs_monthly.toLocaleString()}`
                    : 'Var.'}
                </span>
              </div>
            </div>
            
            {economics.logic != null && economics.logic !== '' && (
                <div className="p-4 bg-muted/20 border-t border-border text-xs text-muted-foreground leading-relaxed border-l-2 border-l-primary">
                    <span className="font-bold text-foreground mr-2">LOGIC:</span>
                    {typeof economics.logic === 'string' ? economics.logic : String(economics.logic)}
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
                {gtmSteps.map((step, idx) => {
                  if (typeof step !== 'string') return null;
                  return (
                    <li key={idx} className="relative text-sm text-muted-foreground leading-relaxed">
                      <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-primary" />
                      {step.replace(/\*\*/g, '')}
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        )}

        {/* SECTION 4: Brutal Pre-Mortem */}
        {idea.failure_modes != null && idea.failure_modes !== '' && (
          <section className="border border-red-900/30 bg-red-950/5 shadow-[4px_4px_0_0_#7f1d1d] flex flex-col">
            <div className="flex items-center gap-2 border-b border-red-900/30 bg-red-900/10 px-5 py-3">
              <FileWarning className="h-4 w-4 text-red-500" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-red-500">Brutal Pre-Mortem</h2>
            </div>
            <div className="p-5 flex-1">
              <p className="text-sm leading-relaxed text-red-200/80">
                {typeof idea.failure_modes === 'string' ? idea.failure_modes : String(idea.failure_modes ?? '')}
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}