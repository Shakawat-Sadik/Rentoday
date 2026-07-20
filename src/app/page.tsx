"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  BedDouble,
  ArrowRight,
  Star,
  ChevronRight,
  Building2,
  Users,
  CheckCircle,
  TrendingUp,
  Phone,
} from "lucide-react";

import { ShaderBackground } from "@/components/motion/shader-background";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/motion/button/base";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { IAuthUser, IListing } from "@/lib/interfaces-types";

// ── Hero background images ─────────────────────────────────────────────────────

const HERO_IMAGES = [
  {
    src: "https://raw.githubusercontent.com/Shakawat-Sadik/Rentoday_Assests/refs/heads/main/261682_tiny.jpg",
    alt: "Modern apartment exterior",
  },
  {
    src: "https://raw.githubusercontent.com/Shakawat-Sadik/Rentoday_Assests/refs/heads/main/cozy-lively-home-interior-design.jpg",
    alt: "Bright living room",
  },
  {
    src: "https://raw.githubusercontent.com/Shakawat-Sadik/Rentoday_Assests/refs/heads/main/hq720.jpg",
    alt: "City apartment building",
  },
  {
    src: "https://raw.githubusercontent.com/Shakawat-Sadik/Rentoday_Assests/refs/heads/main/luxury-modern-style-bedroom-interior-hotel-bedroom-generative-ai-illustration.jpg",
    alt: "Interior bedroom",
  },
];

// ── Data constants ─────────────────────────────────────────────────────────────

const AREAS = [
  { name: "Gulshan", count: "120+ listings" },
  { name: "Banani", count: "90+ listings" },
  { name: "Dhanmondi", count: "150+ listings" },
  { name: "Mirpur", count: "200+ listings" },
  { name: "Uttara", count: "180+ listings" },
  { name: "Mohammadpur", count: "130+ listings" },
  { name: "Bashundhara", count: "80+ listings" },
  { name: "Wari", count: "60+ listings" },
];

const STATS = [
  { icon: Building2, value: "500+", label: "Active Listings" },
  { icon: MapPin, value: "30+", label: "Neighborhoods" },
  { icon: Users, value: "1,200+", label: "Happy Tenants" },
  { icon: Star, value: "4.8", label: "Avg. Rating" },
];

const TESTIMONIALS = [
  {
    name: "Rafi Ahmed",
    role: "Software Engineer · Gulshan",
    avatar: "RA",
    rating: 5,
    text: "Found my perfect flat in Gulshan within 3 days. The owner was responsive and the booking process was seamless. Highly recommend RenToday for anyone moving to Dhaka!",
  },
  {
    name: "Nusrat Jahan",
    role: "Graduate Student · Dhanmondi",
    avatar: "NJ",
    rating: 5,
    text: "As a student I was nervous about finding a safe room. RenToday made it easy to filter by area and budget. I found a furnished room near my university in just a week.",
  },
  {
    name: "Tariq Islam",
    role: "Property Owner · Banani",
    avatar: "TI",
    rating: 5,
    text: "Listed my apartment and got 15+ booking requests within 48 hours. The manage dashboard is clean and the acceptance workflow is smooth. Great platform for landlords!",
  },
];

const FAQ = [
  {
    q: "Is RenToday free to use for tenants?",
    a: "Yes, browsing listings and submitting booking requests is completely free for tenants. There are no hidden charges at any point.",
  },
  {
    q: "How do I list my property on RenToday?",
    a: 'Create an account, click "Add Listing" from the navigation menu, fill in your property details, upload photos, and publish. Your listing goes live instantly.',
  },
  {
    q: "Are listings verified?",
    a: "Owners verify their contact details at registration. We encourage honest listings and have a review system so tenants can share their experiences.",
  },
  {
    q: "How does booking work?",
    a: "You browse listings, choose a proposed visit date using the booking dialog, add an optional message, and submit. The owner then accepts or declines your request. No payment is taken through the platform.",
  },
  {
    q: "Can I contact the owner directly?",
    a: "Yes. Each listing shows the owner's phone number so you can call or message them directly once you've found a property you like.",
  },
  {
    q: "What areas does RenToday cover?",
    a: "RenToday currently covers all major neighborhoods in Dhaka including Gulshan, Banani, Dhanmondi, Mirpur, Uttara, Mohammadpur, Bashundhara, Wari, and more.",
  },
];

