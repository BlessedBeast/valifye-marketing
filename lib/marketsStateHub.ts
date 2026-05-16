/**
 * `region_key` helpers — format `COUNTRY-REGION-CITY` (e.g. USA-TX-AUSTIN, GBR-LND-LONDON)
 * for /markets state hubs (URL segment = region code, 2–3 letters) + breadcrumbs.
 */

const US_STATE_NAMES: Record<string, string> = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  DC: 'District of Columbia',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming'
}

/** ISO 3166-1 alpha-3 → directory section title */
export const COUNTRY_SECTION_LABELS: Record<string, string> = {
  USA: 'United States',
  GBR: 'United Kingdom',
  CAN: 'Canada',
  AUS: 'Australia',
  IND: 'India',
  ARE: 'United Arab Emirates',
  DEU: 'Germany',
  FRA: 'France',
  ESP: 'Spain',
  ITA: 'Italy',
  NLD: 'Netherlands',
  IRL: 'Ireland',
  SGP: 'Singapore',
  JPN: 'Japan',
  MEX: 'Mexico',
  BRA: 'Brazil'
}

/** Preferred sort order for country sections; others sort A–Z after these. */
export const COUNTRY_SECTION_ORDER: string[] = [
  'USA',
  'GBR',
  'CAN',
  'AUS',
  'IND',
  'ARE'
]

/**
 * Subnational hub labels for non-US `COUNTRY-REGION` keys (expand as data grows).
 */
export const REGION_SUBNATIONAL_LABELS: Record<string, string> = {
  'GBR-LND': 'London',
  'GBR-SCT': 'Scotland',
  'GBR-WLS': 'Wales',
  'CAN-ON': 'Ontario',
  'CAN-BC': 'British Columbia',
  'CAN-QC': 'Quebec',
  'CAN-AB': 'Alberta',
  'AUS-NSW': 'New South Wales',
  'AUS-VIC': 'Victoria',
  'AUS-QLD': 'Queensland',
  'IND-MH': 'Maharashtra',
  'IND-KA': 'Karnataka',
  'IND-DL': 'Delhi',
  'ARE-DXB': 'Dubai',
  'ARE-AUH': 'Abu Dhabi'
}

export function countrySectionLabel(iso3: string): string {
  return COUNTRY_SECTION_LABELS[iso3] ?? iso3
}

