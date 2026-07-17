import { redirect } from 'next/navigation'
import { getUserFromCookies } from '@/lib/auth'
import ProfileForm from './profile-form'

export default async function ProfilePage() {
  const user = await getUserFromCookies()
  if (!user) redirect('/login')

  return <ProfileForm />
}
