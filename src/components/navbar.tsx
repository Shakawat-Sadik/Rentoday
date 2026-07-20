'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, LogOut, User, Building2, ChevronRight, MapPin, LayoutDashboard } from 'lucide-react'

import {
  MotionNavigationMenu,
  MotionNavigationMenuList,
  MotionNavigationMenuItem,
  MotionNavigationMenuTrigger,
  MotionNavigationMenuContent,
  MotionNavigationMenuLink,
} from '@/components/unlumen-ui/motion-navigation-menu'
import { ThemeToggle } from '@/components/motion/theme-toggle'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/motion/popover'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { IAuthUser } from '@/lib/interfaces-types'

const POPULAR_AREAS = [
  { name: 'Gulshan',      href: '/listings?location=Gulshan' },
  { name: 'Banani',       href: '/listings?location=Banani' },
  { name: 'Dhanmondi',    href: '/listings?location=Dhanmondi' },
  { name: 'Mirpur',       href: '/listings?location=Mirpur' },
  { name: 'Uttara',       href: '/listings?location=Uttara' },
  { name: 'Mohammadpur',  href: '/listings?location=Mohammadpur' },
]

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser]           = useState<IAuthUser | null>(null)
  const [authLoaded, setAuthLoaded] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    fetch('/api/users/me')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(data => setUser(data?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setAuthLoaded(true))
  }, [pathname])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/')
    router.refresh()
  }

  const mobileLinkClass = (href: string) =>
    cn(
      'block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent',
      pathname === href ? 'bg-accent text-foreground' : 'text-muted-foreground',
    )

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 shrink-0 font-bold text-lg text-foreground">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="font-heading">RenToday</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex lg:flex-1 lg:items-center">
            <MotionNavigationMenu>
              <MotionNavigationMenuList>

                <MotionNavigationMenuItem>
                  <MotionNavigationMenuLink
                    href="/"
                    data-active={pathname === '/' || undefined}
                  >
                    Home
                  </MotionNavigationMenuLink>
                </MotionNavigationMenuItem>

                <MotionNavigationMenuItem value="explore">
                  <MotionNavigationMenuTrigger>Explore</MotionNavigationMenuTrigger>
                  <MotionNavigationMenuContent className="w-[320px] p-3">
                    <Link
                      href="/listings"
                      className="flex items-center gap-3 rounded-md p-3 mb-2 hover:bg-accent transition-colors group"
                    >
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">All Listings</p>
                        <p className="text-xs text-muted-foreground">Browse every available rental</p>
                      </div>
                      <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                    </Link>
                    <Separator className="mb-2" />
                    <p className="mb-1.5 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Popular Areas
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {POPULAR_AREAS.map(area => (
                        <Link
                          key={area.name}
                          href={area.href}
                          className="rounded-md px-3 py-1.5 text-sm text-foreground/80 hover:bg-accent hover:text-foreground transition-colors"
                        >
                          {area.name}
                        </Link>
                      ))}
                    </div>
                  </MotionNavigationMenuContent>
                </MotionNavigationMenuItem>

                {user && (
                  <>
                    <MotionNavigationMenuItem>
                      <MotionNavigationMenuLink
                        href="/items/add"
                        data-active={pathname === '/items/add' || undefined}
                      >
                        Add Listing
                      </MotionNavigationMenuLink>
                    </MotionNavigationMenuItem>
                    <MotionNavigationMenuItem>
                      <MotionNavigationMenuLink
                        href="/dashboard"
                        data-active={pathname.startsWith('/dashboard') || undefined}
                      >
                        Dashboard
                      </MotionNavigationMenuLink>
                    </MotionNavigationMenuItem>
                  </>
                )}

                <MotionNavigationMenuItem>
                  <MotionNavigationMenuLink
                    href="/about"
                    data-active={pathname === '/about' || undefined}
                  >
                    About
                  </MotionNavigationMenuLink>
                </MotionNavigationMenuItem>

              </MotionNavigationMenuList>
            </MotionNavigationMenu>
          </div>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle
              variant="circle"
              className="h-9 w-9 rounded-full hover:bg-accent transition-colors"
              iconClassName="h-4 w-4"
            />

            {authLoaded && (
              user ? (
                <Popover align="end" trigger="hover">
                  <PopoverTrigger>
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors"
                      aria-label="Open profile menu"
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-52">
                    <div className="mb-3 pb-2 border-b border-border">
                      <p className="text-sm font-semibold truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <div className="space-y-0.5">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                      >
                        <LayoutDashboard className="h-3.5 w-3.5" />
                        {user.role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
                      </Link>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                      >
                        <User className="h-3.5 w-3.5" />
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Log out
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5 ml-1">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/register">Register</Link>
                  </Button>
                </div>
              )
            )}

            {/* Mobile menu button */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden ml-1">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0 flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-2 p-4 border-b border-border">
                  <Building2 className="h-5 w-5 text-primary" />
                  <span className="font-heading font-bold text-lg">RenToday</span>
                </div>

                {/* Links */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                  <SheetClose asChild>
                    <Link href="/" className={mobileLinkClass('/')}>Home</Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/listings" className={mobileLinkClass('/listings')}>Explore Listings</Link>
                  </SheetClose>
                  {user && (
                    <>
                      <SheetClose asChild>
                        <Link href="/dashboard" className={mobileLinkClass('/dashboard')}>
                          {user.role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/dashboard/user/items/add" className={mobileLinkClass('/dashboard/user/items/add')}>Add Listing</Link>
                      </SheetClose>
                    </>
                  )}
                  <SheetClose asChild>
                    <Link href="/about" className={mobileLinkClass('/about')}>About</Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/contact" className={mobileLinkClass('/contact')}>Contact</Link>
                  </SheetClose>
                </nav>

                {/* Footer actions */}
                <div className="p-4 border-t border-border">
                  {user ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <SheetClose asChild>
                          <Link
                            href="/profile"
                            className="flex-1 text-center rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
                          >
                            Profile
                          </Link>
                        </SheetClose>
                        <button
                          onClick={handleLogout}
                          className="flex-1 rounded-md border border-destructive/30 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          Log out
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <SheetClose asChild>
                        <Link
                          href="/login"
                          className="flex-1 text-center rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
                        >
                          Login
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/register"
                          className="flex-1 text-center rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm hover:bg-primary/90 transition-colors"
                        >
                          Register
                        </Link>
                      </SheetClose>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </div>
    </header>
  )
}
