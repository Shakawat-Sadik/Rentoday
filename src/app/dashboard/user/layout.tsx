import { redirect } from 'next/navigation'
import { getUserFromCookies } from '@/lib/auth'
import DashboardNav from './dashboard-nav'

// General-user dashboard layout — server-side guard.
// Must be logged in; admins are sent to their own dashboard.
export default async function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUserFromCookies()
  if (!user) redirect('/login')
  if (user.role === 'admin') redirect('/dashboard/admin')

  return (
    <div className="mx-auto w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row">
        <DashboardNav />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  )
}
