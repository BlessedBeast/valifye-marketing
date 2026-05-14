import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { LegacyLayout } from '@/components/solutions/LegacyLayout'
import { ModernLayout } from '@/components/solutions/ModernLayout'
import { getSolutionBySlug } from '@/lib/solutionData'

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0

const SITE_URL = 'https://valifye.com'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const solution = await getSolutionBySlug(slug)

  if (!solution) {
    return {
      title: 'Solutions | Valifye',
      description: 'Valifye solution pillars for high-stakes decisions.'
    }
  }

  const canonical = `${SITE_URL}/solutions/${solution.slug}`

  return {
    title: solution.metaTitle,
    description: solution.metaDescription,
    openGraph: {
      title: solution.metaTitle,
      description: solution.metaDescription,
      type: 'article',
      url: canonical
    },
    twitter: {
      card: 'summary_large_image',
      title: solution.metaTitle,
      description: solution.metaDescription
    },
    alternates: {
      canonical
    }
  }
}

export default async function SolutionPillarPage({ params }: Props) {
  const { slug } = await params
  const data = await getSolutionBySlug(slug)
  if (!data) notFound()

  if (data.layoutType === 'legacy') {
    return <LegacyLayout data={data} />
  }

  return <ModernLayout data={data} />
}
