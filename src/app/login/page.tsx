'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ThreeDMarquee } from '@/components/ui/3d-marquee'
import { StatefulButton, type ButtonState } from '@/components/motion/button/stateful'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// Apartment images from /public/assets for the 3D marquee
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
  '/assets/small-juvenile-bedroom-arrangement (1).jpg',
  '/assets/small-juvenile-bedroom-arrangement (2).jpg',
  '/assets/view-futuristic-bedroom-with-furniture.jpg',
  '/assets/3d-rendering-luxury-modern-living-room-with-fabric-sofa.jpg',
  '/assets/3d-rendering-modern-dining-room-living-room-with-luxury-decor.jpg',
  '/assets/3d-rendering-white-wood-living-room-near-bedroom-upstair.jpg',
  '/assets/3d-room-interior-with-classic-design-furniture.jpg',
  '/assets/261682_tiny.jpg',
  '/assets/bed-arrangements-still-life.jpg',
  '/assets/bringing-beach-home-collage.jpg',
  '/assets/hq720.jpg',
  "/assets/bringing-beach-home-collage.jpg",
  "/assets/261682_tiny.jpg",
  "/assets/3d-rendering-white-wood-living-room-near-bedroom-upstair.jpg",
  "/assets/3d-rendering-luxury-modern-living-room-with-fabric-sofa.jpg",
  "/assets/small-juvenile-bedroom-arrangement (2).jpg",
  "/assets/small-juvenile-bedroom-arrangement.jpg",
  "/assets/modern-indoor-living-room-with-comfortable-sofa-generative-ai.jpg",
  "/assets/luxury-bedroom-suite-resort-high-rise-hotel-with-working-table.jpg",
  "/assets/cozy-lively-home-interior-design.jpg",
  "/assets/3d-modern-bedroom-interior.jpg",
  "/assets/hq720.jpg",
  "/assets/bed-arrangements-still-life.jpg",
  "/assets/3d-room-interior-with-classic-design-furniture.jpg",
  "/assets/3d-rendering-modern-dining-room-living-room-with-luxury-decor.jpg",
  "/assets/view-futuristic-bedroom-with-furniture.jpg",
  "/assets/small-juvenile-bedroom-arrangement (1).jpg",
  "/assets/modern-studio-apartment-design-with-bedroom-living-space.jpg",
  "/assets/luxury-modern-style-bedroom-interior-hotel-bedroom-generative-ai-illustration.jpg",
  "/assets/hotel-room-interior-with-bedroom-area-living-space-kitchen.jpg",
  "/assets/3d-rendering-loft-luxury-living-room-with-shelf-near-dining-table.jpg",
  "/assets/3d-contemporary-bedroom-interior.jpg"
]

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [btnState, setBtnState] = useState<ButtonState>('idle')
  const [demoState, setDemoState] = useState<ButtonState>('idle')

  // Shared login logic used by both the main form and the demo button
  async function login(loginEmail: string, loginPassword: string, setBtn: (s: ButtonState) => void) {
    setError('')
    setBtn('loading')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Login failed.')
        setBtn('error')
        setTimeout(() => setBtn('idle'), 2000)
      } else {
        setBtn('success')
        // Small delay so the success state is visible before navigating
        setTimeout(() => router.push('/'), 900)
      }
    } catch {
      setError('Network error. Please try again.')
      setBtn('error')
      setTimeout(() => setBtn('idle'), 2000)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    login(email, password, setBtnState)
  }

  // Demo login: fills credentials AND submits immediately
  function handleDemoLogin() {
    const demoEmail    = 'user@rentoday.com'
    const demoPassword = '/User1997/'
    setEmail(demoEmail)
    setPassword(demoPassword)
    login(demoEmail, demoPassword, setDemoState)
  }

  return (
    <div className="flex min-h-screen">

      {/* ── Left: 3D Marquee ─────────────────────────────────────────────── */}
      <div className="relative hidden overflow-hidden bg-neutral-950 lg:block lg:w-1/2">
        <ThreeDMarquee images={MARQUEE_IMAGES} className="h-screen rounded-none" />
        {/* Dark gradient overlay so the branding text is readable */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
        <div className="absolute bottom-10 left-10">
          <p className="text-3xl font-bold text-white">RenToday</p>
          <p className="mt-1 text-neutral-300">Find your next home in Dhaka</p>
        </div>
      </div>

      {/* ── Right: Login Form ─────────────────────────────────────────────── */}
      <div className="flex w-full items-center justify-center bg-white p-6 dark:bg-black lg:w-1/2">
        <div className="w-full max-w-md">

          {/* Header */}
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Sign in to your RenToday account
          </p>

          {/* Form */}
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
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
              loadingText="Signing in…"
              successText="Signed in!"
              errorText="Try again"
            >
              Sign in
            </StatefulButton>
          </form>

          {/* Divider */}
          <div className="my-6 h-px bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

          {/* Demo Login button — pre-fills credentials AND submits */}
          <StatefulButton
            type="button"
            variant="outline"
            size="lg"
            state={demoState}
            className="w-full rounded-md"
            onClick={handleDemoLogin}
            loadingText="Logging in as demo…"
            successText="Logged in!"
            errorText="Try again"
          >
            Demo Login
          </StatefulButton>

          <p className="mt-8 text-center text-sm text-neutral-600 dark:text-neutral-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
              Sign up
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}

// ── Shared helper components (adapted from signup-form-demo) ──────────────────

function LabelInputContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex w-full flex-col space-y-2', className)}>
      {children}
    </div>
  )
}
