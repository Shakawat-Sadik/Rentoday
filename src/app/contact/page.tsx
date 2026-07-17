'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin, MessageSquare, CheckCircle2 } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { StatefulButton, type ButtonState } from '@/components/motion/button/stateful'

const CONTACT_INFO = [
  {
    icon: Mail,
    label: 'Email',
    value: 'support@rentoday.com',
    href: 'mailto:support@rentoday.com',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+880 1700-000000',
    href: 'tel:+8801700000000',
  },
  {
    icon: MapPin,
    label: 'Address',
    value: 'Gulshan-1, Dhaka 1212, Bangladesh',
    href: 'https://maps.google.com/?q=Gulshan,Dhaka,Bangladesh',
  },
]

export default function ContactPage() {
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [btnState, setBtnState] = useState<ButtonState>('idle')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in all required fields.')
      return
    }

    setBtnState('loading')

    // Simulate network delay (no actual backend for contact form)
    await new Promise(resolve => setTimeout(resolve, 1200))

    setBtnState('success')
    setTimeout(() => {
      setSubmitted(true)
    }, 800)
  }

  return (
    <main className="min-h-screen bg-background">

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="bg-primary py-16 px-4 sm:px-6 lg:px-8 text-primary-foreground">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/10">
              <MessageSquare className="h-7 w-7" />
            </div>
          </div>
          <h1 className="font-heading text-4xl font-bold">Get in Touch</h1>
          <p className="mt-3 text-lg text-primary-foreground/80">
            Have a question, suggestion, or issue? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">

          {/* ── Contact info sidebar ──────────────────────────────────────── */}
          <aside className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground">Contact Info</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Reach us through any of these channels and we&apos;ll respond within 24 hours.
              </p>
            </div>

            <div className="space-y-4">
              {CONTACT_INFO.map(item => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex items-start gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary transition-colors group"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="text-sm text-foreground group-hover:text-primary transition-colors mt-0.5">
                      {item.value}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-semibold text-foreground mb-1">Office Hours</p>
              <p className="text-sm text-muted-foreground">Saturday – Thursday</p>
              <p className="text-sm text-muted-foreground">9:00 AM – 6:00 PM (BST)</p>
            </div>
          </aside>

          {/* ── Contact form ──────────────────────────────────────────────── */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CheckCircle2 className="h-14 w-14 text-emerald-500 mb-4" />
                <h2 className="font-heading text-2xl font-bold text-foreground">Message Sent!</h2>
                <p className="mt-2 text-muted-foreground max-w-sm">
                  Thanks for reaching out. We&apos;ll get back to you at <strong>{email}</strong> within 24 hours.
                </p>
                <Link
                  href="/"
                  className="mt-6 text-sm text-primary hover:underline"
                >
                  Back to home
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="font-heading text-xl font-bold text-foreground">Send a Message</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Fill in the form and we&apos;ll get back to you as soon as possible.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="contact-name">Full name <span className="text-destructive">*</span></Label>
                      <Input
                        id="contact-name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="contact-email">Email address <span className="text-destructive">*</span></Label>
                      <Input
                        id="contact-email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="contact-subject">Subject</Label>
                    <Input
                      id="contact-subject"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder="What is this about?"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="contact-message">Message <span className="text-destructive">*</span></Label>
                    <Textarea
                      id="contact-message"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Tell us how we can help…"
                      rows={6}
                      required
                    />
                  </div>

                  {error && (
                    <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {error}
                    </p>
                  )}

                  <StatefulButton
                    type="submit"
                    state={btnState}
                    size="lg"
                    loadingText="Sending…"
                    successText="Sent!"
                    errorText="Try again"
                    className="w-full rounded-md"
                  >
                    Send Message
                  </StatefulButton>
                </form>
              </>
            )}
          </div>

        </div>
      </div>

    </main>
  )
}