// ── Listing card ───────────────────────────────────────────────────────────────

function ListingCard({ listing }: { listing: IListing }) {
  const router = useRouter();
  const images = Array.isArray(listing.images) ? listing.images : [];
  const imageUrl =
    images.length > 0
      ? String(images[0])
      : `https://raw.githubusercontent.com/Shakawat-Sadik/Rentoday_Assests/refs/heads/main/3d-rendering-luxury-modern-living-room-with-fabric-sofa.jpg`;

  return (
    <div
      className="group cursor-pointer rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow"
      onClick={() => router.push(`/listings/${String(listing._id)}`)}
    >
      <div className="relative h-48 overflow-hidden bg-muted">
        <Image
          src={imageUrl}
          alt={String(listing.title)}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <div className="absolute top-3 left-3">
          <Badge className="bg-background/90 text-foreground text-xs font-semibold">
            ৳{Number(listing.rentPerMonth).toLocaleString("en-IN")}/mo
          </Badge>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-1 mb-1">
          {String(listing.title)}
        </h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">{String(listing.location)}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <BedDouble className="h-3.5 w-3.5" />
            {String(listing.bedrooms)} bed
          </span>
          <span className="capitalize">{String(listing.propertyType)}</span>
        </div>
      </div>
    </div>
  );
}

// ── Landing page ───────────────────────────────────────────────────────────────

