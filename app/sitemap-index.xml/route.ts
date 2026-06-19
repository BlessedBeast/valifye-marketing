import { SITE_URL } from '@/lib/seo'

export const revalidate = 3600
export const dynamic = 'force-static'

/**
 * Sitemap INDEX at /sitemap-index.xml.
 *
 * Next.js generateSitemaps() (app/sitemap.ts) only emits the sub-sitemaps at
 * /sitemap/{id}.xml — it never produces an index file — so this route hands
 * crawlers the master index pointing at all twenty-three sections.
 *
 * It cannot live at /sitemap.xml: a route folder named app/sitemap.xml
 * breaks the build alongside app/sitemap.ts (verified:
 * "Cannot find module for page: /sitemap/[__metadata_id__]"), and the
 * legacy static public/sitemap.xml still occupies that path anyway.
 */

const SECTION_IDS = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
] as const

export function GET(): Response {
  const lastmod = new Date().toISOString()

  const entries = SECTION_IDS.map(
    (id) =>
      `  <sitemap>\n    <loc>${SITE_URL}/sitemap/${id}.xml</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`
  ).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>\n`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  })
}
