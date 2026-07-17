import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Listing } from '@/lib/interfaces-types'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/listings/mine — protected
// Admins see all listings; regular users see only their own
export async function GET(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    await connectDB()

    const filter = auth.role === 'admin' ? {} : { ownerId: auth.userId }

    const listings = await Listing.find(filter).sort({ createdAt: -1 }).lean()

    return NextResponse.json({ listings })

  } catch (err) {
    console.error('[GET /api/listings/mine]', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
