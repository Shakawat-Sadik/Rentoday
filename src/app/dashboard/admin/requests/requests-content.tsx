'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Check, X } from 'lucide-react'

import { Table, type TableColumn } from '@/components/motion/table/index'
import { Badge } from '@/components/ui/badge'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Button } from '@/components/motion/button/base'
import ConfirmDialog, { type ConfirmState } from '../confirm-dialog'
import type { IBookingRequest } from '@/lib/interfaces-types'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function StatusBadge({ status }: { status: string }) {
  const variant = status === 'accepted' ? 'default' : status === 'declined' ? 'destructive' : 'outline'
  return <Badge variant={variant} className="capitalize">{status}</Badge>
}

export default function RequestsContent() {
  const [requests, setRequests] = useState<IBookingRequest[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState<'all' | 'pending' | 'accepted' | 'declined'>('all')

  const [confirm, setConfirm]         = useState<ConfirmState | null>(null)
  const [confirmBusy, setConfirmBusy] = useState(false)

  useEffect(() => {
    fetch('/api/booking-requests/owner')
      .then((r) => (r.ok ? r.json() : { requests: [] }))
      .then((d) => setRequests(d.requests || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(
    () => (filter === 'all' ? requests : requests.filter((r) => r.status === filter)),
    [requests, filter],
  )

  async function handleConfirm() {
    if (!confirm) return
    setConfirmBusy(true)
    try { await confirm.onConfirm() }
    finally { setConfirmBusy(false); setConfirm(null) }
  }

  function requestStatus(r: IBookingRequest, status: 'accepted' | 'declined') {
    setConfirm({
      title: status === 'accepted' ? 'Accept this request?' : 'Decline this request?',
      description: `${r.requesterName}'s request for "${r.listingTitle}" will be marked as ${status}.`,
      actionLabel: status === 'accepted' ? 'Accept' : 'Decline',
      destructive: status === 'declined',
      onConfirm: async () => {
        const res = await fetch(`/api/booking-requests/${String(r._id)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })
        if (res.ok) {
          setRequests((prev) => prev.map((x) => (String(x._id) === String(r._id) ? { ...x, status } : x)))
        }
      },
    })
  }

  const columns: TableColumn<IBookingRequest>[] = [
    {
      key: 'listingTitle', header: 'Listing', width: '200px',
      cell: (row) => (
        <Link href={`/listings/${String(row.listingId)}`} className="line-clamp-1 text-primary hover:underline">
          {String(row.listingTitle)}
        </Link>
      ),
    },
    { key: 'requesterName', header: 'Requester', width: '140px' },
    {
      key: 'proposedDate', header: 'Proposed', width: '120px',
      cell: (row) => fmtDate(String(row.proposedDate)),
      sortValue: (row) => new Date(String(row.proposedDate)).getTime(),
    },
    {
      key: 'message', header: 'Message', width: '180px',
      cell: (row) => <span className="line-clamp-1 text-muted-foreground">{String(row.message) || '—'}</span>,
    },
    {
      key: 'status', header: 'Status', width: '110px', align: 'center',
      cell: (row) => <StatusBadge status={String(row.status)} />,
    },
    {
      key: 'actions', header: 'Actions', width: '150px', align: 'center',
      cell: (row) => {
        const pending = row.status === 'pending'
        return (
          <div className="flex items-center justify-center gap-1.5">
            <Button
              variant="primary" size="sm" ripple disabled={!pending}
              className="h-8 rounded-full px-3 text-xs"
              onClick={() => requestStatus(row, 'accepted')}
            >
              <Check className="mr-1 h-3.5 w-3.5" />Accept
            </Button>
            <Button
              variant="outline" size="sm" ripple disabled={!pending}
              className="h-8 rounded-full px-3 text-xs"
              onClick={() => requestStatus(row, 'declined')}
            >
              <X className="mr-1 h-3.5 w-3.5" />Decline
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Booking Requests</h1>
          <p className="text-sm text-muted-foreground">{requests.length} total</p>
        </div>
        <NativeSelect
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="w-40"
        >
          <NativeSelectOption value="all">All statuses</NativeSelectOption>
          <NativeSelectOption value="pending">Pending</NativeSelectOption>
          <NativeSelectOption value="accepted">Accepted</NativeSelectOption>
          <NativeSelectOption value="declined">Declined</NativeSelectOption>
        </NativeSelect>
      </div>

      {loading ? (
        <Skeleton className="h-96 w-full rounded-xl" />
      ) : filtered.length === 0 ? (
        <Empty className="border border-dashed min-h-48">
          <EmptyHeader>
            <EmptyTitle>No booking requests</EmptyTitle>
            <EmptyDescription>
              {filter === 'all' ? 'Requests will appear here as users propose visit dates.' : `No ${filter} requests.`}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table
            data={filtered}
            columns={columns}
            getRowId={(row) => String(row._id)}
            rowHeight={56}
            height={Math.min(filtered.length * 56 + 48, 560)}
            emptyState="No requests found"
            defaultSort={{ key: 'proposedDate', direction: 'asc' }}
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
