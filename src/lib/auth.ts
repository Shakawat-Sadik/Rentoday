import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined in environment variables')

// Shape of data stored inside the JWT token
export interface TokenPayload {
  userId: string
  email: string
  role: 'user' | 'admin'
}

// Sign a new JWT — expires in 7 days
export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: '7d' })
}

// Verify a JWT string and return its payload, or null if invalid/expired
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET as string) as TokenPayload
  } catch {
    // Token is expired, tampered, or malformed — treat as unauthenticated
    return null
  }
}

// ── For use in API route handlers (NextRequest has a .cookies helper) ─────────
export function getUserFromRequest(request: NextRequest): TokenPayload | null {
  const token = request.cookies.get('token')?.value
  if (!token) return null
  return verifyToken(token)
}

// ── For use in Server Components and page-level auth guards ───────────────────
// Must be called inside an async Server Component or async page function.
export async function getUserFromCookies(): Promise<TokenPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null
  return verifyToken(token)
}

// Cookie options reused by login, register, and logout routes
export const COOKIE_OPTIONS = {
  httpOnly: true,                                      // JS cannot read this cookie
  secure: process.env.NODE_ENV === 'production',       // HTTPS only in production
  sameSite: 'lax' as const,                            // protects against CSRF
  path: '/',
  maxAge: 7 * 24 * 60 * 60,                           // 7 days in seconds
}
