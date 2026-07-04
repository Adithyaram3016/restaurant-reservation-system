'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UtensilsCrossed, Star, Clock, Shield } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function HomePage() {
  const { user, logout } = useAuth()

  return (
    <main className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary">
              <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">TableMaster</span>
          </div>
          <nav className="hidden sm:flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it works</Link>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={user.role === 'admin' ? '/admin' : '/dashboard'}>Dashboard</Link>
                </Button>
                <Button size="sm" variant="outline" onClick={logout}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Customer Login</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/login">Admin Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Create Account</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center bg-background relative overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute top-10 left-10 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-primary/5 blur-3xl animate-blob pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-emerald-500/5 blur-3xl animate-blob animation-delay-2000 pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-amber-500/5 blur-3xl animate-blob animation-delay-4000 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-accent px-3.5 py-1.5 text-xs font-medium text-accent-foreground mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Now available — streamline every reservation
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground text-balance leading-tight mb-6">
            Reservations, managed
            <br />
            <span className="text-primary">beautifully.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed mb-10">
            TableMaster gives your restaurant a premium booking experience. Manage tables, guests, and reservations from one elegant dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            {user ? (
              <Button size="lg" asChild>
                <Link href={user.role === 'admin' ? '/admin' : '/dashboard/book'}>
                  {user.role === 'admin' ? 'Admin Dashboard' : 'Book a table now'}
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link href="/login">Customer Login</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/admin/login">Admin Login</Link>
                </Button>
                <Link href="/register" className="text-sm font-semibold text-primary hover:underline mt-2 sm:mt-0 sm:ml-4">
                  Create a new account →
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-muted/40 border-t border-border py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12 text-balance">
            Everything you need to run a great restaurant
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-accent mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4 text-balance">
            Ready to transform your dining experience?
          </h2>
          <p className="text-primary-foreground/80 mb-8 text-balance leading-relaxed">
            Join hundreds of restaurants already using TableMaster to delight their guests.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/register">Create your free account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary">
              <UtensilsCrossed className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm text-foreground">TableMaster</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 TableMaster. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}

const FEATURES = [
  {
    icon: Star,
    title: 'Smart Reservations',
    desc: 'Automated table assignments and real-time availability tracking across all your dining areas.',
  },
  {
    icon: Clock,
    title: 'Time Slot Control',
    desc: 'Define your service periods and manage table turnover to maximize covers every night.',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    desc: 'Separate portals for staff and guests so everyone sees exactly what they need.',
  },
]
