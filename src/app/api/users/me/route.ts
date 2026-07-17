import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/lib/interfaces-types'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/users/me — return the current user's profile (protected)
export async function GET(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    await connectDB()

    const user = await User.findById(auth.userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        _id:         String(user._id),
        name:        user.name,
        email:       user.email,
        phone:       user.phone,
        gender:      user.gender,
        dateOfBirth: user.dateOfBirth,
        role:        user.role,
        createdAt:   user.createdAt,
      },
    })

  } catch (err) {
    console.error('[GET /api/users/me]', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

// PATCH /api/users/me — update name, phone, gender, dateOfBirth (protected)
// Email and password change are out of scope per PRD section 10
export async function PATCH(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
    const { name, phone, gender, dateOfBirth } = body

    // Build the update object with only fields that were provided
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = {}

    if (name !== undefined) {
      if (!name.trim()) return NextResponse.json({ error: 'Name cannot be empty.' }, { status: 400 })
      updates.name = name.trim()
    }

    if (phone !== undefined) {
      const PHONE_REGEX = /^(\+880|0)1[3-9]\d{8}$/
      if (!PHONE_REGEX.test(phone)) {
        return NextResponse.json(
          { error: 'Phone must be a valid Bangladeshi number (e.g. 01XXXXXXXXX).' },
          { status: 400 },
        )
      }
      updates.phone = phone
    }

    if (gender !== undefined) {
      const validGenders = ['male', 'female', 'prefer not to say']
      if (!validGenders.includes(gender)) {
        return NextResponse.json({ error: 'Gender must be male, female, or prefer not to say.' }, { status: 400 })
      }
      updates.gender = gender
    }

    if (dateOfBirth !== undefined) {
      const dob = new Date(dateOfBirth)
      if (isNaN(dob.getTime()) || dob >= new Date()) {
        return NextResponse.json({ error: 'Date of birth must be a valid past date.' }, { status: 400 })
      }
      updates.dateOfBirth = dob
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided to update.' }, { status: 400 })
    }

    const updated = await User.findByIdAndUpdate(auth.userId, updates, { new: true })
    if (!updated) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    }

    return NextResponse.json({
      message: 'Profile updated successfully.',
      user: {
        _id:         String(updated._id),
        name:        updated.name,
        email:       updated.email,
        phone:       updated.phone,
        gender:      updated.gender,
        dateOfBirth: updated.dateOfBirth,
        role:        updated.role,
      },
    })

  } catch (err) {
    console.error('[PATCH /api/users/me]', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
