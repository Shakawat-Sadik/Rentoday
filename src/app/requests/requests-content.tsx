'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CalendarDays } from 'lucide-react'

import { Table, type TableColumn } from '@/components/motion/table/index'
import { Badge } from '@/components/ui/badge'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import type { IBookingRequest } from '@/lib/interfaces-types'

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

export default function RequestsContent() {
  const [requests, setRequests] = useState<IBookingRequest[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    fetch('/api/booking-requests/me')
      .then((r) => r.json())
      .then((data) => setRequests(data.requests || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const columns: TableColumn<IBookingRequest>[] = [
    {
      key: 'listingTitle',
      header: 'Listing',
      width: '220px',
      cell: (row) => (
        <Link
          href={`/listings/${String(row.listingId)}`}
          className="line-clamp-1 font-medium text-primary hover:underline"
        >
          {String(row.listingTitle)}
        </Link>
      ),
    },
    {
      key: 'proposedDate',
      header: 'Proposed Date',
      width: '150px',
      sortable: true,
      cell: (row) =>
        new Date(String(row.proposedDate)).toLocaleDateString('en-GB', {
          day: 'numeric', month: 'short', year: 'numeric',
        }),
      sortValue: (row) => new Date(String(row.proposedDate)).getTime(),
    },
    {
      key: 'message',
      header: 'Your Message',
      width: '220px',
      cell: (row) => (
        <span className="line-clamp-1 text-muted-foreground">
          {String(row.message) || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      align: 'center',
      sortable: true,
      cell: (row) => <StatusBadge status={String(row.status)} />,
    },
    {
      key: 'createdAt',
      header: 'Submitted',
      width: '130px',
      sortable: true,
      cell: (row) =>
        new Date(String(row.createdAt)).toLocaleDateString('en-GB', {
          day: 'numeric', month: 'short', year: 'numeric',
        }),
      sortValue: (row) => new Date(String(row.createdAt)).getTime(),
    },
  ]

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="mb-6 flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">My Booking Requests</h1>
          <span className="text-sm text-muted-foreground">({requests.length})</span>
        </div>

        {requests.length === 0 ? (
          <Empty className="border border-dashed min-h-52">
            <EmptyHeader>
              <EmptyTitle>No requests yet</EmptyTitle>
              <EmptyDescription>
                When you propose a visit date on a{' '}
                <Link href="/listings" className="text-primary hover:underline">
                  listing
                </Link>
                , it will appear here with its status.
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
              defaultSort={{ key: 'createdAt', direction: 'desc' }}
              emptyState="No requests found"
              className="rounded-xl"
            />
          </div>
        )}

      </div>
    </main>
  )
}
