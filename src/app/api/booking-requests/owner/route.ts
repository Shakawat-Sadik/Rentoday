import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { BookingRequest } from '@/lib/interfaces-types'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/booking-requests/owner — protected
// Owner sees requests on their own listings; admin sees all
export async function GET(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    await connectDB()

    // Admins see every request; regular users only see their own
    const filter = auth.role === 'admin' ? {} : { ownerId: auth.userId }

    const requests = await BookingRequest.find(filter)
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ requests })

  } catch (err) {
    console.error('[GET /api/booking-requests/owner]', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
