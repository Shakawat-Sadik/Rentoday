import { redirect } from 'next/navigation'
import { getUserFromCookies } from '@/lib/auth'

// /dashboard — role-aware entry point.
// Admins land on the admin dashboard; everyone else on their own dashboard.
export default async function DashboardPage() {
  const user = await getUserFromCookies()
  if (!user) redirect('/login')

  if (user.role === 'admin') redirect('/dashboard/admin')
  redirect('/dashboard/user')
}
