import { NotFoundMagnetic } from '@/components/motion/not-found/magnetic'

export const metadata = {
  title: '404 — Page Not Found | RenToday',
}

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center min-h-[60vh] px-4">
      <NotFoundMagnetic
        title="Page not found"
        description="The page you're looking for doesn't exist or has been moved."
        homeHref="/"
        homeLabel="Back to Home"
        browseHref="/listings"
        browseLabel="Browse Listings"
      />
    </div>
  )
}
