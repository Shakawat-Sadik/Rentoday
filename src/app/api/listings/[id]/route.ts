import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Listing } from '@/lib/interfaces-types'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/listings/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB()
    const { id } = await params

    const listing = await Listing.findById(id).lean()
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
    }

    return NextResponse.json({ listing })

  } catch (err) {
    console.error('[GET /api/listings/[id]]', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

// DELETE /api/listings/[id] — owner or admin only
export async function DELETE(
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

    const listing = await Listing.findById(id)
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
    }

    // Only the owner or an admin can delete
    if (listing.ownerId !== auth.userId && auth.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
    }

    await Listing.findByIdAndDelete(id)

    return NextResponse.json({ message: 'Listing deleted.' })

  } catch (err) {
    console.error('[DELETE /api/listings/[id]]', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
