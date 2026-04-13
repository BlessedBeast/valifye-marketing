import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  // Hardcode the production URL as the primary fallback
  const baseUrl = "https://valifye.com"

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // If you have an admin or private folder, disallow it here:
        // disallow: ["/admin", "/api/private"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}