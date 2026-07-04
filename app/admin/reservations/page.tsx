'use client'

import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { Search, SlidersHorizontal, Pencil, X, Check, ChevronDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ReservationBadge } from '@/components/status-badge'
import { api } from '@/lib/api'

const TIME_SLOTS = [
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
  '8:00 PM', '8:30 PM', '9:00 PM',
]

type ReservationStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled'
type StatusFilter = 'all' | ReservationStatus

interface ReservationItem {
  _id: string
  customerName: string
  email: string
  date: string
  timeSlot: string
  guests: number
  status: ReservationStatus
  table?: {
    _id: string
    tableNumber: number
  }
}

const STATUS_OPTS: { label: string; value: StatusFilter }[] = [
  { label: 'All statuses', value: 'all'       },
  { label: 'Confirmed',    value: 'confirmed' },
  { label: 'Pending',      value: 'pending'   },
  { label: 'Completed',    value: 'completed' },
  { label: 'Cancelled',    value: 'cancelled' },
]

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<ReservationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<ReservationItem>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadReservations() {
      try {
        const data = await api.reservations.list(dateFilter || undefined)
        setReservations(data)
      } catch (error) {
        toast.error('Could not load reservations.')
      } finally {
        setLoading(false)
      }
    }
    loadReservations()
  }, [dateFilter])

  const filtered = useMemo(() => {
    return reservations.filter((r) => {
      const matchSearch =
        !search ||
        r.customerName.toLowerCase().includes(search.toLowerCase()) ||
        r.email.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || r.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [reservations, search, statusFilter])

  function startEdit(r: ReservationItem) {
    setEditId(r._id)
    setEditForm({ ...r })
  }

  async function saveEdit() {
    if (!editId) return
    setSaving(true)
    try {
      const updated = await api.reservations.update(editId, {
        date: editForm.date,
        timeSlot: editForm.timeSlot,
        guests: editForm.guests,
        status: editForm.status,
        customerName: editForm.customerName,
      })
      setReservations((prev) =>
        prev.map((r) => r._id === editId ? { ...r, ...updated.reservation } : r)
      )
      setEditId(null)
      toast.success('Reservation updated.')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update reservation.')
    } finally {
      setSaving(false)
    }
  }

  async function cancelReservation(id: string) {
    try {
      await api.reservations.cancel(id)
      setReservations((prev) =>
        prev.map((r) => r._id === id ? { ...r, status: 'cancelled' } : r)
      )
      toast.success('Reservation cancelled.')
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel reservation.')
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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reservations</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {filtered.length} of {reservations.length} reservations
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
          />
        </div>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-input bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
        />
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="appearance-none pl-4 pr-9 py-2.5 rounded-xl border border-input bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
          >
            {STATUS_OPTS.map(({ label, value }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
        {(search || dateFilter || statusFilter !== 'all') && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => { setSearch(''); setDateFilter(''); setStatusFilter('all') }}
            aria-label="Clear filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['Customer', 'Date', 'Time', 'Table', 'Guests', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground text-sm">
                    No reservations match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((r) =>
                  editId === r._id ? (
                    /* Inline edit row */
                    <tr key={r._id} className="bg-accent/30">
                      <td className="px-5 py-3">
                        <input
                          value={editForm.customerName ?? ''}
                          onChange={(e) => setEditForm((p) => ({ ...p, customerName: e.target.value }))}
                          className="w-full px-2 py-1 rounded-lg border border-input bg-background text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      </td>
                      <td className="px-5 py-3">
                        <input
                          type="date"
                          value={editForm.date ?? ''}
                          onChange={(e) => setEditForm((p) => ({ ...p, date: e.target.value }))}
                          className="px-2 py-1 rounded-lg border border-input bg-background text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      </td>
                      <td className="px-5 py-3">
                        <select
                          value={editForm.timeSlot ?? ''}
                          onChange={(e) => setEditForm((p) => ({ ...p, timeSlot: e.target.value }))}
                          className="px-2 py-1 rounded-lg border border-input bg-background text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">Table {r.table?.tableNumber || 'TBD'}</td>
                      <td className="px-5 py-3">
                        <input
                          type="number"
                          value={editForm.guests ?? ''}
                          onChange={(e) => setEditForm((p) => ({ ...p, guests: Number(e.target.value) }))}
                          className="w-16 px-2 py-1 rounded-lg border border-input bg-background text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      </td>
                      <td className="px-5 py-3">
                        <select
                          value={editForm.status ?? ''}
                          onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as ReservationStatus }))}
                          className="px-2 py-1 rounded-lg border border-input bg-background text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          {(['confirmed', 'pending', 'completed', 'cancelled'] as ReservationStatus[]).map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={saveEdit}
                            disabled={saving}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-60"
                            aria-label="Save"
                          >
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                            aria-label="Discard"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    /* Read-only row */
                    <tr key={r._id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-foreground">{r.customerName}</p>
                        <p className="text-xs text-muted-foreground">{r.email}</p>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">
                        {new Date(r.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">{r.timeSlot}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">Table {r.table?.tableNumber || 'TBD'}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">{r.guests}</td>
                      <td className="px-5 py-3.5"><ReservationBadge status={r.status as any} /></td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEdit(r)}
                            className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-accent hover:text-primary transition-colors"
                            aria-label="Edit reservation"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          {r.status !== 'cancelled' && r.status !== 'completed' && (
                            <button
                              onClick={() => cancelReservation(r._id)}
                              className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                              aria-label="Cancel reservation"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
