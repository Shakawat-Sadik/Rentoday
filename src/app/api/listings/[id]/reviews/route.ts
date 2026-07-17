import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Review } from '@/lib/interfaces-types'

// GET /api/listings/[id]/reviews
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB()
    const { id } = await params

    const reviews = await Review.find({ listingId: id })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ reviews })

  } catch (err) {
    console.error('[GET /api/listings/[id]/reviews]', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
