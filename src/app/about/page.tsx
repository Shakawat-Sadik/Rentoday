import Link from 'next/link'
import {
  Building2,
  Target,
  Heart,
  Shield,
  Users,
  Zap,
  MapPin,
  Star,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const VALUES = [
  {
    icon: Shield,
    title: 'Trust & Transparency',
    description:
      'Every listing is posted by a verified account. Owners provide their real phone numbers so tenants can connect directly — no middlemen, no surprises.',
  },
  {
    icon: Zap,
    title: 'Speed & Simplicity',
    description:
      "Find, shortlist, and request a visit in minutes. Our streamlined flow cuts through the complexity of Dhaka's rental market so you move faster.",
  },
  {
    icon: Heart,
    title: 'Tenant-First Design',
    description:
      'Every feature is built around what tenants actually need — honest photos, clear pricing, easy booking, and real owner contacts.',
  },
  {
    icon: Users,
    title: 'Community-Driven',
    description:
      'Reviews, ratings, and open communication between renters and owners build a community of trust that keeps the platform honest.',
  },
]

const MILESTONES = [
  {
    year: '2023',
    title: 'The Idea',
    description:
      'RenToday was born from a frustrating apartment search in Dhaka — too many middlemen, fake photos, and hidden fees. We decided to fix that.',
  },
  {
    year: '2024',
    title: 'First Listings',
    description:
      'We launched with 50 hand-verified listings across Gulshan and Banani. Within two months we had 200 active listings and our first 100 happy tenants.',
  },
  {
    year: '2025',
    title: 'City-Wide Expansion',
    description:
      'RenToday expanded to cover all major Dhaka neighborhoods — Dhanmondi, Mirpur, Uttara, Mohammadpur, Bashundhara, and beyond. 500+ listings, 1,200+ tenants served.',
  },
  {
    year: 'Now',
    title: 'Still Growing',
    description:
      'We\'re improving search, adding more areas, and building new tools to make renting in Dhaka even simpler for both tenants and property owners.',
  },
]

export const metadata = {
  title: 'About Us — RenToday',
  description: 'Learn the story behind RenToday, Dhaka\'s rental listing platform built to make finding a home simple and honest.',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-primary py-20 px-4 sm:px-6 lg:px-8 text-primary-foreground">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/10">
              <Building2 className="h-7 w-7" />
            </div>
          </div>
          <h1 className="font-heading text-4xl font-bold sm:text-5xl">About RenToday</h1>
          <p className="mt-4 text-lg text-primary-foreground/80 leading-relaxed">
            We&apos;re on a mission to make renting in Dhaka transparent, fast, and stress-free —
            for tenants and property owners alike.
          </p>
        </div>
      </section>

      {/* ── Mission ───────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold uppercase tracking-wider text-primary">Our Mission</span>
              </div>
              <h2 className="font-heading text-3xl font-bold text-foreground">
                Renting in Dhaka shouldn&apos;t be this hard
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Finding an apartment in Dhaka used to mean calling dozens of brokers, visiting properties
                that looked nothing like their photos, and paying fees you never agreed to.
              </p>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                RenToday cuts out the noise. We connect tenants directly with property owners through
                honest listings, real photos, and a simple booking system — all in one place.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Building2, value: '500+', label: 'Active Listings' },
                { icon: MapPin,    value: '30+',  label: 'Areas Covered'  },
                { icon: Users,     value: '1,200+', label: 'Tenants Served' },
                { icon: Star,      value: '4.8★', label: 'Avg. Rating'    },
              ].map(stat => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border bg-card p-4 text-center"
                >
                  <stat.icon className="mx-auto mb-2 h-5 w-5 text-primary" />
                  <div className="font-heading text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Story / Milestones ────────────────────────────────────────────── */}
      <section className="bg-muted/40 py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-3xl font-bold text-foreground">Our Story</h2>
            <p className="mt-2 text-muted-foreground">From a frustrating apartment search to a city-wide platform</p>
          </div>
          <div className="relative space-y-8 before:absolute before:left-4 before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-border pl-12">
            {MILESTONES.map((m, i) => (
              <div key={i} className="relative">
                <span className="absolute -left-12 flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">{m.year}</span>
                    <span className="text-border">·</span>
                    <h3 className="font-semibold text-foreground">{m.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold text-foreground">What We Stand For</h2>
            <p className="mt-2 text-muted-foreground">The principles that guide every decision we make</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {VALUES.map(v => (
              <div
                key={v.title}
                className="flex gap-4 rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <v.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="bg-muted/40 py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold text-foreground">
            Ready to find your next home?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Browse hundreds of verified listings across Dhaka or list your property today — it&apos;s completely free.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/listings" className="flex items-center gap-2">
                Explore Listings <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>

    </main>
  )
}
