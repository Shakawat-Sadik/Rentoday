'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Users, Building2, CalendarClock, ShieldAlert, Clock,
} from 'lucide-react'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis,
  Pie, PieChart, Cell,
} from 'recharts'

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from '@/components/ui/chart'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

// ── Types mirroring /api/admin/stats ──────────────────────────────────────────

interface Stats {
  counts: {
    totalUsers: number
    totalListings: number
    totalRequests: number
    suspendedUsers: number
    pendingRequests: number
  }
  recentUsers: { _id: string; name: string; email: string; role: string; status: string; createdAt: string }[]
  recentListings: { _id: string; title: string; location: string; rentPerMonth: number; propertyType: string; createdAt: string }[]
  recentRequests: { _id: string; listingTitle: string; requesterName: string; status: string; createdAt: string }[]
  charts: {
    listingsByType: { type: string; count: number }[]
    requestsByStatus: { status: string; count: number }[]
    monthlyGrowth: { month: string; users: number; listings: number }[]
  }
}

const growthConfig = {
  users:    { label: 'Users',    color: 'var(--chart-2)' },
  listings: { label: 'Listings', color: 'var(--chart-4)' },
} satisfies ChartConfig

const typeConfig = {
  count: { label: 'Listings', color: 'var(--chart-3)' },
} satisfies ChartConfig

const STATUS_COLORS: Record<string, string> = {
  pending:  'var(--chart-1)',
  accepted: 'var(--chart-3)',
  declined: 'var(--destructive)',
}

const statusConfig = {
  count:    { label: 'Requests' },
  pending:  { label: 'Pending',  color: 'var(--chart-1)' },
  accepted: { label: 'Accepted', color: 'var(--chart-3)' },
  declined: { label: 'Declined', color: 'var(--destructive)' },
} satisfies ChartConfig

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, icon: Icon, hint,
}: {
  label: string; value: number; icon: React.ElementType; hint?: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value.toLocaleString()}</div>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function OverviewContent() {
  const [stats, setStats]     = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Failed to load statistics.'))))
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
        {error || 'Unable to load dashboard.'}
      </div>
    )
  }

  const { counts, charts, recentUsers, recentListings, recentRequests } = stats

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground">A snapshot of activity across RenToday.</p>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Users"      value={counts.totalUsers}     icon={Users}
          hint={`${counts.suspendedUsers} suspended`} />
        <StatCard label="Total Listings"   value={counts.totalListings}  icon={Building2} />
        <StatCard label="Booking Requests" value={counts.totalRequests}  icon={CalendarClock}
          hint={`${counts.pendingRequests} pending`} />
        <StatCard label="Pending Requests" value={counts.pendingRequests} icon={Clock} />
      </div>

      {/* ── Charts row ──────────────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Monthly growth */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Growth (last 6 months)</CardTitle>
            <CardDescription>New users and listings per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={growthConfig} className="h-[260px] w-full">
              <AreaChart data={charts.monthlyGrowth} margin={{ left: -16, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={32} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <defs>
                  <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-users)" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="var(--color-users)" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="fillListings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-listings)" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="var(--color-listings)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <Area dataKey="users"    type="monotone" stroke="var(--color-users)"    fill="url(#fillUsers)"    strokeWidth={2} />
                <Area dataKey="listings" type="monotone" stroke="var(--color-listings)" fill="url(#fillListings)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Requests by status (pie) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Requests by Status</CardTitle>
            <CardDescription>Distribution of all booking requests</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={statusConfig} className="mx-auto aspect-square max-h-[260px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="status" hideLabel />} />
                <Pie data={charts.requestsByStatus} dataKey="count" nameKey="status" innerRadius={55} strokeWidth={3}>
                  {charts.requestsByStatus.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? 'var(--chart-5)'} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-2 flex justify-center gap-4">
              {charts.requestsByStatus.map((s) => (
                <div key={s.status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[s.status] }} />
                  <span className="capitalize">{s.status}</span>
                  <span className="font-medium text-foreground">{s.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Listings by type (bar) ──────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Listings by Property Type</CardTitle>
          <CardDescription>How the catalogue breaks down</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={typeConfig} className="h-[240px] w-full">
            <BarChart data={charts.listingsByType} margin={{ left: -16, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="type" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={32} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* ── Recent activity ─────────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent Users</CardTitle>
            <Link href="/dashboard/admin/users" className="text-xs text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentUsers.length === 0 && <p className="text-sm text-muted-foreground">No users yet.</p>}
            {recentUsers.map((u) => (
              <div key={u._id} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{u.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                </div>
                {u.status === 'suspended'
                  ? <Badge variant="destructive" className="shrink-0"><ShieldAlert className="mr-1 h-3 w-3" />Suspended</Badge>
                  : u.role === 'admin'
                    ? <Badge className="shrink-0">Admin</Badge>
                    : <Badge variant="outline" className="shrink-0">User</Badge>}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent listings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent Listings</CardTitle>
            <Link href="/dashboard/admin/listings" className="text-xs text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentListings.length === 0 && <p className="text-sm text-muted-foreground">No listings yet.</p>}
            {recentListings.map((l) => (
              <Link key={l._id} href={`/listings/${l._id}`} className="block">
                <p className="truncate text-sm font-medium text-foreground hover:text-primary">{l.title}</p>
                <p className="text-xs text-muted-foreground">
                  {l.location} · ৳{Number(l.rentPerMonth).toLocaleString()} · {l.propertyType}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent Requests</CardTitle>
            <Link href="/dashboard/admin/requests" className="text-xs text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentRequests.length === 0 && <p className="text-sm text-muted-foreground">No requests yet.</p>}
            {recentRequests.map((r) => (
              <div key={r._id}>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-foreground">{r.listingTitle}</p>
                  <Badge
                    variant={r.status === 'accepted' ? 'default' : r.status === 'declined' ? 'destructive' : 'outline'}
                    className="shrink-0 capitalize"
                  >
                    {r.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{r.requesterName} · {fmtDate(r.createdAt)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
