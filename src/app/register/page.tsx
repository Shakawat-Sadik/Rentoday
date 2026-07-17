'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ThreeDMarquee } from '@/components/ui/3d-marquee'
import { StatefulButton, type ButtonState } from '@/components/motion/button/stateful'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const MARQUEE_IMAGES = [
  '/assets/3d-contemporary-bedroom-interior.jpg',
  '/assets/3d-modern-bedroom-interior.jpg',
  '/assets/3d-rendering-loft-luxury-living-room-with-shelf-near-dining-table.jpg',
  '/assets/cozy-lively-home-interior-design.jpg',
  '/assets/hotel-room-interior-with-bedroom-area-living-space-kitchen.jpg',
  '/assets/luxury-bedroom-suite-resort-high-rise-hotel-with-working-table.jpg',
  '/assets/luxury-modern-style-bedroom-interior-hotel-bedroom-generative-ai-illustration.jpg',
  '/assets/modern-indoor-living-room-with-comfortable-sofa-generative-ai.jpg',
  '/assets/modern-studio-apartment-design-with-bedroom-living-space.jpg',
  '/assets/small-juvenile-bedroom-arrangement.jpg',
  '/assets/view-futuristic-bedroom-with-furniture.jpg',
]

// Today's date formatted as YYYY-MM-DD — used as the max value for the DOB picker
const TODAY = new Date().toISOString().split('T')[0]

export default function RegisterPage() {
  const router = useRouter()

  const [name, setName]               = useState('')
  const [email, setEmail]             = useState('')
  const [phone, setPhone]             = useState('')
  const [gender, setGender]           = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [password, setPassword]       = useState('')
  const [error, setError]             = useState('')
  const [btnState, setBtnState]       = useState<ButtonState>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setBtnState('loading')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, gender, dateOfBirth, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed.')
        setBtnState('error')
        setTimeout(() => setBtnState('idle'), 2000)
      } else {
        setBtnState('success')
        setTimeout(() => router.push('/'), 900)
      }
    } catch {
      setError('Network error. Please try again.')
      setBtnState('error')
      setTimeout(() => setBtnState('idle'), 2000)
    }
  }

  return (
    <div className="flex min-h-screen">

      {/* ── Left: Registration Form ───────────────────────────────────────── */}
      <div className="flex w-full items-center justify-center bg-white p-6 dark:bg-black lg:w-1/2">
        <div className="w-full max-w-md">

          {/* Header */}
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Join RenToday and find your perfect home in Dhaka
          </p>

          {/* Form */}
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>

            <LabelInputContainer>
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Arif Rahman"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                autoComplete="tel"
              />
              <p className="text-xs text-neutral-500">Bangladeshi format: 01XXXXXXXXX or +880XXXXXXXXX</p>
            </LabelInputContainer>

            {/* Gender — radio buttons */}
            <LabelInputContainer>
              <Label>Gender</Label>
              <div className="flex flex-wrap gap-4 pt-1">
                {(['male', 'female', 'prefer not to say'] as const).map((option) => (
                  <label
                    key={option}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors',
                      gender === option
                        ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300'
                        : 'border-neutral-300 text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-400',
                    )}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={option}
                      checked={gender === option}
                      onChange={() => setGender(option)}
                      className="sr-only"
                      required
                    />
                    <span className="capitalize">{option}</span>
                  </label>
                ))}
              </div>
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="dob">Date of birth</Label>
              <Input
                id="dob"
                type="date"
                max={TODAY}
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
              />
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
              />
            </LabelInputContainer>

            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
                {error}
              </p>
            )}

            <StatefulButton
              type="submit"
              state={btnState}
              size="lg"
              className="w-full rounded-md"
              loadingText="Creating account…"
              successText="Account created!"
              errorText="Try again"
            >
              Create account
            </StatefulButton>
          </form>

          <p className="mt-8 text-center text-sm text-neutral-600 dark:text-neutral-400">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
              Sign in
            </Link>
          </p>

        </div>
      </div>

      {/* ── Right: 3D Marquee ─────────────────────────────────────────────── */}
      <div className="relative hidden overflow-hidden bg-neutral-950 lg:block lg:w-1/2">
        <ThreeDMarquee images={MARQUEE_IMAGES} className="h-screen rounded-none" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
        <div className="absolute bottom-10 right-10 text-right">
          <p className="text-3xl font-bold text-white">RenToday</p>
          <p className="mt-1 text-neutral-300">Thousands of listings across Dhaka</p>
        </div>
      </div>

    </div>
  )
}

// ── Shared helper (adapted from signup-form-demo) ─────────────────────────────

function LabelInputContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex w-full flex-col space-y-2', className)}>
      {children}
    </div>
  )
}
