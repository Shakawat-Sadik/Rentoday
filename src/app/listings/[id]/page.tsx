'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  MapPin, BedDouble, Star, Phone, CalendarDays,
  ChevronLeft, Home, CheckCircle2,
} from 'lucide-react'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/motion/tabs'
import {
  Carousel, CarouselContent, CarouselItem,
  CarouselPrevious, CarouselNext,
} from '@/components/ui/carousel'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { WheelPicker, type WheelPickerOption } from '@/components/motion/wheel-picker'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/motion/button/base'
import { Button as NavButton } from '@/components/ui/button'
import { StatefulButton, type ButtonState } from '@/components/motion/button/stateful'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { IListing, IReview } from '@/lib/interfaces-types'

// ── Date options for the wheel-picker: next 60 days starting tomorrow ─────────

function buildDateOptions(): WheelPickerOption[] {
  const today = new Date()
  return Array.from({ length: 60 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() + i + 1)
    return {
      label: d.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' }),
      value: d.toISOString().split('T')[0],
    }
  })
}

const DATE_OPTIONS = buildDateOptions()

// ── Loading skeleton ──────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <Skeleton className="mb-6 h-5 w-24" />
      <Skeleton className="mb-8 h-80 w-full rounded-xl" />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-full" />
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  )
}

// ── Small review card ─────────────────────────────────────────────────────────

function ReviewItem({ review }: { review: IReview }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium text-foreground">{review.userName as string}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          {Number(review.rating).toFixed(1)}
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{review.comment as string}</p>
    </div>
  )
}

// ── Compact related listing card ──────────────────────────────────────────────

function RelatedCard({ listing }: { listing: IListing }) {
  const image = listing.images?.[0] || `https://picsum.photos/seed/${listing._id}/800/600`
  return (
    <Card className="group flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative h-36 w-full overflow-hidden bg-muted">
        <Image
          src={image}
          alt={listing.title as string}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 25vw"
        />
      </div>
      <CardContent className="flex flex-1 flex-col gap-1 pt-3">
        <p className="line-clamp-1 font-semibold text-foreground">{listing.title as string}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {listing.location as string}
        </div>
        <p className="mt-auto pt-1 font-semibold text-primary">
          ৳{Number(listing.rentPerMonth).toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/mo</span>
        </p>
      </CardContent>
      <CardFooter className="pt-0">
        <Link
          href={`/listings/${listing._id}`}
          className="w-full text-center text-xs font-medium text-primary hover:underline"
        >
          View Details →
        </Link>
      </CardFooter>
    </Card>
  )
}

// ── Booking dialog ────────────────────────────────────────────────────────────

interface BookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listingId: string
  listingTitle: string
  userName: string
}

