'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, BedDouble, Star } from 'lucide-react'

import { FaviconSearch } from '@/components/unlumen-ui/favicon-search'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/motion/select'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/motion/button/base'
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis,
} from '@/components/ui/pagination'
import type { IListing } from '@/lib/interfaces-types'

// ── Constants ─────────────────────────────────────────────────────────────────

const LOCATIONS = [
  'All Locations',
  'Dhanmondi', 'Gulshan', 'Banani', 'Uttara',
  'Mirpur', 'Bashundhara', 'Mohammadpur', 'Badda', 'Lalmatia', 'Baridhara',
]

const RENT_MIN = 5000
const RENT_MAX = 85000

// ── Types ─────────────────────────────────────────────────────────────────────

interface ListingsResponse {
  listings: IListing[]
  total: number
  page: number
  totalPages: number
}

// ── Skeleton card shown while fetching ────────────────────────────────────────

function ListingCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <CardContent className="space-y-2 pt-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </CardContent>
      <CardFooter className="justify-between border-t bg-muted/50 px-4 py-3">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </CardFooter>
    </Card>
  )
}

// ── Listing card ──────────────────────────────────────────────────────────────

function ListingCard({ listing }: { listing: IListing }) {
  const image = listing.images?.[0] || `https://picsum.photos/seed/${listing._id}/800/600`

  return (
    <Card className="group flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        <Image
          src={image}
          alt={listing.title as string}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        {/* Rating badge overlay */}
        <div className="absolute right-2 top-2">
          <Badge className="flex items-center gap-0.5 bg-black/70 text-white backdrop-blur-sm">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {Number(listing.rating).toFixed(1)}
          </Badge>
        </div>
      </div>

      {/* Body */}
      <CardContent className="flex flex-1 flex-col gap-1.5 pt-4">
        <h3 className="line-clamp-1 font-semibold text-foreground">{listing.title as string}</h3>
        <p className="line-clamp-2 text-xs text-muted-foreground">{listing.shortDescription as string}</p>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" />
            {listing.location as string}
          </span>
          <span className="flex items-center gap-1">
            <BedDouble className="h-3 w-3 shrink-0" />
            {listing.bedrooms as number} bed{Number(listing.bedrooms) !== 1 ? 's' : ''}
          </span>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex items-center justify-between gap-2">
        <span className="font-semibold text-blue-700 dark:text-blue-400">
          ৳{Number(listing.rentPerMonth).toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/mo</span>
        </span>
        <Button
          asChild
          variant="secondary"
          size="sm"
        >
          <Link href={`/listings/${listing._id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

// ── Pagination helper — builds visible page numbers ───────────────────────────

function buildPageRange(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | 'ellipsis')[] = [1]
  if (current > 3) pages.push('ellipsis')
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p)
  }
  if (current < total - 2) pages.push('ellipsis')
  pages.push(total)
  return pages
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ListingsPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  // Read committed filter state from URL
  const urlQuery    = searchParams.get('query')    || ''
  const urlLocation = searchParams.get('location') || ''
  const urlMinRent  = Number(searchParams.get('minRent') || RENT_MIN)
  const urlMaxRent  = Number(searchParams.get('maxRent') || RENT_MAX)
  const urlSort     = searchParams.get('sort')     || 'newest'
  const urlPage     = Math.max(1, Number(searchParams.get('page') || 1))

  // Local UI state — slider is "pending" until pointer up
  const [searchInput,   setSearchInput]   = useState(urlQuery)
  const [sliderValues,  setSliderValues]  = useState<[number, number]>([urlMinRent, urlMaxRent])

  // Fetched data
  const [listings,   setListings]   = useState<IListing[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [total,      setTotal]      = useState(0)
  const [loading,    setLoading]    = useState(true)

  // Build API query string from URL params
  const buildApiUrl = useCallback((overrides: Record<string, string | number> = {}) => {
    const p = new URLSearchParams()
    const q        = String(overrides.query    ?? urlQuery)
    const loc      = String(overrides.location ?? urlLocation)
    const minRent  = String(overrides.minRent  ?? urlMinRent)
    const maxRent  = String(overrides.maxRent  ?? urlMaxRent)
    const sort     = String(overrides.sort     ?? urlSort)
    const page     = String(overrides.page     ?? urlPage)

    if (q)        p.set('query',    q)
    if (loc)      p.set('location', loc)
    if (minRent !== String(RENT_MIN)) p.set('minRent', minRent)
    if (maxRent !== String(RENT_MAX)) p.set('maxRent', maxRent)
    p.set('sort', sort)
    p.set('page', page)
    return `/api/listings?${p.toString()}`
  }, [urlQuery, urlLocation, urlMinRent, urlMaxRent, urlSort, urlPage])

  // Push filter changes to the URL (which triggers a re-fetch via useEffect)
  function pushParams(overrides: Record<string, string | number> = {}) {
    const p = new URLSearchParams()
    const q       = String(overrides.query    ?? urlQuery)
    const loc     = String(overrides.location ?? urlLocation)
    const minR    = Number(overrides.minRent  ?? urlMinRent)
    const maxR    = Number(overrides.maxRent  ?? urlMaxRent)
    const sort    = String(overrides.sort     ?? urlSort)
    const page    = String(overrides.page     ?? 1)

    if (q)               p.set('query',    q)
    if (loc)             p.set('location', loc)
    if (minR !== RENT_MIN) p.set('minRent', String(minR))
    if (maxR !== RENT_MAX) p.set('maxRent', String(maxR))
    p.set('sort', sort)
    p.set('page', page)
    router.push(`/listings?${p.toString()}`)
  }

  // Fetch listings whenever URL params change
  useEffect(() => {
    setLoading(true)
    fetch(buildApiUrl())
      .then((r) => r.json())
      .then((data: ListingsResponse) => {
        setListings(data.listings  || [])
        setTotalPages(data.totalPages || 1)
        setTotal(data.total || 0)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [buildApiUrl])

  // Sync search input if URL param changes externally (e.g. back button)
  useEffect(() => { setSearchInput(urlQuery) },   [urlQuery])
  useEffect(() => { setSliderValues([urlMinRent, urlMaxRent]) }, [urlMinRent, urlMaxRent])

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleSearch(_value: string, _domain: null) {
    pushParams({ query: searchInput, page: 1 })
  }

  function handleSearchChange(value: string) {
    setSearchInput(value)
  }

  function handleLocationChange(value: string) {
    const loc = value === 'All Locations' ? '' : value
    pushParams({ location: loc, page: 1 })
  }

  function handleSortChange(value: string) {
    pushParams({ sort: value, page: 1 })
  }

  function handleSliderCommit(values: number[]) {
    pushParams({ minRent: values[0], maxRent: values[1], page: 1 })
  }

  function handlePageChange(p: number) {
    pushParams({ page: p })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const pages = buildPageRange(urlPage, totalPages)

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Explore Listings</h1>
          <p className="mt-1 text-muted-foreground">
            {loading ? 'Loading…' : `${total.toLocaleString()} listing${total !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* ── Filters ─────────────────────────────────────────────────────── */}
        <div className="mb-8 flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm lg:flex-row lg:items-end lg:gap-6">

          {/* Search */}
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Search</label>
            <FaviconSearch
              value={searchInput}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Search by title or area…"
              className="max-w-none"
            />
          </div>

          {/* Location */}
          <div className="w-full lg:w-48">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Location</label>
            <Select
              value={urlLocation || 'All Locations'}
              onValueChange={handleLocationChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((loc) => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rent range */}
          <div className="w-full lg:w-56">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Rent: ৳{sliderValues[0].toLocaleString()} – ৳{sliderValues[1].toLocaleString()}
            </label>
            <Slider
              min={RENT_MIN}
              max={RENT_MAX}
              step={1000}
              value={sliderValues}
              onValueChange={(v) => setSliderValues(v as [number, number])}
              onValueCommit={handleSliderCommit}
              className="mt-2"
            />
          </div>

          {/* Sort */}
          <div className="w-full lg:w-44">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Sort by</label>
            <Select value={urlSort} onValueChange={handleSortChange}>
              <SelectTrigger>
                <SelectValue placeholder="Newest first" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="price-asc">Price: Low → High</SelectItem>
                <SelectItem value="price-desc">Price: High → Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>

        {/* ── Listing grid ─────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24 text-center">
            <p className="text-lg font-semibold text-foreground">No listings found</p>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or search term</p>
            <Button
              variant="outline"
              size="md"
              className="mt-4"
              onClick={() => { router.push('/listings') }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <ListingCard key={String(listing._id)} listing={listing} />
            ))}
          </div>
        )}

        {/* ── Pagination ───────────────────────────────────────────────────── */}
        {!loading && totalPages > 1 && (
          <div className="mt-10">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => urlPage > 1 && handlePageChange(urlPage - 1)}
                    aria-disabled={urlPage <= 1}
                    className={urlPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>

                {pages.map((p, i) =>
                  p === 'ellipsis' ? (
                    <PaginationItem key={`ellipsis-${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink
                        isActive={p === urlPage}
                        onClick={() => handlePageChange(p as number)}
                        className="cursor-pointer"
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => urlPage < totalPages && handlePageChange(urlPage + 1)}
                    aria-disabled={urlPage >= totalPages}
                    className={urlPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

      </div>
    </main>
  )
}
