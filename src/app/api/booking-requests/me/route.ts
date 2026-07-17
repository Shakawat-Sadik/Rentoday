import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { BookingRequest } from '@/lib/interfaces-types'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/booking-requests/me — protected
// Returns every booking request the current user has sent
export async function GET(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    await connectDB()

    const requests = await BookingRequest.find({ requesterId: auth.userId })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ requests })

  } catch (err) {
    console.error('[GET /api/booking-requests/me]', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
