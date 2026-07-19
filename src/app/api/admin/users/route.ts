import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import { User } from '@/lib/interfaces-types'
import { getAdminFromRequest } from '@/lib/auth'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^(\+880|0)1[3-9]\d{8}$/

// GET /api/admin/users — admin only, list every user (without passwords)
export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
    }

    await connectDB()

    const users = await User.find({})
      .sort({ createdAt: -1 })
      .select('-password')
      .lean()

    return NextResponse.json({ users })

  } catch (err) {
    console.error('[GET /api/admin/users]', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

// POST /api/admin/users — admin only, create a user (role selectable)
export async function POST(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
    }

    await connectDB()

    const body = await request.json()
    const { name, email, phone, gender, dateOfBirth, password, role } = body

    if (!name || !email || !phone || !gender || !dateOfBirth || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }
    if (!PHONE_REGEX.test(phone)) {
      return NextResponse.json({ error: 'Phone must be a valid Bangladeshi number.' }, { status: 400 })
    }
    const validGenders = ['male', 'female', 'prefer not to say']
    if (!validGenders.includes(gender)) {
      return NextResponse.json({ error: 'Invalid gender.' }, { status: 400 })
    }
    const dob = new Date(dateOfBirth)
    if (isNaN(dob.getTime()) || dob >= new Date()) {
      return NextResponse.json({ error: 'Date of birth must be a valid past date.' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })
    }
    if (role !== undefined && !['user', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Role must be user or admin.' }, { status: 400 })
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() })
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone,
      gender,
      dateOfBirth: dob,
      role: role || 'user',
      status: 'active',
    })

    // Never return the password hash
    const { password: _pw, ...safe } = newUser.toObject()
    void _pw
    return NextResponse.json({ user: safe }, { status: 201 })

  } catch (err) {
    console.error('[POST /api/admin/users]', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
