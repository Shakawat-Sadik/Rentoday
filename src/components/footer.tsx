import Link from 'next/link'
import { Building2 } from 'lucide-react'

const INTERNAL_LINKS = [
  { label: 'Home',            href: '/' },
  { label: 'Explore Listings', href: '/listings' },
  { label: 'Add Listing',     href: '/items/add' },
  { label: 'About Us',        href: '/about' },
  { label: 'Contact',         href: '/contact' },
]

const POPULAR_AREAS = [
  { label: 'Gulshan',     href: '/listings?location=Gulshan' },
  { label: 'Banani',      href: '/listings?location=Banani' },
  { label: 'Dhanmondi',   href: '/listings?location=Dhanmondi' },
  { label: 'Mirpur',      href: '/listings?location=Mirpur' },
  { label: 'Uttara',      href: '/listings?location=Uttara' },
  { label: 'Mohammadpur', href: '/listings?location=Mohammadpur' },
]

const SOCIAL_LINKS = [
  { label: 'Facebook',  abbr: 'Fb', href: 'https://www.facebook.com'  },
  { label: 'Instagram', abbr: 'In', href: 'https://www.instagram.com' },
  { label: 'Twitter',   abbr: 'Tw', href: 'https://www.twitter.com'   },
  { label: 'YouTube',   abbr: 'Yt', href: 'https://www.youtube.com'   },
]

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-1.5 font-bold text-lg text-foreground">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="font-heading">RenToday</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The easiest way to find verified apartments and rooms for rent across Dhaka, Bangladesh.
            </p>
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map(({ label, abbr, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-xs font-bold text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  {abbr}
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2">
              {INTERNAL_LINKS.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular areas */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Popular Areas</h3>
            <ul className="space-y-2">
              {POPULAR_AREAS.map(area => (
                <li key={area.href}>
                  <Link
                    href={area.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {area.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Contact</h3>
            <address className="not-italic space-y-2 text-sm text-muted-foreground">
              <p>Dhaka, Bangladesh</p>
              <a
                href="mailto:support@rentoday.com"
                className="hover:text-foreground transition-colors block"
              >
                support@rentoday.com
              </a>
              <a
                href="tel:+8801700000000"
                className="hover:text-foreground transition-colors block"
              >
                +880 1700-000000
              </a>
            </address>
          </div>

        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} RenToday. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built for Dhaka &mdash; by renters, for renters.
          </p>
        </div>
      </div>
    </footer>
  )
}
