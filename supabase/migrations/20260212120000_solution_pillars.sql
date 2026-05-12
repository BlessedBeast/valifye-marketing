-- Solution Pillars: high-intent landing pages for "Irreversible Decisions"
-- Public read via RLS; writes are expected via service role / dashboard.

create table if not exists public.solution_pillars (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  hero_vibe text not null
    check (hero_vibe in ('amber', 'rose', 'emerald')),
  meta_title text not null,
  meta_description text not null,
  aeo_answer text not null,
  risk_factors jsonb not null default '[]'::jsonb,
  evidence_images jsonb not null default '{}'::jsonb,
  cta_text text,
  primary_report_type text not null
    check (
      primary_report_type in (
        'Local Scout',
        'Digital Battlefield',
        'Pivot'
      )
    ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.solution_pillars is
  'Marketing solution pillar pages (irreversible decision intents).';

comment on column public.solution_pillars.risk_factors is
  'JSON array: [{ "title": string, "description": string }, ...]';

comment on column public.solution_pillars.evidence_images is
  'JSON object: { "competitor_url": string?, "valifye_url": string? }';

create index if not exists solution_pillars_slug_idx
  on public.solution_pillars (slug);

alter table public.solution_pillars enable row level security;

-- Anonymous and authenticated clients can read published pillars (all rows for now).
create policy "solution_pillars_select_public"
  on public.solution_pillars
  for select
  to anon, authenticated
  using (true);
