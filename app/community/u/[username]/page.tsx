import { notFound } from 'next/navigation'

import { UserProfileView } from '@/components/community/UserProfileView'
import {
  getPostsByAuthorId,
  getUserKarmaEvents,
  getUserProfileData,
} from '@/lib/community/queries'

export const dynamic = 'force-dynamic'

type UserProfilePageProps = {
  params: Promise<{ username: string }>
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { username } = await params
  const profile = await getUserProfileData(username)

  if (!profile) {
    notFound()
  }

  const [posts, karmaEvents] = await Promise.all([
    getPostsByAuthorId(profile.id),
    getUserKarmaEvents(profile.id),
  ])

  return (
    <UserProfileView profile={profile} posts={posts} karmaEvents={karmaEvents} />
  )
}
