import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Listing, User } from '@/lib/interfaces-types'
import { getUserFromRequest } from '@/lib/auth'

const PAGE_SIZE = 12

// GET /api/listings
// Query params: query, location, minRent, maxRent, sort (price-asc|price-desc|newest), page
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const query    = searchParams.get('query')?.trim()
    const location = searchParams.get('location')?.trim()
    const minRent  = searchParams.get('minRent')
    const maxRent  = searchParams.get('maxRent')
    const sort     = searchParams.get('sort') || 'newest'
    const page     = Math.max(1, parseInt(searchParams.get('page') || '1', 10))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {}

    // Text search across title and location (case-insensitive)
    if (query) {
      filter.$or = [
        { title:    { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
      ]
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' }
    }

    if (minRent || maxRent) {
      filter.rentPerMonth = {}
      if (minRent) filter.rentPerMonth.$gte = Number(minRent)
      if (maxRent) filter.rentPerMonth.$lte = Number(maxRent)
    }

    // Sort order
    let sortObj: Record<string, 1 | -1> = { createdAt: -1 }
    if (sort === 'price-asc')  sortObj = { rentPerMonth:  1 }
    if (sort === 'price-desc') sortObj = { rentPerMonth: -1 }

    const total   = await Listing.countDocuments(filter)
    const listings = await Listing.find(filter)
      .sort(sortObj)
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean()

    return NextResponse.json({
      listings,
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
    })

  } catch (err) {
    console.error('[GET /api/listings]', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

// POST /api/listings — protected
export async function POST(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    await connectDB()

    // Fetch owner's phone to denormalize into the listing
    const owner = await User.findById(auth.userId).lean()
    if (!owner) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    }

    const body = await request.json()
    const {
      title, shortDescription, fullDescription,
      rentPerMonth, location, bedrooms,
      propertyType, amenities, images,
    } = body

    // Required field validation
    if (!title?.trim())            return NextResponse.json({ error: 'Title is required.' },             { status: 400 })
    if (!shortDescription?.trim()) return NextResponse.json({ error: 'Short description is required.' }, { status: 400 })
    if (!fullDescription?.trim())  return NextResponse.json({ error: 'Full description is required.' },  { status: 400 })
    if (!location?.trim())         return NextResponse.json({ error: 'Location is required.' },          { status: 400 })
    if (!propertyType?.trim())     return NextResponse.json({ error: 'Property type is required.' },     { status: 400 })

    const rent = Number(rentPerMonth)
    if (!rent || rent < 1) {
      return NextResponse.json({ error: 'Rent per month must be a positive number.' }, { status: 400 })
    }

    const beds = Number(bedrooms)
    if (!Number.isInteger(beds) || beds < 1) {
      return NextResponse.json({ error: 'Bedrooms must be a positive integer.' }, { status: 400 })
    }

    const validTypes = ['Apartment', 'Studio', 'Sublet/Room', 'Bachelor Mess']
    if (!validTypes.includes(propertyType)) {
      return NextResponse.json({ error: `Property type must be one of: ${validTypes.join(', ')}.` }, { status: 400 })
    }

    const listing = await Listing.create({
      title:            title.trim(),
      shortDescription: shortDescription.trim(),
      fullDescription:  fullDescription.trim(),
      rentPerMonth:     rent,
      location:         location.trim(),
      bedrooms:         beds,
      propertyType,
      amenities:        Array.isArray(amenities) ? amenities : [],
      images:           Array.isArray(images)    ? images    : [],
      ownerId:          auth.userId,
      ownerEmail:       auth.email,
      ownerPhone:       owner.phone as string,
      rating:           0,
    })

    return NextResponse.json({ listing }, { status: 201 })

  } catch (err) {
    console.error('[POST /api/listings]', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
