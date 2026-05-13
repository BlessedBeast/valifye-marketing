/**
 * USA metro `region_key` helpers (e.g. USA-TX-AUSTIN) for /markets state hubs + breadcrumbs.
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
  return US_STATE_NAMES[stateCodeUpper] ?? stateCodeUpper
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

export function formatSectorLabel(sector: string): string {
  return (sector ?? '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
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
  const cityLabel = cityParts
    .join(' ')
    .toLowerCase()
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
  return {
    stateCode,
    stateSlug: stateCode.toLowerCase(),
    stateName: usaStateDisplayName(stateCode),
    cityLabel: cityLabel || stateCode
  }
}
