'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Eye, Trash2, Plus } from 'lucide-react'

import { Table, type TableColumn } from '@/components/motion/table/index'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Button } from '@/components/motion/button/base'
import { Button as NavButton } from '@/components/ui/button'
import ConfirmDialog, { type ConfirmState } from '@/app/dashboard/confirm-dialog'
import type { IListing } from '@/lib/interfaces-types'

export default function MyListingsContent() {
  const [listings, setListings] = useState<IListing[]>([])
  const [loading, setLoading]   = useState(true)

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

  const columns: TableColumn<IListing>[] = [
    {
      key: 'title', header: 'Title', width: '260px', sortable: true,
      cell: (row) => <span className="line-clamp-1 font-medium text-foreground">{String(row.title)}</span>,
    },
    { key: 'location', header: 'Location', width: '140px', sortable: true },
    {
      key: 'rentPerMonth', header: 'Rent (BDT)', width: '120px', align: 'right', sortable: true,
      cell: (row) => `৳${Number(row.rentPerMonth).toLocaleString()}`,
      sortValue: (row) => Number(row.rentPerMonth),
    },
    { key: 'bedrooms', header: 'Beds', width: '70px', align: 'center' },
    {
      key: 'actions', header: 'Actions', width: '120px', align: 'center',
      cell: (row) => (
        <div className="flex items-center justify-center gap-2">
          <NavButton asChild variant="ghost" size="icon" title="View listing">
            <Link href={`/listings/${String(row._id)}`}><Eye className="h-4 w-4" /></Link>
          </NavButton>
          <Button
            variant="ghost" size="icon" title="Delete listing"
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
          <h1 className="text-2xl font-bold text-foreground">My Listings</h1>
          <p className="text-sm text-muted-foreground">{listings.length} total</p>
        </div>
        <NavButton asChild size="sm">
          <Link href="/dashboard/user/items/add">
            <Plus className="mr-1.5 h-4 w-4" />
            Add listing
          </Link>
        </NavButton>
      </div>

      {loading ? (
        <Skeleton className="h-80 w-full rounded-xl" />
      ) : listings.length === 0 ? (
        <Empty className="border border-dashed min-h-48">
          <EmptyHeader>
            <EmptyTitle>No listings yet</EmptyTitle>
            <EmptyDescription>
              <Link href="/dashboard/user/items/add" className="text-primary hover:underline">Add your first listing</Link>{' '}
              to start receiving enquiries.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table
            data={listings}
            columns={columns}
            getRowId={(row) => String(row._id)}
            rowHeight={52}
            height={Math.min(listings.length * 52 + 48, 520)}
            emptyState="No listings found"
            defaultSort={{ key: 'title', direction: 'asc' }}
            className="rounded-xl"
          />
        </div>
      )}

      <ConfirmDialog
        confirm={confirm ? { ...confirm, onConfirm: handleConfirm } : null}
        loading={confirmBusy}
        onClose={() => setConfirm(null)}
      />
    </div>
  )
}
