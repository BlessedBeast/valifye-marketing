'use server'

import { getReportsBySlugs } from '@/lib/reportData'

export async function fetchReportsBySlugs(slugs: string[]) {
  return getReportsBySlugs(slugs)
}
