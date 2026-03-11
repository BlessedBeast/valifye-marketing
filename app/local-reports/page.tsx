import { createClient } from '@/utils/supabase/server'
import { CityDirectoryClient, LocalCityHubRow } from './CityDirectoryClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function LocalReportsDirectoryPage() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('local_city_hubs')
    .select('city_name, region, report_count, top_reports')
    .order('city_name', { ascending: true })

  if (error) {
    console.error('Supabase Fetch Error (local_city_hubs):', error)
  }

  const hubs: LocalCityHubRow[] = Array.isArray(data) ? (data as LocalCityHubRow[]) : []

  return <CityDirectoryClient initialHubs={hubs} />
}
