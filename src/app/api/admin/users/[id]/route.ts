import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/lib/interfaces-types'
import { getAdminFromRequest } from '@/lib/auth'

const PHONE_REGEX = /^(\+880|0)1[3-9]\d{8}$/

// PATCH /api/admin/users/[id] — admin only
// Modify profile fields, role, or status (suspend / reactivate)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
    }

    await connectDB()
    const { id } = await params

    const user = await User.findById(id)
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    }

    const body = await request.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = {}

    if (body.name !== undefined) {
      if (!body.name.trim()) return NextResponse.json({ error: 'Name cannot be empty.' }, { status: 400 })
      updates.name = body.name.trim()
    }

    if (body.phone !== undefined) {
      if (!PHONE_REGEX.test(body.phone)) {
        return NextResponse.json({ error: 'Phone must be a valid Bangladeshi number.' }, { status: 400 })
      }
      updates.phone = body.phone
    }

    if (body.gender !== undefined) {
      if (!['male', 'female', 'prefer not to say'].includes(body.gender)) {
        return NextResponse.json({ error: 'Invalid gender.' }, { status: 400 })
      }
      updates.gender = body.gender
    }

    if (body.dateOfBirth !== undefined) {
      const dob = new Date(body.dateOfBirth)
      if (isNaN(dob.getTime()) || dob >= new Date()) {
        return NextResponse.json({ error: 'Date of birth must be a valid past date.' }, { status: 400 })
      }
      updates.dateOfBirth = dob
    }

    if (body.role !== undefined) {
      if (!['user', 'admin'].includes(body.role)) {
        return NextResponse.json({ error: 'Role must be user or admin.' }, { status: 400 })
      }
      // Guard: an admin cannot demote themselves (avoids locking out the last admin)
      if (id === admin.userId && body.role !== 'admin') {
        return NextResponse.json({ error: 'You cannot change your own role.' }, { status: 400 })
      }
      updates.role = body.role
    }

    if (body.status !== undefined) {
      if (!['active', 'suspended'].includes(body.status)) {
        return NextResponse.json({ error: 'Status must be active or suspended.' }, { status: 400 })
      }
      // Guard: an admin cannot suspend themselves
      if (id === admin.userId && body.status === 'suspended') {
        return NextResponse.json({ error: 'You cannot suspend your own account.' }, { status: 400 })
      }
      updates.status = body.status
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided to update.' }, { status: 400 })
    }

    const updated = await User.findByIdAndUpdate(id, updates, { new: true })
      .select('-password')
      .lean()

    return NextResponse.json({ user: updated })

  } catch (err) {
    console.error('[PATCH /api/admin/users/[id]]', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

// DELETE /api/admin/users/[id] — admin only
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
    }

    await connectDB()
    const { id } = await params

    // Guard: an admin cannot delete their own account
    if (id === admin.userId) {
      return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 })
    }

    const user = await User.findById(id)
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    }

    await User.findByIdAndDelete(id)

    return NextResponse.json({ message: 'User deleted.' })

  } catch (err) {
    console.error('[DELETE /api/admin/users/[id]]', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
