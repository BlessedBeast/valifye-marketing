import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // If you have an admin or private folder, disallow it here:
        // disallow: ["/admin", "/api/private"],
      },
    ],
    sitemap: 'https://valifye.com/sitemap-index.xml',
  }
}