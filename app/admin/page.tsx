'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  CalendarDays, CalendarCheck, Users, LayoutGrid, ArrowRight, TrendingUp, Loader2,
} from 'lucide-react'
import { StatCard } from '@/components/stat-card'
import { ReservationBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'

interface TableItem {
  _id: string
  tableNumber: number
  capacity: number
}

interface ReservationItem {
  _id: string
  customerName: string
  email: string
  date: string
  timeSlot: string
  guests: number
  status: string
  table?: {
    tableNumber: number
  }
}

export default function AdminDashboardPage() {
  const [reservations, setReservations] = useState<ReservationItem[]>([])
  const [tables, setTables] = useState<TableItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [resData, tableData] = await Promise.all([
          api.reservations.list(),
          api.tables.list(),
        ])
        setReservations(resData)
        setTables(tableData)
      } catch (error) {
        console.error('Failed to load admin dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadAdminData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  const total = reservations.length
  const confirmed = reservations.filter((r) => r.status === 'confirmed').length
  const pending = reservations.filter((r) => r.status === 'pending').length
  const cancelled = reservations.filter((r) => r.status === 'cancelled').length
  const totalTables = tables.length

  const totalCovers = reservations
    .filter((r) => r.status === 'confirmed' || r.status === 'completed')
    .reduce((sum, r) => sum + r.guests, 0)

  const avgPartySize = total > 0
    ? (reservations.reduce((sum, r) => sum + r.guests, 0) / total).toFixed(1)
    : '0'

  const recent = reservations.slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Admin Panel
          </div>
          <h1 className="text-2xl font-bold text-foreground">Overview</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/tables">Manage tables</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/reservations">View reservations</Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Reservations" value={total} icon={CalendarDays} trend={{ value: '+12% this week', positive: true }} />
        <StatCard title="Confirmed" value={confirmed} icon={CalendarCheck} trend={{ value: 'Active bookings', positive: true }} />
        <StatCard title="Pending" value={pending} icon={TrendingUp} />
        <StatCard title="Total Tables" value={totalTables} icon={LayoutGrid} />
      </div>

      {/* Secondary stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Cancelled Bookings',     value: cancelled,    color: 'text-red-500'     },
          { label: 'Total Confirmed Covers', value: totalCovers,  color: 'text-emerald-600' },
          { label: 'Avg. Party Size',        value: avgPartySize, color: 'text-primary'     },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Recent reservations */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Recent Reservations</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/reservations" className="flex items-center gap-1 text-primary">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
        {recent.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No reservations found. Active reservations will show up here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Guest</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Time</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Table</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Guests</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recent.map((r) => (
                  <tr key={r._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-3.5">
                      <p className="font-medium text-foreground">{r.customerName}</p>
                      <p className="text-xs text-muted-foreground">{r.email}</p>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {new Date(r.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">{r.timeSlot}</td>
                    <td className="px-4 py-3.5 text-muted-foreground">Table {r.table?.tableNumber || 'TBD'}</td>
                    <td className="px-4 py-3.5 text-muted-foreground">{r.guests}</td>
                    <td className="px-4 py-3.5"><ReservationBadge status={r.status as any} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Manage Reservations', desc: 'Edit, cancel, filter bookings', href: '/admin/reservations', icon: CalendarDays },
          { label: 'Manage Tables',       desc: 'Add, edit, remove tables',      href: '/admin/tables',       icon: LayoutGrid  },
          { label: 'Users',               desc: 'View all registered guests',    href: '/admin/users',        icon: Users       },
        ].map(({ label, desc, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-4 bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex-none w-11 h-11 rounded-xl bg-accent flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Link>
        ))}
      </div>
    </div>
  )
}
