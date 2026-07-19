'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { Table, type TableColumn } from '@/components/motion/table/index'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import type { IBookingRequest } from '@/lib/interfaces-types'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function StatusBadge({ status }: { status: string }) {
  const variant = status === 'accepted' ? 'default' : status === 'declined' ? 'destructive' : 'outline'
  return <Badge variant={variant} className="capitalize">{status}</Badge>
}

export default function OutgoingContent() {
  const [requests, setRequests] = useState<IBookingRequest[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    // Requests the current user has sent to other owners
    fetch('/api/booking-requests/me')
      .then((r) => (r.ok ? r.json() : { requests: [] }))
      .then((d) => setRequests(d.requests || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const columns: TableColumn<IBookingRequest>[] = [
    {
      key: 'listingTitle', header: 'Listing', width: '220px',
      cell: (row) => (
        <Link href={`/listings/${String(row.listingId)}`} className="line-clamp-1 font-medium text-primary hover:underline">
          {String(row.listingTitle)}
        </Link>
      ),
    },
    {
      key: 'proposedDate', header: 'Proposed Date', width: '140px', sortable: true,
      cell: (row) => fmtDate(String(row.proposedDate)),
      sortValue: (row) => new Date(String(row.proposedDate)).getTime(),
    },
    {
      key: 'message', header: 'Your Message', width: '220px',
      cell: (row) => <span className="line-clamp-1 text-muted-foreground">{String(row.message) || '—'}</span>,
    },
    {
      key: 'status', header: 'Status', width: '120px', align: 'center', sortable: true,
      cell: (row) => <StatusBadge status={String(row.status)} />,
    },
    {
      key: 'createdAt', header: 'Submitted', width: '130px', sortable: true,
      cell: (row) => fmtDate(String(row.createdAt)),
      sortValue: (row) => new Date(String(row.createdAt)).getTime(),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Outgoing Requests</h1>
        <p className="text-sm text-muted-foreground">
          Visit requests you have sent to other owners · {requests.length} total
        </p>
      </div>

      {loading ? (
        <Skeleton className="h-80 w-full rounded-xl" />
      ) : requests.length === 0 ? (
        <Empty className="border border-dashed min-h-48">
          <EmptyHeader>
            <EmptyTitle>No requests yet</EmptyTitle>
            <EmptyDescription>
              When you propose a visit date on a{' '}
              <Link href="/listings" className="text-primary hover:underline">listing</Link>, it will appear here with its status.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table
            data={requests}
            columns={columns}
            getRowId={(row) => String(row._id)}
            rowHeight={52}
            height={Math.min(requests.length * 52 + 48, 520)}
            emptyState="No requests found"
            defaultSort={{ key: 'createdAt', direction: 'desc' }}
            className="rounded-xl"
          />
        </div>
      )}
    </div>
  )
}
