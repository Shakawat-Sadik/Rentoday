import { redirect } from 'next/navigation'
import { getUserFromCookies } from '@/lib/auth'
import AddListingForm from './add-listing-form'

// Server-side auth guard — redirect to /login before the page renders if the
// user is not authenticated. This cannot be bypassed by disabling JavaScript.
export default async function AddListingPage() {
  const user = await getUserFromCookies()
  if (!user) redirect('/login')

  return <AddListingForm />
}
