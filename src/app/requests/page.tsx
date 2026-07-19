import { redirect } from 'next/navigation'
import { getUserFromCookies } from '@/lib/auth'

// Booking requests now live inside the dashboard (Incoming / Outgoing).
// Keep this route working for old links by redirecting to the user's outgoing
// requests; admins are bounced to their own dashboard.
export default async function RequestsPage() {
  const user = await getUserFromCookies()
  if (!user) redirect('/login')
  if (user.role === 'admin') redirect('/dashboard/admin')
  redirect('/dashboard/user/outgoing')
}
