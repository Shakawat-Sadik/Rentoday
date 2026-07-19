import { redirect } from 'next/navigation'

// The general-user dashboard opens on "My Listings" by default.
export default function UserDashboardPage() {
  redirect('/dashboard/user/listings')
}
