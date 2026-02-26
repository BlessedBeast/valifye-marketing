import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  if (
    searchParams.get('secret') !==
    process.env.REVALIDATION_SECRET
  ) {
    return new NextResponse('Invalid secret', { status: 401 })
  }

  const slug = searchParams.get('slug')

  if (!slug) {
    return new NextResponse('Missing slug', { status: 400 })
  }

  revalidatePath(`/ideas/${slug}`)

  return NextResponse.json({ revalidated: true, slug })
}