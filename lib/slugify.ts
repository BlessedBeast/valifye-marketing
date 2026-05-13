export function slugifyPart(value: string): string {
  const s = (value ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
  return s || 'unknown'
}

export function buildMarketPath(region: string, sector: string, model: string): string {
  return `/markets/${slugifyPart(region)}/${slugifyPart(sector)}/${slugifyPart(model)}`
}
