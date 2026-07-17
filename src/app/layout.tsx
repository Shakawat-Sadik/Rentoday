import type { Metadata } from 'next'
import { Outfit, Montserrat } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { SmoothScroll } from '@/components/motion/smooth-scroll'
import { Providers } from './providers'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

const montserratHeading = Montserrat({ subsets: ['latin'], variable: '--font-heading' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'RenToday — Dhaka Apartment & Room Rentals',
  description: 'Find apartments and rooms for rent across Dhaka, Bangladesh. Browse verified listings in Gulshan, Banani, Dhanmondi, Mirpur, Uttara and more.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={cn('h-full antialiased', outfit.variable, montserratHeading.variable, 'font-sans')}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <SmoothScroll>
            <Navbar />
            {children}
            <Footer />
          </SmoothScroll>
        </Providers>
      </body>
    </html>
  )
}