function formatCityTail(parts: string[]): string {
  const tail = parts.join(' ')
  return tail
    .toLowerCase()
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/** Middle segment of `COUNTRY-REGION-CITY` (hub URL slug), upper-case. */
export function extractGlobalRegionHubCode(regionKey: string): string | null {
  const parts = (regionKey ?? '').split('-').filter(Boolean)
  if (parts.length < 3) return null
  const country = parts[0]?.toUpperCase()
  const region = parts[1]?.toUpperCase()
  if (!country || country.length !== 3 || !region) return null
  if (!/^[A-Z]{2,3}$/.test(region)) return null
  return region
}

export type GlobalHubSummary = {
  countryCode: string
  regionCode: string
  blueprintCount: number
}

/** Aggregate published blueprint counts per (country, region hub). */
export function summarizeGlobalMarketHubs(regionKeys: string[]): GlobalHubSummary[] {
  const counts = new Map<string, { countryCode: string; regionCode: string; n: number }>()
  for (const rk of regionKeys) {
    const region = extractGlobalRegionHubCode(rk)
    if (!region) continue
    const parts = rk.split('-').filter(Boolean)
    const countryCode = parts[0]!.toUpperCase()
    const key = `${countryCode}|${region}`
    const prev = counts.get(key)
    if (prev) prev.n += 1
    else counts.set(key, { countryCode, regionCode: region, n: 1 })
  }
  return [...counts.values()]
    .map(({ countryCode, regionCode, n }) => ({
      countryCode,
      regionCode,
      blueprintCount: n
    }))
    .sort((a, b) => {
      const oa = COUNTRY_SECTION_ORDER.indexOf(a.countryCode)
      const ob = COUNTRY_SECTION_ORDER.indexOf(b.countryCode)
      const sa = oa === -1 ? 999 : oa
      const sb = ob === -1 ? 999 : ob
      if (sa !== sb) return sa - sb
      const ca = countrySectionLabel(a.countryCode).localeCompare(
        countrySectionLabel(b.countryCode)
      )
      if (ca !== 0) return ca
      return a.regionCode.localeCompare(b.regionCode)
    })
}

/** Human title for a hub on cards and H1 (not metro/city). */
export function globalHubDisplayName(
  countryCode: string,
  regionCode: string
): string {
  const upper = regionCode.toUpperCase()
  if (countryCode === 'USA' && upper.length === 2) {
    return US_STATE_NAMES[upper] ?? upper
  }
  return REGION_SUBNATIONAL_LABELS[`${countryCode}-${upper}`] ?? upper
}

export type MarketHubBreadcrumb = {
  hubSlug: string
  hubDisplayName: string
  cityLabel: string
}

/** Breadcrumb + hub link for any `COUNTRY-REGION-CITY` key. */
export function parseRegionKeyForHubBreadcrumb(
  regionKey: string
): MarketHubBreadcrumb | null {
  const parts = regionKey.split('-').filter(Boolean)
  if (parts.length < 3) return null
  const country = parts[0]?.toUpperCase() ?? ''
  const hub = parts[1]?.toUpperCase() ?? ''
  if (country.length !== 3 || !/^[A-Z]{2,3}$/.test(hub)) return null
  const cityLabel = formatCityTail(parts.slice(2))
  return {
    hubSlug: hub.toLowerCase(),
    hubDisplayName: globalHubDisplayName(country, hub),
    cityLabel: cityLabel || hub
  }
}

type RowForHubTitle = { region_key: string; region_label: string | null }

/** Page title / metadata from loaded rows (uses region_label when unambiguous). */
export function deriveHubTitleFromRows(
  rows: RowForHubTitle[],
  hubCodeUpper: string
): string {
  if (rows.length === 0) {
    if (hubCodeUpper.length === 2 && US_STATE_NAMES[hubCodeUpper]) {
      return US_STATE_NAMES[hubCodeUpper]
    }
    return hubCodeUpper
  }
  const parts = rows[0].region_key.split('-').filter(Boolean)
  const country = parts[0]?.toUpperCase() ?? ''
  const hub = parts[1]?.toUpperCase() ?? hubCodeUpper
  if (country === 'USA' && hub.length === 2) {
    return USA_DISPLAY_NAME(hub)
  }
  const mapped = REGION_SUBNATIONAL_LABELS[`${country}-${hub}`]
  if (mapped) return mapped
  const labels = rows
    .map((r) => r.region_label?.trim())
    .filter((x): x is string => Boolean(x))
  const unique = [...new Set(labels)]
  if (unique.length === 1) return unique[0]!
  return mapped ?? globalHubDisplayName(country, hub)
}

function USA_DISPLAY_NAME(code: string): string {
  return US_STATE_NAMES[code] ?? code
}

/** Returns upper-case state code (e.g. TX) or null if not `USA-{ST}-…`. */
export function extractUsaStateCode(regionKey: string): string | null {
  const parts = (regionKey ?? '').split('-').filter(Boolean)
  if (parts.length < 3) return null
  if (parts[0]?.toUpperCase() !== 'USA') return null
  const st = parts[1]?.toUpperCase()
  if (!st || st.length !== 2) return null
  return st
}

export function usaStateDisplayName(stateCodeUpper: string): string {
  return USA_DISPLAY_NAME(stateCodeUpper)
}

/** Title-case metro segment(s) after USA-ST- (e.g. AUSTIN → Austin, RALEIGH_DURHAM handling). */
export function formatMetroLabelFromRegionKey(regionKey: string): string {
  const parts = regionKey.split('-').filter(Boolean)
  if (parts.length >= 3 && parts[0]?.toUpperCase() === 'USA') {
    const tail = parts.slice(2).join(' ')
    return tail
      .toLowerCase()
      .split(/[\s_]+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  }
  return regionKey.replace(/-/g, ' ')
}

/** Tailwind: long snake_case labels stay inside dossier card bounds */
export const dossierTextWrapClass =
  'break-words whitespace-normal [overflow-wrap:anywhere]' as const

/** Underscore / snake_case → spaced title case (sector, business_model, sluggy meta_title). */
export function formatSnakeCaseLabel(value: string): string {
  const t = (value ?? '').replace(/_/g, ' ').replace(/\s+/g, ' ').trim()
  if (!t) return ''
  return t.replace(/\b\w/g, (c) => c.toUpperCase())
}

export function formatSectorLabel(sector: string): string {
  return formatSnakeCaseLabel(sector)
}

export function formatBusinessModelLabel(model: string): string {
  return formatSnakeCaseLabel(model)
}

/** Display-safe dossier / card headline from stored meta_title. */
export function formatDossierTitle(title: string): string {
  return formatSnakeCaseLabel(title)
}

export type UsaRegionCrumb = {
  stateCode: string
  stateSlug: string
  stateName: string
  cityLabel: string
}

export function parseUsaRegionKeyForBreadcrumb(regionKey: string): UsaRegionCrumb | null {
  const parts = regionKey.split('-').filter(Boolean)
  if (parts.length < 3 || parts[0]?.toUpperCase() !== 'USA') return null
  const stateCode = parts[1]?.toUpperCase()
  if (!stateCode || stateCode.length !== 2) return null
  const cityParts = parts.slice(2)
  const cityLabel = formatCityTail(cityParts)
  return {
    stateCode,
    stateSlug: stateCode.toLowerCase(),
    stateName: usaStateDisplayName(stateCode),
    cityLabel: cityLabel || stateCode
  }
}
