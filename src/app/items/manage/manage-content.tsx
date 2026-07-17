'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Eye, Trash2, LayoutList, CalendarClock, Plus } from 'lucide-react'

import { Table, type TableColumn } from '@/components/motion/table/index'
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Badge } from '@/components/ui/badge'
import { StatefulButton, type ButtonState } from '@/components/motion/button/stateful'
import { Button } from '@/components/motion/button/base'
import { Button as NavButton } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { IListing, IBookingRequest } from '@/lib/interfaces-types'

// ── Status badge helper ───────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, React.ComponentProps<typeof Badge>['variant']> = {
    pending:  'outline',
    accepted: 'default',
    declined: 'destructive',
  }
  return (
    <Badge variant={variants[status] ?? 'outline'} className="capitalize">
      {status}
    </Badge>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ManageContent() {
  const [listings,        setListings]       = useState<IListing[]>([])
  const [requests,        setRequests]       = useState<IBookingRequest[]>([])
  const [loading,         setLoading]        = useState(true)
  const [deleteTarget,    setDeleteTarget]   = useState<IListing | null>(null)
  const [deletingState,   setDeletingState]  = useState<ButtonState>('idle')
  // Track which request is being accepted/declined so each button shows its own state
  const [acceptingId,     setAcceptingId]    = useState<string | null>(null)
  const [decliningId,     setDecliningId]    = useState<string | null>(null)

  // ── Fetch data ──────────────────────────────────────────────────────────────

  useEffect(() => {
    Promise.all([
      fetch('/api/listings/mine').then((r) => (r.ok ? r.json() : { listings: [] })),
      fetch('/api/booking-requests/owner').then((r) => (r.ok ? r.json() : { requests: [] })),
    ])
      .then(([listingData, requestData]) => {
        setListings(listingData.listings || [])
        setRequests(requestData.requests || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // ── Delete listing ──────────────────────────────────────────────────────────

  async function handleDelete() {
    if (!deleteTarget) return
    setDeletingState('loading')
    try {
      const res = await fetch(`/api/listings/${String(deleteTarget._id)}`, { method: 'DELETE' })
      if (res.ok) {
        setListings((prev) => prev.filter((l) => String(l._id) !== String(deleteTarget._id)))
        setDeletingState('success')
        setTimeout(() => {
          setDeleteTarget(null)
          setDeletingState('idle')
        }, 800)
      } else {
        setDeletingState('error')
        setTimeout(() => setDeletingState('idle'), 2000)
      }
    } catch {
      setDeletingState('error')
      setTimeout(() => setDeletingState('idle'), 2000)
    }
  }

  // ── Accept / Decline booking request ────────────────────────────────────────

  async function handleRequestStatus(id: string, status: 'accepted' | 'declined') {
    const setId = status === 'accepted' ? setAcceptingId : setDecliningId
    setId(id)
    try {
      const res = await fetch(`/api/booking-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setRequests((prev) =>
          prev.map((r) => (String(r._id) === id ? { ...r, status } : r)),
        )
      }
    } catch {
      // silently fail — button returns to idle
    } finally {
      setId(null)
    }
  }

  // ── Listings table columns ──────────────────────────────────────────────────
  // Columns are defined inline (not in useMemo) so closures over state stay fresh

  const listingColumns: TableColumn<IListing>[] = [
    {
      key: 'title',
      header: 'Title',
      width: '260px',
      sortable: true,
      cell: (row) => (
        <span className="line-clamp-1 font-medium text-foreground">{String(row.title)}</span>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      width: '140px',
      sortable: true,
    },
    {
      key: 'rentPerMonth',
      header: 'Rent (BDT)',
      width: '120px',
      align: 'right',
      sortable: true,
      cell: (row) => `৳${Number(row.rentPerMonth).toLocaleString()}`,
      sortValue: (row) => Number(row.rentPerMonth),
    },
    {
      key: 'bedrooms',
      header: 'Beds',
      width: '70px',
      align: 'center',
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '130px',
      align: 'center',
      cell: (row) => (
        <div className="flex items-center justify-center gap-2">
          <NavButton
            asChild
            variant="ghost"
            size="icon"
            title="View listing"
          >
            <Link href={`/listings/${String(row._id)}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </NavButton>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            title="Delete listing"
            onClick={() => setDeleteTarget(row)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  // ── Booking requests table columns ──────────────────────────────────────────

  const requestColumns: TableColumn<IBookingRequest>[] = [
    {
      key: 'listingTitle',
      header: 'Listing',
      width: '200px',
      cell: (row) => (
        <Link
          href={`/listings/${String(row.listingId)}`}
          className="line-clamp-1 text-primary hover:underline"
        >
          {String(row.listingTitle)}
        </Link>
      ),
    },
    {
      key: 'requesterName',
      header: 'Requester',
      width: '140px',
    },
    {
      key: 'proposedDate',
      header: 'Proposed Date',
      width: '130px',
      cell: (row) =>
        new Date(String(row.proposedDate)).toLocaleDateString('en-GB', {
          day: 'numeric', month: 'short', year: 'numeric',
        }),
      sortValue: (row) => new Date(String(row.proposedDate)).getTime(),
    },
    {
      key: 'message',
      header: 'Message',
      width: '180px',
      cell: (row) => (
        <span className="line-clamp-1 text-muted-foreground">
          {String(row.message) || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '110px',
      align: 'center',
      cell: (row) => <StatusBadge status={String(row.status)} />,
    },
    {
      key: 'requestActions',
      header: 'Actions',
      width: '200px',
      align: 'center',
      cell: (row) => {
        const id      = String(row._id)
        const pending = row.status === 'pending'
        return (
          <div className="flex items-center justify-center gap-2">
            <StatefulButton
              state={acceptingId === id ? 'loading' : 'idle'}
              size="sm"
              disabled={!pending || !!acceptingId || !!decliningId}
              onClick={() => handleRequestStatus(id, 'accepted')}
              loadingText="…"
              successText="Done"
              errorText="Err"
              className="rounded-full px-3 text-xs"
            >
              Accept
            </StatefulButton>
            <StatefulButton
              state={decliningId === id ? 'loading' : 'idle'}
              size="sm"
              variant="outline"
              disabled={!pending || !!acceptingId || !!decliningId}
              onClick={() => handleRequestStatus(id, 'declined')}
              loadingText="…"
              successText="Done"
              errorText="Err"
              className="rounded-full px-3 text-xs"
            >
              Decline
            </StatefulButton>
          </div>
        )
      },
    },
  ]

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-80 w-full rounded-xl" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">

        {/* ── Listings section ──────────────────────────────────────────────── */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutList className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold text-foreground">My Listings</h1>
              <span className="text-sm text-muted-foreground">({listings.length})</span>
            </div>
            <NavButton asChild size="sm">
              <Link href="/items/add">
                <Plus className="mr-1.5 h-4 w-4" />
                Add listing
              </Link>
            </NavButton>
          </div>

          {listings.length === 0 ? (
            <Empty className="border border-dashed min-h-48">
              <EmptyHeader>
                <EmptyTitle>No listings yet</EmptyTitle>
                <EmptyDescription>
                  <Link href="/items/add" className="text-primary hover:underline">
                    Add your first listing
                  </Link>{' '}
                  to start receiving enquiries.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border">
              <Table
                data={listings}
                columns={listingColumns}
                getRowId={(row) => String(row._id)}
                rowHeight={52}
                height={Math.min(listings.length * 52 + 48, 480)}
                emptyState="No listings found"
                defaultSort={{ key: 'title', direction: 'asc' }}
                className="rounded-xl"
              />
            </div>
          )}
        </section>

        {/* ── Booking requests section ──────────────────────────────────────── */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Booking Requests</h2>
            <span className="text-sm text-muted-foreground">({requests.length})</span>
          </div>

          {requests.length === 0 ? (
            <Empty className="border border-dashed min-h-40">
              <EmptyHeader>
                <EmptyTitle>No booking requests yet</EmptyTitle>
                <EmptyDescription>
                  Requests from visitors will appear here once someone proposes a visit date.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border">
              <Table
                data={requests}
                columns={requestColumns}
                getRowId={(row) => String(row._id)}
                rowHeight={60}
                height={Math.min(requests.length * 60 + 48, 500)}
                emptyState="No requests found"
                defaultSort={{ key: 'proposedDate', direction: 'asc' }}
                className="rounded-xl"
              />
            </div>
          )}
        </section>

      </div>

      {/* ── Delete confirmation dialog ────────────────────────────────────────── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete listing?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{String(deleteTarget?.title ?? '')}&rdquo; will be permanently deleted.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingState === 'loading'}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={(e) => {
                e.preventDefault() // prevent dialog auto-close; we close it manually after success
                handleDelete()
              }}
            >
              {deletingState === 'loading' ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
