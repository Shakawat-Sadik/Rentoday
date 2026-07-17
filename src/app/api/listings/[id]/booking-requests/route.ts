import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Listing, BookingRequest } from '@/lib/interfaces-types'
import { getUserFromRequest } from '@/lib/auth'

// POST /api/listings/[id]/booking-requests — protected
export async function POST(
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

    const listing = await Listing.findById(id).lean()
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
    }

    const body = await request.json()
    const { proposedDate, message, requesterName } = body

    if (!proposedDate) {
      return NextResponse.json({ error: 'Proposed date is required.' }, { status: 400 })
    }

    const date = new Date(proposedDate)
    if (isNaN(date.getTime()) || date <= new Date()) {
      return NextResponse.json({ error: 'Proposed date must be a future date.' }, { status: 400 })
    }

    const bookingRequest = await BookingRequest.create({
      listingId:     String(listing._id),
      listingTitle:  listing.title as string,
      requesterId:   auth.userId,
      requesterName: requesterName || auth.email,
      ownerId:       listing.ownerId as string,
      proposedDate:  date,
      message:       message?.trim() || '',
      status:        'pending',
    })

    return NextResponse.json({ bookingRequest }, { status: 201 })

  } catch (err) {
    console.error('[POST /api/listings/[id]/booking-requests]', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
