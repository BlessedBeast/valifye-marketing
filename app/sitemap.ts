import { supabase } from "@/lib/supabase"

export const revalidate = 86400

export default async function sitemap() {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://valifye.com"

  const { data: pages } = await supabase
    .from("market_data")
    .select("slug, updated_at")
    .eq("status", "published")

  const ideaPages =
    pages?.map((page) => ({
      url: `${baseUrl}/ideas/${page.slug}`,
      lastModified: page.updated_at || new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })) ?? []

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/ideas`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    ...ideaPages,
  ]
}