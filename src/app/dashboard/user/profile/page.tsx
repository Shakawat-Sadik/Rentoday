import ProfileForm from '@/app/profile/profile-form'

// Dashboard → My Profile. Reuses the existing profile form (view/edit
// name, phone, gender, date of birth). Access guarded by the dashboard layout.
export default function DashboardProfilePage() {
  return <ProfileForm />
}
