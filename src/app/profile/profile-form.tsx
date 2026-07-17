'use client'

import { useEffect, useState } from 'react'
import { User as UserIcon } from 'lucide-react'

import { RadioGroup, RadioGroupItem } from '@/components/motion/radio'
import { WheelPicker, type WheelPickerOption } from '@/components/motion/wheel-picker'
import { StatefulButton, type ButtonState } from '@/components/motion/button/stateful'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'

// ── Date-of-birth wheel options ───────────────────────────────────────────────

const DAY_OPTIONS: WheelPickerOption[] = Array.from({ length: 31 }, (_, i) =>
  String(i + 1),
)

const MONTH_OPTIONS: WheelPickerOption[] = [
  { label: 'January',   value: '01' }, { label: 'February',  value: '02' },
  { label: 'March',     value: '03' }, { label: 'April',     value: '04' },
  { label: 'May',       value: '05' }, { label: 'June',      value: '06' },
  { label: 'July',      value: '07' }, { label: 'August',    value: '08' },
  { label: 'September', value: '09' }, { label: 'October',   value: '10' },
  { label: 'November',  value: '11' }, { label: 'December',  value: '12' },
]

const currentYear = new Date().getFullYear()
const YEAR_OPTIONS: WheelPickerOption[] = Array.from(
  { length: currentYear - 1939 },
  (_, i) => String(currentYear - i - 1), // newest first
)

// ── Profile form ──────────────────────────────────────────────────────────────

interface UserProfile {
  _id: string
  name: string
  email: string
  phone: string
  gender: string
  dateOfBirth: string
  role: string
}

export default function ProfileForm() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Editable fields
  const [name,   setName]   = useState('')
  const [phone,  setPhone]  = useState('')
  const [gender, setGender] = useState('')

  // DOB — three separate wheels
  const [dobDay,   setDobDay]   = useState('1')
  const [dobMonth, setDobMonth] = useState('01')
  const [dobYear,  setDobYear]  = useState('1990')

  // Submit state
  const [btnState, setBtnState] = useState<ButtonState>('idle')
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')

  // ── Load current profile on mount ───────────────────────────────────────────

  useEffect(() => {
    fetch('/api/users/me')
      .then((r) => r.json())
      .then((data) => {
        const u: UserProfile = data.user
        setProfile(u)
        setName(u.name)
        setPhone(u.phone)
        setGender(u.gender)

        // Parse stored DOB into separate day/month/year for the wheels
        const dob = new Date(u.dateOfBirth)
        setDobDay(String(dob.getDate()))
        setDobMonth(String(dob.getMonth() + 1).padStart(2, '0'))
        setDobYear(String(dob.getFullYear()))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // ── Save handler ─────────────────────────────────────────────────────────────

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setBtnState('loading')

    // Reconstruct ISO date from the three wheels
    const day   = dobDay.padStart(2, '0')
    const dateOfBirth = `${dobYear}-${dobMonth}-${day}`

    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone, gender, dateOfBirth }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to save.')
        setBtnState('error')
        setTimeout(() => setBtnState('idle'), 2000)
      } else {
        setProfile(data.user)
        setBtnState('success')
        setSuccess('Profile saved successfully.')
        setTimeout(() => setBtnState('idle'), 2000)
      }
    } catch {
      setError('Network error. Please try again.')
      setBtnState('error')
      setTimeout(() => setBtnState('idle'), 2000)
    }
  }

  // ── Loading state ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <main className="mx-auto max-w-xl px-4 py-12 sm:px-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-32 w-full" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">

        {/* ── Avatar + identity header ─────────────────────────────────────── */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
            {profile?.name
              ? profile.name.charAt(0).toUpperCase()
              : <UserIcon className="h-7 w-7" />}
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{profile?.name}</h1>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
            <span className="mt-0.5 inline-block rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize text-foreground">
              {profile?.role}
            </span>
          </div>
        </div>

        {/* ── Edit form ────────────────────────────────────────────────────── */}
        <form onSubmit={handleSave} className="space-y-6">

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="profile-name">Full name</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>

          {/* Email — read-only */}
          <div className="space-y-1.5">
            <Label htmlFor="profile-email">Email address</Label>
            <Input
              id="profile-email"
              value={profile?.email ?? ''}
              disabled
              className="opacity-60"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="profile-phone">Phone number</Label>
            <Input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              required
            />
            <p className="text-xs text-muted-foreground">Bangladeshi format: 01XXXXXXXXX or +880XXXXXXXXX</p>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label>Gender</Label>
            <RadioGroup
              value={gender}
              onValueChange={setGender}
              orientation="horizontal"
            >
              <RadioGroupItem value="male"              label="Male" />
              <RadioGroupItem value="female"            label="Female" />
              <RadioGroupItem value="prefer not to say" label="Prefer not to say" />
            </RadioGroup>
          </div>

          {/* Date of birth — three wheel-pickers */}
          <div className="space-y-2">
            <Label>Date of birth</Label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="mb-1.5 text-xs text-muted-foreground">Day</p>
                <WheelPicker
                  options={DAY_OPTIONS}
                  value={dobDay}
                  onValueChange={setDobDay}
                  visibleCount={5}
                  itemHeight={36}
                  aria-label="Day of birth"
                />
              </div>
              <div>
                <p className="mb-1.5 text-xs text-muted-foreground">Month</p>
                <WheelPicker
                  options={MONTH_OPTIONS}
                  value={dobMonth}
                  onValueChange={setDobMonth}
                  visibleCount={5}
                  itemHeight={36}
                  aria-label="Month of birth"
                />
              </div>
              <div>
                <p className="mb-1.5 text-xs text-muted-foreground">Year</p>
                <WheelPicker
                  options={YEAR_OPTIONS}
                  value={dobYear}
                  onValueChange={setDobYear}
                  visibleCount={5}
                  itemHeight={36}
                  aria-label="Year of birth"
                />
              </div>
            </div>
          </div>

          {/* Error / success messages */}
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          {success && !error && (
            <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
              {success}
            </p>
          )}

          {/* Save button */}
          <StatefulButton
            type="submit"
            state={btnState}
            size="lg"
            loadingText="Saving…"
            successText="Saved!"
            errorText="Try again"
            className="w-full rounded-md"
          >
            Save profile
          </StatefulButton>

        </form>
      </div>
    </main>
  )
}
