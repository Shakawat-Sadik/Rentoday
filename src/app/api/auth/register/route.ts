import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import { User } from '@/lib/interfaces-types'
import { signToken, COOKIE_OPTIONS } from '@/lib/auth'

// Basic email format check
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Bangladesh phone: accepts +8801XXXXXXXX or 01XXXXXXXX (11–13 chars)
const PHONE_REGEX = /^(\+880|0)1[3-9]\d{8}$/

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { name, email, phone, gender, dateOfBirth, password } = body

    // ── Validate required fields ───────────────────────────────────────────────
    if (!name || !email || !phone || !gender || !dateOfBirth || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    if (!PHONE_REGEX.test(phone)) {
      return NextResponse.json(
        { error: 'Phone must be a valid Bangladeshi number (e.g. 01XXXXXXXXX or +880XXXXXXXXX).' },
        { status: 400 },
      )
    }

    const validGenders = ['male', 'female', 'prefer not to say']
    if (!validGenders.includes(gender)) {
      return NextResponse.json({ error: 'Gender must be male, female, or prefer not to say.' }, { status: 400 })
    }

    // Date of birth must be a valid date in the past
    const dob = new Date(dateOfBirth)
    if (isNaN(dob.getTime()) || dob >= new Date()) {
      return NextResponse.json({ error: 'Date of birth must be a valid past date.' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })
    }

    // ── Check email uniqueness ─────────────────────────────────────────────────
    const existing = await User.findOne({ email: email.toLowerCase().trim() })
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
    }

    // ── Hash password and create user ──────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone,
      gender,
      dateOfBirth: dob,
      role: 'user',
    })

    // ── Issue JWT and set cookie ───────────────────────────────────────────────
    const token = signToken({
      userId: String(newUser._id),
      email: newUser.email as string,
      role: 'user',
    })

    const response = NextResponse.json(
      {
        message: 'Account created successfully.',
        user: {
          _id:         String(newUser._id),
          name:        newUser.name,
          email:       newUser.email,
          phone:       newUser.phone,
          gender:      newUser.gender,
          dateOfBirth: newUser.dateOfBirth,
          role:        newUser.role,
        },
      },
      { status: 201 },
    )

    response.cookies.set('token', token, COOKIE_OPTIONS)
    return response

  } catch (err) {
    console.error('[POST /api/auth/register]', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
