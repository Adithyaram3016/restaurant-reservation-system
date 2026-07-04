'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { CalendarDays, Clock, Users, TableProperties, CalendarSearch, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ReservationBadge } from '@/components/status-badge'
import { api } from '@/lib/api'

type Filter = 'all' | 'confirmed' | 'pending' | 'completed' | 'cancelled'

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

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All',       value: 'all'       },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Pending',   value: 'pending'   },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState<ReservationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [cancelId, setCancelId] = useState<string | null>(null)

  useEffect(() => {
    async function loadReservations() {
      try {
        const data = await api.reservations.list()
        setReservations(data)
      } catch (error) {
        console.error('Failed to load reservations:', error)
        toast.error('Could not load reservations.')
      } finally {
        setLoading(false)
      }
    }
    loadReservations()
  }, [])

  const displayed = filter === 'all' ? reservations : reservations.filter((r) => r.status === filter)

  async function handleCancel(id: string) {
    try {
      await api.reservations.cancel(id)
      setReservations((prev) =>
        prev.map((r) => r._id === id ? { ...r, status: 'cancelled' } : r)
      )
      toast.success('Reservation cancelled.')
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel reservation.')
    } finally {
      setCancelId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Reservations</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage all your table bookings.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/book">
            <CalendarDays className="w-4 h-4 mr-2" />
            New reservation
          </Link>
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              filter === value
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Cards */}
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <CalendarSearch className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">No reservations found</h3>
          <p className="text-sm text-muted-foreground mb-6">
            {filter === 'all'
              ? "You haven't made any reservations yet."
              : `No ${filter} reservations to show.`}
          </p>
          <Button asChild>
            <Link href="/dashboard/book">Book your first table</Link>
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayed.map((r) => (
            <div key={r._id} className="bg-card border border-border rounded-2xl shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-foreground">
                    {new Date(r.date + 'T12:00:00').toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(r.date + 'T12:00:00').getFullYear()}
                  </p>
                </div>
                <ReservationBadge status={r.status as any} />
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: Clock,           label: 'Time',    value: r.timeSlot                                          },
                  { icon: TableProperties, label: 'Table',   value: `Table ${r.table?.tableNumber || 'TBD'}`            },
                  { icon: Users,           label: 'Guests',  value: `${r.guests} ${r.guests === 1 ? 'guest' : 'guests'}` },
                  { icon: CalendarDays,    label: 'Booking', value: `#${r._id.slice(-6).toUpperCase()}`                 },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-muted rounded-xl px-3 py-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Icon className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
                    </div>
                    <p className="text-xs font-semibold text-foreground">{value}</p>
                  </div>
                ))}
              </div>

              {/* Cancel button */}
              {(r.status === 'confirmed' || r.status === 'pending') && (
                <>
                  {cancelId === r._id ? (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-3 space-y-2">
                      <p className="text-xs text-red-700 font-medium">Cancel this reservation?</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="destructive" className="flex-1 text-xs h-8" onClick={() => handleCancel(r._id)}>
                          Yes, cancel
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 text-xs h-8" onClick={() => setCancelId(null)}>
                          Keep it
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
                      onClick={() => setCancelId(r._id)}
                    >
                      <X className="w-3.5 h-3.5 mr-1.5" />
                      Cancel reservation
                    </Button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
