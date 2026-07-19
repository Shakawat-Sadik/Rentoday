import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import { User } from '@/lib/interfaces-types'
import { signToken, COOKIE_OPTIONS } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }

    // Find user — use .select('+password') pattern is not needed here since
    // we didn't exclude it from the schema; we just never return it in responses
    const user = await User.findOne({ email: email.toLowerCase().trim() })

    // Use a generic error message to avoid leaking whether the email exists
    const INVALID_MSG = 'Invalid email or password.'

    if (!user) {
      return NextResponse.json({ error: INVALID_MSG }, { status: 401 })
    }

    const passwordMatch = await bcrypt.compare(password, user.password as string)
    if (!passwordMatch) {
      return NextResponse.json({ error: INVALID_MSG }, { status: 401 })
    }

    // Suspended accounts cannot log in (checked after password so we don't leak
    // account existence to someone guessing credentials)
    if (user.status === 'suspended') {
      return NextResponse.json(
        { error: 'Your account has been suspended. Please contact support.' },
        { status: 403 },
      )
    }

    // Issue JWT and set httpOnly cookie
    const token = signToken({
      userId: String(user._id),
      email:  user.email  as string,
      role:   user.role   as 'user' | 'admin',
    })

    const response = NextResponse.json({
      message: 'Logged in successfully.',
      user: {
        _id:         String(user._id),
        name:        user.name,
        email:       user.email,
        phone:       user.phone,
        gender:      user.gender,
        dateOfBirth: user.dateOfBirth,
        role:        user.role,
      },
    })

    response.cookies.set('token', token, COOKIE_OPTIONS)
    return response

  } catch (err) {
    console.error('[POST /api/auth/login]', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
