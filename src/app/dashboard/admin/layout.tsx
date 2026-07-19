import { redirect } from 'next/navigation'
import { getUserFromCookies } from '@/lib/auth'
import DashboardNav from './dashboard-nav'

// Admin dashboard layout — server-side guard.
// Only admins may enter; a general user is bounced to /dashboard, which then
// redirects them to their own dashboard.
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUserFromCookies()
  if (!user) redirect('/login')
  if (user.role !== 'admin') redirect('/dashboard')

  return (
    <div className="mx-auto w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row">
        <DashboardNav />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  )
}
