import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User, Listing, BookingRequest } from '@/lib/interfaces-types'
import { getAdminFromRequest } from '@/lib/auth'

// GET /api/admin/stats — admin only
// Returns headline counts, recent records, and pre-aggregated chart data
export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
    }

    await connectDB()

    // ── Headline counts ─────────────────────────────────────────────────────
    const [totalUsers, totalListings, totalRequests, suspendedUsers, pendingRequests] =
      await Promise.all([
        User.countDocuments({}),
        Listing.countDocuments({}),
        BookingRequest.countDocuments({}),
        User.countDocuments({ status: 'suspended' }),
        BookingRequest.countDocuments({ status: 'pending' }),
      ])

    // ── Recent records (latest 6 each) ──────────────────────────────────────
    const [recentUsers, recentListings, recentRequests] = await Promise.all([
      User.find({}).sort({ createdAt: -1 }).limit(6)
        .select('name email role status createdAt').lean(),
      Listing.find({}).sort({ createdAt: -1 }).limit(6)
        .select('title location rentPerMonth propertyType ownerEmail createdAt').lean(),
      BookingRequest.find({}).sort({ createdAt: -1 }).limit(6)
        .select('listingTitle requesterName status proposedDate createdAt').lean(),
    ])

    // ── Chart: listings grouped by property type ────────────────────────────
    const listingsByTypeAgg = await Listing.aggregate([
      { $group: { _id: '$propertyType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
    const listingsByType = listingsByTypeAgg.map((r) => ({
      type: r._id || 'Unknown',
      count: r.count,
    }))

    // ── Chart: booking requests grouped by status ───────────────────────────
    const requestsByStatusAgg = await BookingRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ])
    const statusMap: Record<string, number> = { pending: 0, accepted: 0, declined: 0 }
    requestsByStatusAgg.forEach((r) => { statusMap[r._id] = r.count })
    const requestsByStatus = Object.entries(statusMap).map(([status, count]) => ({ status, count }))

    // ── Chart: users + listings created over the last 6 months ──────────────
    const now = new Date()
    const months: { key: string; label: string; start: Date; end: Date }[] = []
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      months.push({
        key: `${start.getFullYear()}-${start.getMonth()}`,
        label: start.toLocaleDateString('en-US', { month: 'short' }),
        start,
        end,
      })
    }

    const monthlyGrowth = await Promise.all(
      months.map(async (m) => {
        const [users, listings] = await Promise.all([
          User.countDocuments({ createdAt: { $gte: m.start, $lt: m.end } }),
          Listing.countDocuments({ createdAt: { $gte: m.start, $lt: m.end } }),
        ])
        return { month: m.label, users, listings }
      }),
    )

    return NextResponse.json({
      counts: {
        totalUsers,
        totalListings,
        totalRequests,
        suspendedUsers,
        pendingRequests,
      },
      recentUsers,
      recentListings,
      recentRequests,
      charts: {
        listingsByType,
        requestsByStatus,
        monthlyGrowth,
      },
    })

  } catch (err) {
    console.error('[GET /api/admin/stats]', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
