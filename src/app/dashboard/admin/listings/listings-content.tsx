'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Eye, Pencil, Trash2, Plus } from 'lucide-react'

import { Table, type TableColumn } from '@/components/motion/table/index'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/motion/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { StatefulButton } from '@/components/motion/button/stateful'
import { Button } from '@/components/motion/button/base'
import { Button as NavButton } from '@/components/ui/button'
import ConfirmDialog, { type ConfirmState } from '@/app/dashboard/confirm-dialog'
import type { IListing } from '@/lib/interfaces-types'

const LOCATIONS = [
  'Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mirpur',
  'Bashundhara', 'Mohammadpur', 'Badda', 'Lalmatia', 'Baridhara',
]
const PROPERTY_TYPES = ['Apartment', 'Studio', 'Sublet/Room', 'Bachelor Mess']
const AMENITY_OPTIONS = [
  'Gas', 'Lift', 'Generator', 'Parking', 'Security',
  'Balcony', 'Furnished', 'Unfurnished', 'Water Reserve Tank',
]

interface FormState {
  title: string
  shortDescription: string
  fullDescription: string
  rentPerMonth: string
  location: string
  bedrooms: string
  propertyType: string
  amenities: string[]
  imagesText: string
}

const EMPTY_FORM: FormState = {
  title: '', shortDescription: '', fullDescription: '',
  rentPerMonth: '', location: 'Dhanmondi', bedrooms: '1',
  propertyType: 'Apartment', amenities: [], imagesText: '',
}

function listingToForm(l: IListing): FormState {
  return {
    title: l.title,
    shortDescription: l.shortDescription,
    fullDescription: l.fullDescription,
    rentPerMonth: String(l.rentPerMonth),
    location: l.location,
    bedrooms: String(l.bedrooms),
    propertyType: l.propertyType,
    amenities: l.amenities || [],
    imagesText: (l.images || []).join('\n'),
  }
}

