import { redirect } from 'next/navigation'
import { getUserFromCookies } from '@/lib/auth'
import RequestsContent from './requests-content'

export default async function RequestsPage() {
  const user = await getUserFromCookies()
  if (!user) redirect('/login')

  return <RequestsContent />
}
