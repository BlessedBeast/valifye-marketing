import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'

export const revalidate = 86400

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function IdeaPage({ params }: PageProps) {
  const { slug } = await params

  const { data, error } = await supabase
    .from('market_data')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !data) notFound()

  const heatColors: Record<string, string> = {
    Hot: '#ef4444',
    Warm: '#f97316',
    Cool: '#3b82f6'
  }

  const heatColor = heatColors[data.market_heat] || '#6b7280'

  return (
    <main
      style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: '40px 20px',
        fontFamily: 'Inter, sans-serif'
      }}
    >

      {/* HEADER */}
      <div style={{ marginBottom: '40px' }}>
        <span
          style={{
            background: heatColor,
            color: 'white',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {data.market_heat || 'Market'}
        </span>

        <h1
          style={{
            fontSize: '36px',
            fontWeight: 'bold',
            marginTop: '16px',
            lineHeight: 1.2
          }}
        >
          {data.niche} Business in {data.city}: Market Analysis & Validation
        </h1>

        <p
          style={{
            color: '#6b7280',
            fontSize: '18px',
            marginTop: '12px'
          }}
        >
          {data.market_narrative}
        </p>
      </div>

      {/* STATS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '40px'
        }}
      >
        <StatCard value={data.estimated_tam} label="Estimated TAM" />
        <StatCard value={data.local_competitors} label="Local Competitors" />
        <StatCard value={data.confidence} label="Data Confidence" />
      </div>

      {/* MARKET GAPS */}
      {data.top_complaints?.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '16px'
            }}
          >
            Real Customer Complaints in {data.city}
          </h2>

          {data.top_complaints.map((complaint: string, i: number) => (
            <div
              key={i}
              style={{
                background: '#fff7ed',
                border: '1px solid #fed7aa',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '12px'
              }}
            >
              {complaint}
            </div>
          ))}
        </div>
      )}

      {/* RELATED LINKS */}
      {data.related_niches?.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h3
            style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '12px'
            }}
          >
            Related Markets in {data.city}
          </h3>

          <ul>
            {data.related_niches.map((niche: string) => {
              const relatedSlug =
                niche.toLowerCase().replace(/[^a-z0-9]+/g, '-') +
                '-in-' +
                data.city.toLowerCase().replace(/[^a-z0-9]+/g, '-')

              return (
                <li key={niche}>
                  <a href={`/ideas/${relatedSlug}`}>
                    {niche} in {data.city}
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* CTA */}
      <div
        style={{
          background: '#0f0f14',
          color: 'white',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center'
        }}
      >
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '12px'
          }}
        >
          Should You Actually Build This?
        </h2>

        <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
          Get Valifye’s BUILD / PIVOT / KILL verdict plus a 90-day roadmap.
        </p>

        <a
          href="/app"
          style={{
            background: '#f97316',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: 'bold',
            textDecoration: 'none'
          }}
        >
          Validate This Idea
        </a>
      </div>
    </main>
  )
}

/* -------------------------- */
/* Metadata (Next.js 15 safe) */
/* -------------------------- */

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const { data } = await supabase
    .from('market_data')
    .select('niche, city, market_narrative')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!data) return {}

  return {
    title: `${data.niche} Business in ${data.city} — Market Validation`,
    description: `Is ${data.niche} in ${data.city} worth starting? See competitors, customer complaints, and Valifye’s verdict.`
  }
}

/* -------------------------- */
/* Small Component */
/* -------------------------- */

function StatCard({
  value,
  label
}: {
  value: any
  label: string
}) {
  return (
    <div
      style={{
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center'
      }}
    >
      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
        {value || '—'}
      </div>

      <div
        style={{
          fontSize: '14px',
          color: '#6b7280',
          marginTop: '4px'
        }}
      >
        {label}
      </div>
    </div>
  )
}