import { redirect } from 'next/navigation'
import { getUserFromCookies } from '@/lib/auth'
import ManageContent from './manage-content'

export default async function ManagePage() {
  const user = await getUserFromCookies()
  if (!user) redirect('/login')

  return <ManageContent />
}
