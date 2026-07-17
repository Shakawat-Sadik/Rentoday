import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { BookingRequest } from '@/lib/interfaces-types'
import { getUserFromRequest } from '@/lib/auth'

// PATCH /api/booking-requests/[id] — owner or admin only
// Accepts body: { status: "accepted" | "declined" }
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = getUserFromRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    await connectDB()
    const { id } = await params

    const booking = await BookingRequest.findById(id)
    if (!booking) {
      return NextResponse.json({ error: 'Booking request not found.' }, { status: 404 })
    }

    // Only the listing owner or an admin can update status
    if (booking.ownerId !== auth.userId && auth.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
    }

    const body = await request.json()
    const { status } = body

    if (!['accepted', 'declined'].includes(status)) {
      return NextResponse.json({ error: 'Status must be "accepted" or "declined".' }, { status: 400 })
    }

    booking.status = status
    await booking.save()

    return NextResponse.json({ booking })

  } catch (err) {
    console.error('[PATCH /api/booking-requests/[id]]', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
