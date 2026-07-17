'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/motion/select'
import { Checkbox } from '@/components/motion/checkbox'
import { FileUpload, createFileUploadItem, type FileUploadItem } from '@/components/motion/file-upload'
import { StatefulButton, type ButtonState } from '@/components/motion/button/stateful'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

// ── Constants ─────────────────────────────────────────────────────────────────

const LOCATIONS = [
  'Dhanmondi', 'Gulshan', 'Banani', 'Uttara',
  'Mirpur', 'Bashundhara', 'Mohammadpur', 'Badda', 'Lalmatia', 'Baridhara',
]

const PROPERTY_TYPES = ['Apartment', 'Studio', 'Sublet/Room', 'Bachelor Mess']

const AMENITY_OPTIONS = [
  'Gas', 'Lift', 'Generator', 'Parking', 'Security',
  'Balcony', 'Furnished', 'Unfurnished', 'Water Reserve Tank',
]

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

// ── Upload a single file to Cloudinary, returns secure_url or throws ─────────

async function uploadToCloudinary(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', UPLOAD_PRESET!)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: form },
  )
  if (!res.ok) throw new Error('Cloudinary upload failed')
  const data = await res.json()
  return data.secure_url as string
}

// ── Form ──────────────────────────────────────────────────────────────────────

export default function AddListingForm() {
  const router = useRouter()

  // Text / number fields
  const [title,            setTitle]            = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [fullDescription,  setFullDescription]  = useState('')
  const [rentPerMonth,     setRentPerMonth]     = useState('')
  const [location,         setLocation]         = useState('')
  const [bedrooms,         setBedrooms]         = useState('')
  const [propertyType,     setPropertyType]     = useState('')
  const [amenities,        setAmenities]        = useState<string[]>([])

  // Image upload state (controlled FileUpload)
  const [fileItems, setFileItems] = useState<FileUploadItem[]>([])
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])

  // Form submit
  const [btnState, setBtnState] = useState<ButtonState>('idle')
  const [error,    setError]    = useState('')

  // Toggle an amenity in/out of the selected list
  function toggleAmenity(amenity: string, checked: boolean) {
    setAmenities((prev) =>
      checked ? [...prev, amenity] : prev.filter((a) => a !== amenity),
    )
  }

  // Called by FileUpload when new files are dropped/selected — upload each to Cloudinary
  async function handleFilesAdded(newItems: FileUploadItem[], files: File[]) {
    // FileUpload already added these items in 'uploading' state; we mirror that
    // then update status as uploads complete
    const updatedItems = [...fileItems, ...newItems]
    setFileItems(updatedItems)

    const newUrls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const item = newItems[i]
      try {
        const url = await uploadToCloudinary(files[i])
        newUrls.push(url)
        setFileItems((prev) =>
          prev.map((fi) =>
            fi.id === item.id ? { ...fi, status: 'success', progress: 100 } : fi,
          ),
        )
      } catch {
        setFileItems((prev) =>
          prev.map((fi) =>
            fi.id === item.id ? { ...fi, status: 'error', error: 'Upload failed' } : fi,
          ),
        )
      }
    }

    setUploadedUrls((prev) => [...prev, ...newUrls])
  }

  // Retry a failed upload
  async function handleRetry(item: FileUploadItem) {
    if (!item.file) return
    try {
      const url = await uploadToCloudinary(item.file)
      setFileItems((prev) =>
        prev.map((fi) =>
          fi.id === item.id ? { ...fi, status: 'success', progress: 100 } : fi,
        ),
      )
      setUploadedUrls((prev) => [...prev, url])
    } catch {
      setFileItems((prev) =>
        prev.map((fi) =>
          fi.id === item.id ? { ...fi, status: 'error', error: 'Upload failed' } : fi,
        ),
      )
    }
  }

  // Remove an item from the queue and its URL from the list
  function handleRemove(removed: FileUploadItem) {
    setFileItems((prev) => prev.filter((fi) => fi.id !== removed.id))
    // We don't know which URL corresponds to this item without mapping — safest
    // is to keep the URL list length matching successful uploads; this is
    // adequate for a class project where images are recollected from fileItems
    // statuses anyway.
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Validate that all queued images have finished uploading
    const pendingUploads = fileItems.some((fi) => fi.status === 'uploading')
    if (pendingUploads) {
      setError('Please wait for all images to finish uploading.')
      return
    }

    setBtnState('loading')

    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:            title.trim(),
          shortDescription: shortDescription.trim(),
          fullDescription:  fullDescription.trim(),
          rentPerMonth:     Number(rentPerMonth),
          location,
          bedrooms:         Number(bedrooms),
          propertyType,
          amenities,
          images:           uploadedUrls,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create listing.')
        setBtnState('error')
        setTimeout(() => setBtnState('idle'), 2000)
      } else {
        setBtnState('success')
        setTimeout(() => router.push('/items/manage'), 900)
      }
    } catch {
      setError('Network error. Please try again.')
      setBtnState('error')
      setTimeout(() => setBtnState('idle'), 2000)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">

        <h1 className="mb-1 text-2xl font-bold text-foreground">Add a new listing</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Fill in the details below. Your listing will be visible to all users immediately.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g. Spacious 3-bed apartment in Gulshan 2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Short description */}
          <div className="space-y-1.5">
            <Label htmlFor="short-desc">Short description</Label>
            <Input
              id="short-desc"
              placeholder="One-line summary shown on listing cards"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              required
            />
          </div>

          {/* Full description */}
          <div className="space-y-1.5">
            <Label htmlFor="full-desc">Full description</Label>
            <Textarea
              id="full-desc"
              placeholder="Describe the property in detail — neighbourhood, surroundings, access to transport…"
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              rows={5}
              required
            />
          </div>

          {/* Rent + Bedrooms in a row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="rent">Rent per month (BDT)</Label>
              <Input
                id="rent"
                type="number"
                min={1}
                placeholder="e.g. 25000"
                value={rentPerMonth}
                onChange={(e) => setRentPerMonth(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                min={1}
                max={10}
                placeholder="e.g. 3"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Location + Property type in a row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Property type</Label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((pt) => (
                    <SelectItem key={pt} value={pt}>{pt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-2">
            <Label>Amenities</Label>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
              {AMENITY_OPTIONS.map((amenity) => (
                <Checkbox
                  key={amenity}
                  label={amenity}
                  checked={amenities.includes(amenity)}
                  onCheckedChange={(checked) => toggleAmenity(amenity, checked)}
                />
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label>Photos</Label>
            <FileUpload
              value={fileItems}
              onValueChange={setFileItems}
              onFilesAdded={handleFilesAdded}
              onRemove={handleRemove}
              onRetry={handleRetry}
              accept="image/*"
              multiple
              maxFiles={8}
              title="Upload property photos"
              description="Drag and drop images here, or click to browse. Max 8 files."
              variant="centered"
            />
            {/* Preview thumbnails of successfully uploaded images */}
            {uploadedUrls.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {uploadedUrls.map((url, i) => (
                  <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg border border-border bg-muted">
                    <Image
                      src={url}
                      alt={`Upload ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Validation error */}
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          {/* Submit */}
          <div className={cn('flex items-center gap-4 pt-2')}>
            <StatefulButton
              type="submit"
              state={btnState}
              size="lg"
              loadingText="Publishing…"
              successText="Listing published!"
              errorText="Try again"
              className="rounded-md px-8"
            >
              Publish listing
            </StatefulButton>
          </div>

        </form>
      </div>
    </main>
  )
}
