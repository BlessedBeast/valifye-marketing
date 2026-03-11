import { createClient } from '@/utils/supabase/server'
import { CityDirectoryClient, LocalCityHubRow } from './CityDirectoryClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function LocalReportsDirectoryPage() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('local_city_hubs')
    .select('id, city_name, region, report_count, top_reports')
    .order('city_name', { ascending: true })

  if (error) {
    console.error('Supabase Fetch Error (local_city_hubs):', error)
  }

  const rawRows = Array.isArray(data) ? data : []
  const hubs: LocalCityHubRow[] = rawRows.map((row: any) => {
    let topReports = row.top_reports
    if (typeof topReports === 'string') {
      try {
        topReports = JSON.parse(topReports)
      } catch (e) {
        console.error('Failed to parse top_reports JSON in directory page for city:', row.city_name, e)
        topReports = []
      }
    }

    return {
      id: String(row.id),
      city_name: row.city_name,
      region: row.region,
      report_count: row.report_count,
      top_reports: topReports,
    } as LocalCityHubRow
  })
  console.log('Hubs fetched:', hubs?.length)

  return <CityDirectoryClient initialHubs={hubs} />
}
