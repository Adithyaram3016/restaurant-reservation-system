'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CalendarDays, CalendarCheck, CalendarClock, CalendarX, ArrowRight, Clock, Loader2 } from 'lucide-react'
import { StatCard } from '@/components/stat-card'
import { ReservationBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

interface ReservationItem {
  _id: string
  date: string
  timeSlot: string
  guests: number
  status: string
  table?: {
    tableNumber: number
    capacity: number
  }
}

export default function CustomerDashboardPage() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState<ReservationItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const data = await api.reservations.list()
        setReservations(data)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  const localToday = new Date()
  const yyyy = localToday.getFullYear()
  const mm = String(localToday.getMonth() + 1).padStart(2, '0')
  const dd = String(localToday.getDate()).padStart(2, '0')
  const todayStr = `${yyyy}-${mm}-${dd}`
  const upcoming = reservations.filter(
    (r) => (r.status === 'confirmed' || r.status === 'pending') && r.date >= todayStr
  )
  const active = reservations.filter((r) => r.status === 'confirmed')
  const cancelled = reservations.filter((r) => r.status === 'cancelled')

  // Show only 3 recent bookings on the main dashboard
  const recentReservations = reservations.slice(0, 3)

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.name || 'Guest'}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/book">
            <CalendarDays className="w-4 h-4 mr-2" />
            New reservation
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total"
          value={reservations.length}
          description="All time"
          icon={CalendarDays}
        />
        <StatCard
          title="Upcoming"
          value={upcoming.length}
          description="Pending & Confirmed"
          icon={CalendarClock}
        />
        <StatCard
          title="Active"
          value={active.length}
          description="Confirmed"
          icon={CalendarCheck}
        />
        <StatCard
          title="Cancelled"
          value={cancelled.length}
          description="All time"
          icon={CalendarX}
        />
      </div>

      {/* Recent reservations */}
      <div className="bg-card border border-border rounded-2xl shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Recent Reservations</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/reservations" className="flex items-center gap-1 text-primary">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
        {recentReservations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            You have no reservations. Click "New reservation" to book one!
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentReservations.map((r) => (
              <div key={r._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4">
                <div className="flex items-start gap-4">
                  <div className="flex-none flex items-center justify-center w-10 h-10 rounded-xl bg-accent">
                    <CalendarDays className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {new Date(r.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {r.timeSlot}
                      </span>
                      <span>Table {r.table?.tableNumber || 'TBD'}</span>
                      <span>{r.guests} {r.guests === 1 ? 'guest' : 'guests'}</span>
                    </div>
                  </div>
                </div>
                <ReservationBadge status={r.status as any} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/dashboard/book"
          className="group flex items-center gap-4 bg-primary rounded-2xl p-5 hover:opacity-90 transition-opacity"
        >
          <div className="flex-none w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <CalendarDays className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white">Book a table</p>
            <p className="text-sm text-white/70">Reserve your next dining experience</p>
          </div>
          <ArrowRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link
          href="/dashboard/reservations"
          className="group flex items-center gap-4 bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex-none w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
            <CalendarCheck className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">My Reservations</p>
            <p className="text-sm text-muted-foreground">View and manage bookings</p>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  )
}
