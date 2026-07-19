'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Building2, CalendarClock, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard/admin',          label: 'Overview',         icon: LayoutDashboard, exact: true  },
  { href: '/dashboard/admin/users',    label: 'Users',            icon: Users,           exact: false },
  { href: '/dashboard/admin/listings', label: 'Listings',         icon: Building2,       exact: false },
  { href: '/dashboard/admin/requests', label: 'Booking Requests', icon: CalendarClock,   exact: false },
]

// Left-hand navigation for the admin dashboard. On small screens it collapses
// into a horizontally-scrollable tab bar above the content.
export default function DashboardNav() {
  const pathname = usePathname()

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className="lg:w-60 lg:shrink-0">
      {/* Header — hidden on mobile to save vertical space */}
      <div className="mb-4 hidden items-center gap-2 px-2 lg:flex">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <div>
          <p className="text-sm font-semibold text-foreground">Admin</p>
          <p className="text-xs text-muted-foreground">Control panel</p>
        </div>
      </div>

      <nav
        className={cn(
          'flex gap-1 overflow-x-auto rounded-xl border border-sidebar-border bg-sidebar p-1.5',
          'lg:flex-col lg:overflow-visible lg:p-2',
        )}
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">{label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
