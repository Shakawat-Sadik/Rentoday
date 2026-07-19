import { redirect } from 'next/navigation'
import { getUserFromCookies } from '@/lib/auth'
import { Building2 } from 'lucide-react'

// General-user dashboard — full implementation lands in Build Order step 17
// (My Listings / My Booking Requests / My Profile). This guarded placeholder
// exists now so /dashboard's role redirect has a valid destination.
// TODO: step 17 — build out the general-user dashboard pages here.
export default async function UserDashboardPage() {
  const user = await getUserFromCookies()
  if (!user) redirect('/login')
  // Admins have their own dashboard
  if (user.role === 'admin') redirect('/dashboard/admin')

  return (
    <main className="min-h-[60vh] bg-background">
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <Building2 className="mx-auto mb-4 h-10 w-10 text-primary" />
        <h1 className="mb-2 text-2xl font-bold text-foreground">Your Dashboard</h1>
        <p className="text-muted-foreground">
          Your personal dashboard is coming soon. In the meantime, you can manage your
          listings and booking requests from the navigation menu.
        </p>
      </div>
    </main>
  )
}
