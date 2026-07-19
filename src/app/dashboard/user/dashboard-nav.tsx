'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutList, Inbox, Send, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard/user/listings', label: 'My Listings',       icon: LayoutList },
  { href: "/dashboard/user/items/add", label: 'Add Listing',      icon: Plus },
  { href: '/dashboard/user/incoming', label: 'Incoming Requests', icon: Inbox },
  { href: '/dashboard/user/outgoing', label: 'Outgoing Requests', icon: Send },
]

// Left-hand navigation for the general-user dashboard. Collapses into a
// horizontally-scrollable tab bar on small screens (mirrors the admin nav).
export default function DashboardNav() {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className="lg:w-60 lg:shrink-0">
      <div className="mb-4 hidden items-center gap-2 px-2 lg:flex">
        <LayoutList className="h-5 w-5 text-primary" />
        <div>
          <p className="text-sm font-semibold text-foreground">Dashboard</p>
          <p className="text-xs text-muted-foreground">Manage your account</p>
        </div>
      </div>

      <nav
        className={cn(
          'flex gap-1 overflow-x-auto rounded-xl border border-sidebar-border bg-sidebar p-1.5',
          'lg:flex-col lg:overflow-visible lg:p-2',
        )}
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
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