function BookingDialog({ open, onOpenChange, listingId, listingTitle, userName }: BookingDialogProps) {
  const [pickedDate, setPickedDate] = useState(DATE_OPTIONS[0] ? String((DATE_OPTIONS[0] as { value: string }).value || DATE_OPTIONS[0]) : '')
  const [message,    setMessage]    = useState('')
  const [btnState,   setBtnState]   = useState<ButtonState>('idle')
  const [error,      setError]      = useState('')

  async function handleSubmit() {
    setError('')
    setBtnState('loading')
    try {
      const res = await fetch(`/api/listings/${listingId}/booking-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposedDate: pickedDate, message, requesterName: userName }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to submit.')
        setBtnState('error')
        setTimeout(() => setBtnState('idle'), 2000)
      } else {
        setBtnState('success')
        setTimeout(() => {
          onOpenChange(false)
          setBtnState('idle')
          setMessage('')
        }, 1500)
      }
    } catch {
      setError('Network error. Please try again.')
      setBtnState('error')
      setTimeout(() => setBtnState('idle'), 2000)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Propose a visit date</DialogTitle>
          <DialogDescription>
            Pick a date to visit <span className="font-medium text-foreground">{listingTitle}</span> and add an optional note for the owner.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Date wheel */}
          <div>
            <Label className="mb-2 block text-xs text-muted-foreground">Preferred visit date</Label>
            <WheelPicker
              options={DATE_OPTIONS}
              defaultValue={DATE_OPTIONS[0] ? String((DATE_OPTIONS[0] as { value: string }).value || DATE_OPTIONS[0]) : ''}
              onValueChange={setPickedDate}
              visibleCount={5}
              itemHeight={36}
              aria-label="Select visit date"
              className="w-full"
            />
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="booking-msg" className="mb-2 block text-xs text-muted-foreground">
              Message (optional)
            </Label>
            <Textarea
              id="booking-msg"
              placeholder="e.g. Available on weekends only…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <StatefulButton
            state={btnState}
            onClick={handleSubmit}
            loadingText="Submitting…"
            successText="Request sent!"
            errorText="Try again"
            size="md"
            className="w-full sm:w-auto"
          >
            Send request
          </StatefulButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

interface CurrentUser {
  name: string
  email: string
  role: string
}

export default function ListingDetailPage() {
  const { id }  = useParams<{ id: string }>()
  const router  = useRouter()

  const [listing,  setListing]  = useState<IListing | null>(null)
  const [reviews,  setReviews]  = useState<IReview[]>([])
  const [related,  setRelated]  = useState<IListing[]>([])
  const [user,     setUser]     = useState<CurrentUser | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)

    Promise.all([
      fetch(`/api/listings/${id}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/listings/${id}/reviews`).then((r) => r.json()),
      fetch('/api/users/me').then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([listingData, reviewsData, meData]) => {
        if (!listingData?.listing) { setNotFound(true); return }
        setListing(listingData.listing)
        setReviews(reviewsData?.reviews || [])
        setUser(meData?.user || null)

        // Related: same location, exclude current
        fetch(`/api/listings?location=${encodeURIComponent(String(listingData.listing.location))}&page=1`)
          .then((r) => r.json())
          .then((data) => {
            setRelated(
              (data.listings || [])
                .filter((l: IListing) => String(l._id) !== id)
                .slice(0, 4),
            )
          })
          .catch(() => {})
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <PageSkeleton />

  if (notFound || !listing) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-lg font-semibold text-foreground">Listing not found</p>
        <Button variant="outline" onClick={() => router.push('/listings')}>
          Back to listings
        </Button>
      </main>
    )
  }

  // ── Derived data ──────────────────────────────────────────────────────────

  const images = (listing.images as string[]).length > 0
    ? (listing.images as string[])
    : [`https://picsum.photos/seed/${listing._id}/800/600`]

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length
    : Number(listing.rating)

  // Count of each star level for the progress bars (1–5)
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(Number(r.rating)) === star).length,
  }))

  const amenities = listing.amenities as string[]

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">

        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="flex items-center gap-1 hover:text-foreground">
            <Home className="h-3.5 w-3.5" /> Home
          </Link>
          <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
          <Link href="/listings" className="hover:text-foreground">Listings</Link>
          <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
          <span className="line-clamp-1 text-foreground">{listing.title as string}</span>
        </nav>

        {/* ── Image Carousel ───────────────────────────────────────────────── */}
        <div className="mb-8">
          <Carousel opts={{ loop: images.length > 1 }} className="w-full">
            <CarouselContent>
              {images.map((src, idx) => (
                <CarouselItem key={idx}>
                  <div className="relative h-72 w-full overflow-hidden rounded-xl bg-muted sm:h-96">
                    <Image
                      src={src}
                      alt={`${String(listing.title)} — image ${idx + 1}`}
                      fill
                      priority={idx === 0}
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 80vw"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {images.length > 1 && (
              <>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </>
            )}
          </Carousel>

          {/* Dot indicators */}
          {images.length > 1 && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {images.length} photos
            </p>
          )}
        </div>

        {/* ── Two-column layout ────────────────────────────────────────────── */}
        <div className="grid gap-8 lg:grid-cols-3">

          {/* ── Left: Details ──────────────────────────────────────────────── */}
          <div className="space-y-6 lg:col-span-2">

            {/* Title + key stats */}
            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                {listing.title as string}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  {listing.location as string}
                </span>
                <span className="flex items-center gap-1.5">
                  <BedDouble className="h-4 w-4 text-primary" />
                  {listing.bedrooms as number} bedroom{Number(listing.bedrooms) !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {avgRating.toFixed(1)}
                  {reviews.length > 0 && (
                    <span className="text-xs">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                  )}
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold text-primary">
                ৳{Number(listing.rentPerMonth).toLocaleString()}
                <span className="text-sm font-normal text-muted-foreground"> / month</span>
              </p>
            </div>

            {/* Tabs: Overview | Specs | Reviews */}
            <Tabs defaultValue="overview" variant="underline">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="specs">Specs &amp; Amenities</TabsTrigger>
                <TabsTrigger value="reviews">
                  Reviews {reviews.length > 0 && `(${reviews.length})`}
                </TabsTrigger>
              </TabsList>

              {/* Overview */}
              <TabsContent value="overview">
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{listing.shortDescription as string}</p>
                  <p className="whitespace-pre-line leading-relaxed">{listing.fullDescription as string}</p>
                </div>
              </TabsContent>

              {/* Specs */}
              <TabsContent value="specs">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">Property type:</span>
                    <Badge variant="secondary" className="h-auto px-2 py-0.5 text-xs">
                      {listing.propertyType as string}
                    </Badge>
                  </div>
                  {amenities.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-foreground">Amenities</p>
                      <div className="flex flex-wrap gap-2">
                        {amenities.map((amenity) => (
                          <Badge key={amenity} variant="outline" className="flex items-center gap-1.5 h-auto px-2.5 py-1 text-xs">
                            <CheckCircle2 className="h-3 w-3 text-primary" />
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Reviews */}
              <TabsContent value="reviews">
                {reviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No reviews yet.</p>
                ) : (
                  <div className="space-y-5">
                    {/* Average + bar chart */}
                    <div className="flex items-start gap-6">
                      <div className="text-center">
                        <p className="text-4xl font-bold text-foreground">{avgRating.toFixed(1)}</p>
                        <div className="mt-1 flex justify-center gap-0.5">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`}
                            />
                          ))}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{reviews.length} reviews</p>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {ratingCounts.map(({ star, count }) => (
                          <div key={star} className="flex items-center gap-2">
                            <span className="w-3 text-right text-xs text-muted-foreground">{star}</span>
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <Progress
                              value={reviews.length > 0 ? (count / reviews.length) * 100 : 0}
                              className="h-2 flex-1"
                            />
                            <span className="w-4 text-xs text-muted-foreground">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Review list */}
                    <div className="space-y-3">
                      {reviews.map((review) => (
                        <ReviewItem key={String(review._id)} review={review} />
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* ── Right: Sidebar ─────────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <p className="mb-4 text-sm font-medium text-foreground">Contact &amp; Booking</p>

              {/* Call Owner — tel: link, visible to everyone */}
              <NavButton
                asChild
                size="lg"
                className="w-full"
              >
                <a href={`tel:${listing.ownerPhone as string}`}>
                  <Phone className="mr-2 h-4 w-4" />
                  Call Owner
                </a>
              </NavButton>

              {/* Propose Booking Date */}
              <Button
                variant="outline"
                size="lg"
                className="mt-3 w-full"
                onClick={() => {
                  if (!user) {
                    router.push('/login')
                  } else {
                    setDialogOpen(true)
                  }
                }}
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                Propose a Booking Date
              </Button>
              {!user && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  <Link href="/login" className="text-primary hover:underline">Sign in</Link> to propose a visit
                </p>
              )}
            </div>

            {/* Owner info */}
            <div className="rounded-xl border border-border bg-card p-4 text-sm">
              <p className="font-medium text-foreground">Listed by</p>
              <p className="mt-1 text-muted-foreground">{listing.ownerEmail as string}</p>
            </div>
          </div>

        </div>

        {/* ── Related Listings ─────────────────────────────────────────────── */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-4 text-xl font-bold text-foreground">Similar listings in {listing.location as string}</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => (
                <RelatedCard key={String(r._id)} listing={r} />
              ))}
            </div>
          </section>
        )}

      </div>

      {/* ── Booking Dialog ───────────────────────────────────────────────────── */}
      {user && (
        <BookingDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          listingId={id}
          listingTitle={listing.title as string}
          userName={user.name}
        />
      )}
    </main>
  )
}