export default function LandingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<IAuthUser | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredListings, setFeaturedListings] = useState<IListing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setAuthLoaded(true));
  }, [pathname]);

  useEffect(() => {
    fetch("/api/listings?sort=newest&page=1")
      .then((r) => r.json())
      .then((data) => setFeaturedListings((data.listings ?? []).slice(0, 8)))
      .catch(console.error)
      .finally(() => setListingsLoading(false));
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/listings?query=${encodeURIComponent(q)}` : "/listings");
  }

  return (
    <>
      {/* ── 1. HERO ────────────────────────────────────────────────────────── */}
      <section className="relative h-[65vh] min-h-[480px] overflow-hidden">
        {/* Full-bleed background carousel */}
        <Carousel className="absolute inset-0 h-full" opts={{ loop: true }}>
          <CarouselContent className="h-full">
            {HERO_IMAGES.map((img, i) => (
              <CarouselItem key={i} className="h-full p-0">
                <div className="relative h-[65vh] min-h-[480px] w-full">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    priority={i === 0}
                    className="object-cover"
                    sizes="100vw"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Shader color overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-25 mix-blend-multiply">
          <ShaderBackground variant="mesh-gradient" className="h-full w-full" />
        </div>

        {/* Dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
          <Badge
            variant="outline"
            className="mb-4 border-white/30 bg-white/10 text-white backdrop-blur-sm"
          >
            Dhaka&apos;s #1 Rental Platform
          </Badge>

          <h1 className="font-heading text-4xl font-bold leading-tight sm:text-5xl md:text-6xl max-w-3xl">
            Find Your Perfect
            <span className="text-primary"> Home</span> in Dhaka
          </h1>

          <p className="mt-4 max-w-xl text-base text-white/80 sm:text-lg">
            Browse hundreds of verified apartments and rooms for rent across
            Dhaka&apos;s most sought-after neighborhoods.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-8 flex w-full max-w-md gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by area or title…"
                className="pl-9 bg-background/95 backdrop-blur-sm h-11 text-foreground"
              />
            </div>
            <Button type="submit" size="lg" className="h-11 shrink-0">
              Search
            </Button>
          </form>

          <div className="mt-4 flex items-center gap-4 text-sm text-white/70">
            <Link
              href="/listings"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              Browse all listings <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <span>·</span>
            <Link
              href="/items/add"
              className="hover:text-white transition-colors"
            >
              List your property
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. FEATURED LISTINGS ───────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-heading text-3xl font-bold text-foreground">
                Featured Listings
              </h2>
              <p className="mt-1 text-muted-foreground">
                The latest properties available right now
              </p>
            </div>
            <Link
              href="/listings"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {listingsLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border overflow-hidden"
                >
                  <Skeleton className="h-48 w-full rounded-none" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Building2 className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                No listings yet — be the first to add one!
              </p>
              <Button asChild className="mt-4">
                <Link href="/items/add">Add Listing</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featuredListings.map((listing) => (
                <ListingCard key={String(listing._id)} listing={listing} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link href="/listings">View all listings</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── 3. HOW IT WORKS ───────────────────────────────────────────────── */}
      <section className="bg-muted/40 py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold text-foreground">
              How It Works
            </h2>
            <p className="mt-2 text-muted-foreground">
              Three simple steps to your new home
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                step: "01",
                icon: Search,
                title: "Search",
                description:
                  "Browse hundreds of verified listings. Filter by area, rent range, bedrooms, and amenities to find your ideal match.",
              },
              {
                step: "02",
                icon: Phone,
                title: "Contact",
                description:
                  "See the owner's phone on any listing and reach out directly. Propose a visit date through our simple booking system.",
              },
              {
                step: "03",
                icon: CheckCircle,
                title: "Move In",
                description:
                  "Visit the property, negotiate terms directly with the owner, sign the deal, and move into your new Dhaka home.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative rounded-2xl border border-border bg-card p-6 text-center"
              >
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {item.step}
                </span>
                <div className="mt-4 flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <h3 className="mt-4 font-heading text-xl font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. POPULAR AREAS ──────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto">
          <div className="mb-8 text-center">
            <h2 className="font-heading text-3xl font-bold text-foreground">
              Popular Areas
            </h2>
            <p className="mt-2 text-muted-foreground">
              Discover rentals in Dhaka&apos;s most desirable neighborhoods
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {AREAS.map((area) => (
              <Link
                key={area.name}
                href={`/listings?location=${encodeURIComponent(area.name)}`}
                className="group flex flex-col items-center gap-1 rounded-xl border border-border bg-card px-5 py-4 hover:border-primary hover:shadow-sm transition-all"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-4 w-4 text-primary" />
                </span>
                <span className="font-medium text-foreground group-hover:text-primary transition-colors text-sm">
                  {area.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {area.count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. STATS ──────────────────────────────────────────────────────── */}
      <section className="bg-primary py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="text-center text-primary-foreground"
              >
                <div className="flex justify-center mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/10">
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="font-heading text-4xl font-bold">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-primary-foreground/70">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. TESTIMONIALS ───────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold text-foreground">
              What People Say
            </h2>
            <p className="mt-2 text-muted-foreground">
              Real experiences from tenants and property owners
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                      {t.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. FAQ ────────────────────────────────────────────────────────── */}
      <section className="bg-muted/40 py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-3xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-muted-foreground">
              Everything you need to know about renting on RenToday
            </p>
          </div>
          <Accordion type="single" collapsible className="space-y-2">
            {FAQ.map((item, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-xl border border-border bg-card px-4"
              >
                <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:no-underline py-4">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── 8. CTA BANNER ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-14 text-center text-primary-foreground">
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <ShaderBackground
                variant="perlin-noise"
                className="h-full w-full"
              />
            </div>
            <div className="relative z-10">
              <TrendingUp className="mx-auto h-10 w-10 mb-4 opacity-80" />
              <h2 className="font-heading text-3xl font-bold sm:text-4xl">
                Ready to List Your Property?
              </h2>
              <p className="mt-3 max-w-xl mx-auto text-primary-foreground/80">
                Join hundreds of property owners on RenToday. Get your listing
                in front of thousands of verified tenants across Dhaka — for
                free.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  size="lg"
                  variant="secondary"
                  className="font-semibold min-w-[160px]"
                  asChild
                >
                  {user ? (
                    <Link href="/dashboard/user/items/add">Add Listing</Link>
                  ) : (
                    <Link href="/register">Create Free Account</Link>
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 text-primary-foreground bg-primary hover:bg-primary-foreground/10 hover:text-chart-1 transition-all duration-500 min-w-[160px]"
                  asChild
                >
                  <Link href="/listings">Browse All Listings</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
