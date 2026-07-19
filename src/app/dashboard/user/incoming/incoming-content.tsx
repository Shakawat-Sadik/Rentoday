'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, X } from 'lucide-react'

import { Table, type TableColumn } from '@/components/motion/table/index'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Button } from '@/components/motion/button/base'
import ConfirmDialog, { type ConfirmState } from '@/app/dashboard/confirm-dialog'
import type { IBookingRequest } from '@/lib/interfaces-types'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function StatusBadge({ status }: { status: string }) {
  const variant = status === 'accepted' ? 'default' : status === 'declined' ? 'destructive' : 'outline'
  return <Badge variant={variant} className="capitalize">{status}</Badge>
}

export default function IncomingContent() {
  const [requests, setRequests] = useState<IBookingRequest[]>([])
  const [loading, setLoading]   = useState(true)

  const [confirm, setConfirm]         = useState<ConfirmState | null>(null)
  const [confirmBusy, setConfirmBusy] = useState(false)

  useEffect(() => {
    // Requests placed on listings the current user owns
    fetch('/api/booking-requests/owner')
      .then((r) => (r.ok ? r.json() : { requests: [] }))
      .then((d) => setRequests(d.requests || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

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
      key: 'proposedDate', header: 'Proposed Date', width: '130px',
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
      key: 'actions', header: 'Actions', width: '160px', align: 'center',
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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Incoming Requests</h1>
        <p className="text-sm text-muted-foreground">
          Booking requests visitors have sent for your listings · {requests.length} total
        </p>
      </div>

      {loading ? (
        <Skeleton className="h-80 w-full rounded-xl" />
      ) : requests.length === 0 ? (
        <Empty className="border border-dashed min-h-48">
          <EmptyHeader>
            <EmptyTitle>No incoming requests yet</EmptyTitle>
            <EmptyDescription>
              When someone proposes a visit date on one of your listings, it will appear here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table
            data={requests}
            columns={columns}
            getRowId={(row) => String(row._id)}
            rowHeight={56}
            height={Math.min(requests.length * 56 + 48, 540)}
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
