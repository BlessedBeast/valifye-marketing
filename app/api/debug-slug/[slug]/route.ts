import { NextResponse } from 'next/server'

import { supabase } from '@/lib/supabase'

/**
 * Temporary: inspect raw `solution_pillars` rows before `normalizeSolutionRow`.
 * Delete this route when finished debugging.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug: rawSlug } = await context.params
  const slug = decodeURIComponent(rawSlug ?? '').trim()

  const { data, error } = await supabase
    .from('solution_pillars')
    .select('*')
    .eq('slug', slug)
    .single()

  return NextResponse.json({
    slug,
    data: data ?? null,
    error
  })
}