export default function ListingsContent() {
  const [listings, setListings] = useState<IListing[]>([])
  const [loading, setLoading]   = useState(true)

  // Add / edit dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing]       = useState<IListing | null>(null)
  const [form, setForm]             = useState<FormState>(EMPTY_FORM)
  const [formError, setFormError]   = useState('')
  const [formState, setFormState]   = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  // Confirmation gate
  const [confirm, setConfirm]         = useState<ConfirmState | null>(null)
  const [confirmBusy, setConfirmBusy] = useState(false)

  useEffect(() => {
    fetch('/api/listings/mine')
      .then((r) => (r.ok ? r.json() : { listings: [] }))
      .then((d) => setListings(d.listings || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function handleConfirm() {
    if (!confirm) return
    setConfirmBusy(true)
    try { await confirm.onConfirm() }
    finally { setConfirmBusy(false); setConfirm(null) }
  }

  function openAdd() {
    setEditing(null); setForm(EMPTY_FORM); setFormError(''); setFormState('idle'); setDialogOpen(true)
  }
  function openEdit(l: IListing) {
    setEditing(l); setForm(listingToForm(l)); setFormError(''); setFormState('idle'); setDialogOpen(true)
  }

  function toggleAmenity(a: string, checked: boolean) {
    setForm((f) => ({
      ...f,
      amenities: checked ? [...f.amenities, a] : f.amenities.filter((x) => x !== a),
    }))
  }

  function requestDelete(l: IListing) {
    setConfirm({
      title: 'Delete this listing?',
      description: `"${l.title}" will be permanently deleted. This cannot be undone.`,
      actionLabel: 'Delete listing',
      destructive: true,
      onConfirm: async () => {
        const res = await fetch(`/api/listings/${String(l._id)}`, { method: 'DELETE' })
        if (res.ok) setListings((prev) => prev.filter((x) => String(x._id) !== String(l._id)))
      },
    })
  }

  // Build the payload shared by add + edit
  function buildPayload() {
    return {
      title: form.title.trim(),
      shortDescription: form.shortDescription.trim(),
      fullDescription: form.fullDescription.trim(),
      rentPerMonth: Number(form.rentPerMonth),
      location: form.location,
      bedrooms: Number(form.bedrooms),
      propertyType: form.propertyType,
      amenities: form.amenities,
      images: form.imagesText.split('\n').map((s) => s.trim()).filter(Boolean),
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    setFormState('loading')
    try {
      const payload = buildPayload()
      const res = editing
        ? await fetch(`/api/listings/${String(editing._id)}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
          })
        : await fetch('/api/listings', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
          })
      const data = await res.json()
      if (!res.ok) {
        setFormError(data.error || 'Save failed.')
        setFormState('error'); setTimeout(() => setFormState('idle'), 2000)
        return
      }
      const saved = data.listing as IListing
      setListings((prev) =>
        editing
          ? prev.map((l) => (String(l._id) === String(editing._id) ? saved : l))
          : [saved, ...prev],
      )
      setFormState('success')
      setTimeout(() => { setDialogOpen(false); setFormState('idle') }, 800)
    } catch {
      setFormError('Network error. Please try again.')
      setFormState('error'); setTimeout(() => setFormState('idle'), 2000)
    }
  }

  const columns: TableColumn<IListing>[] = [
    {
      key: 'title', header: 'Title', width: '240px', sortable: true,
      cell: (row) => <span className="line-clamp-1 font-medium text-foreground">{String(row.title)}</span>,
    },
    { key: 'location', header: 'Location', width: '120px', sortable: true },
    {
      key: 'rentPerMonth', header: 'Rent', width: '110px', align: 'right', sortable: true,
      cell: (row) => `৳${Number(row.rentPerMonth).toLocaleString()}`,
      sortValue: (row) => Number(row.rentPerMonth),
    },
    { key: 'propertyType', header: 'Type', width: '120px' },
    {
      key: 'ownerEmail', header: 'Owner', width: '170px',
      cell: (row) => <span className="line-clamp-1 text-muted-foreground">{String(row.ownerEmail)}</span>,
    },
    {
      key: 'actions', header: 'Actions', width: '140px', align: 'center',
      cell: (row) => (
        <div className="flex items-center justify-center gap-1">
          <NavButton asChild variant="ghost" size="icon" title="View">
            <Link href={`/listings/${String(row._id)}`}><Eye className="h-4 w-4" /></Link>
          </NavButton>
          <Button variant="ghost" size="icon" title="Edit" onClick={() => openEdit(row)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost" size="icon" title="Delete"
            className="text-destructive hover:text-destructive"
            onClick={() => requestDelete(row)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Listings</h1>
          <p className="text-sm text-muted-foreground">{listings.length} total</p>
        </div>
        <Button variant="primary" size="md" ripple onClick={openAdd}>
          <Plus className="mr-1.5 h-4 w-4" />Add listing
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-96 w-full rounded-xl" />
      ) : listings.length === 0 ? (
        <Empty className="border border-dashed min-h-48">
          <EmptyHeader>
            <EmptyTitle>No listings yet</EmptyTitle>
            <EmptyDescription>Create the first listing with the button above.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table
            data={listings}
            columns={columns}
            getRowId={(row) => String(row._id)}
            rowHeight={52}
            height={Math.min(listings.length * 52 + 48, 560)}
            emptyState="No listings found"
            defaultSort={{ key: 'title', direction: 'asc' }}
            className="rounded-xl"
          />
        </div>
      )}

      {/* ── Add / edit dialog ────────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (formState !== 'loading') setDialogOpen(open) }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit listing' : 'Add a listing'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update the details for this listing.' : 'Create a new listing visible to all users.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="l-title">Title</Label>
              <Input id="l-title" value={form.title} required
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="l-short">Short description</Label>
              <Input id="l-short" value={form.shortDescription} required
                onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="l-full">Full description</Label>
              <Textarea id="l-full" rows={4} value={form.fullDescription} required
                onChange={(e) => setForm((f) => ({ ...f, fullDescription: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="l-rent">Rent per month (BDT)</Label>
                <Input id="l-rent" type="number" min={1} value={form.rentPerMonth} required
                  onChange={(e) => setForm((f) => ({ ...f, rentPerMonth: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="l-beds">Bedrooms</Label>
                <Input id="l-beds" type="number" min={1} max={10} value={form.bedrooms} required
                  onChange={(e) => setForm((f) => ({ ...f, bedrooms: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="l-loc">Location</Label>
                <NativeSelect id="l-loc" value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}>
                  {LOCATIONS.map((loc) => <NativeSelectOption key={loc} value={loc}>{loc}</NativeSelectOption>)}
                </NativeSelect>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="l-type">Property type</Label>
                <NativeSelect id="l-type" value={form.propertyType}
                  onChange={(e) => setForm((f) => ({ ...f, propertyType: e.target.value }))}>
                  {PROPERTY_TYPES.map((pt) => <NativeSelectOption key={pt} value={pt}>{pt}</NativeSelectOption>)}
                </NativeSelect>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Amenities</Label>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
                {AMENITY_OPTIONS.map((a) => (
                  <Checkbox key={a} label={a} checked={form.amenities.includes(a)}
                    onCheckedChange={(c) => toggleAmenity(a, c)} />
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="l-images">Image URLs (one per line)</Label>
              <Textarea id="l-images" rows={3} placeholder="https://…" value={form.imagesText}
                onChange={(e) => setForm((f) => ({ ...f, imagesText: e.target.value }))} />
            </div>

            {formError && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p>
            )}

            <DialogFooter>
              <StatefulButton
                type="submit"
                state={formState}
                size="md"
                loadingText={editing ? 'Saving…' : 'Publishing…'}
                successText={editing ? 'Saved!' : 'Published!'}
                errorText="Try again"
                className="rounded-md"
              >
                {editing ? 'Save changes' : 'Publish listing'}
              </StatefulButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Confirmation gate ────────────────────────────────────────────────── */}
      <ConfirmDialog
        confirm={confirm ? { ...confirm, onConfirm: handleConfirm } : null}
        loading={confirmBusy}
        onClose={() => setConfirm(null)}
      />
    </div>
  )
}
