import { redirect } from 'next/navigation'
import { getUserFromCookies } from '@/lib/auth'

// Managing listings now lives inside the dashboard. Keep this route working for
// old links by redirecting to the role-aware dashboard entry point.
export default async function ManagePage() {
  const user = await getUserFromCookies()
  if (!user) redirect('/login')
  redirect('/dashboard')
}
