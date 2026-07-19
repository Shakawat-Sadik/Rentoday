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

// PATCH /api/listings/[id] — owner or admin only (edit listing fields)
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

    const listing = await Listing.findById(id)
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
    }

    // Only the owner or an admin can edit
    if (listing.ownerId !== auth.userId && auth.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
    }

    const body = await request.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = {}

    if (body.title !== undefined) {
      if (!body.title.trim()) return NextResponse.json({ error: 'Title cannot be empty.' }, { status: 400 })
      updates.title = body.title.trim()
    }
    if (body.shortDescription !== undefined) updates.shortDescription = String(body.shortDescription).trim()
    if (body.fullDescription  !== undefined) updates.fullDescription  = String(body.fullDescription).trim()

    if (body.rentPerMonth !== undefined) {
      const rent = Number(body.rentPerMonth)
      if (!rent || rent < 1) return NextResponse.json({ error: 'Rent per month must be a positive number.' }, { status: 400 })
      updates.rentPerMonth = rent
    }

    if (body.location !== undefined) {
      if (!body.location.trim()) return NextResponse.json({ error: 'Location is required.' }, { status: 400 })
      updates.location = body.location.trim()
    }

    if (body.bedrooms !== undefined) {
      const beds = Number(body.bedrooms)
      if (!Number.isInteger(beds) || beds < 1) return NextResponse.json({ error: 'Bedrooms must be a positive integer.' }, { status: 400 })
      updates.bedrooms = beds
    }

    if (body.propertyType !== undefined) {
      const validTypes = ['Apartment', 'Studio', 'Sublet/Room', 'Bachelor Mess']
      if (!validTypes.includes(body.propertyType)) {
        return NextResponse.json({ error: `Property type must be one of: ${validTypes.join(', ')}.` }, { status: 400 })
      }
      updates.propertyType = body.propertyType
    }

    if (body.amenities !== undefined) updates.amenities = Array.isArray(body.amenities) ? body.amenities : []
    if (body.images    !== undefined) updates.images    = Array.isArray(body.images)    ? body.images    : []

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided to update.' }, { status: 400 })
    }

    const updated = await Listing.findByIdAndUpdate(id, updates, { new: true }).lean()
    return NextResponse.json({ listing: updated })

  } catch (err) {
    console.error('[PATCH /api/listings/[id]]', err)
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
