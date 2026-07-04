'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  CalendarDays, Clock, Users, TableProperties, ChevronDown, CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TIME_SLOTS } from '@/lib/data'

import { api } from '@/lib/api'

interface FormState {
  date: string
  timeSlot: string
  guests: string
}

interface FormErrors {
  date?: string
  timeSlot?: string
  guests?: string
}

export default function BookReservationPage() {
  const router = useRouter()
  const localToday = new Date()
  const yyyy = localToday.getFullYear()
  const mm = String(localToday.getMonth() + 1).padStart(2, '0')
  const dd = String(localToday.getDate()).padStart(2, '0')
  const today = `${yyyy}-${mm}-${dd}`
  const [form, setForm] = useState<FormState>({ date: '', timeSlot: '', guests: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [assignedTable, setAssignedTable] = useState<number | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((p) => ({ ...p, [field]: e.target.value }))
      setErrors((p) => ({ ...p, [field]: undefined }))
      setApiError(null)
    }
  }

  function validate() {
    const e: FormErrors = {}
    if (!form.date) e.date = 'Please select a date.'
    else if (form.date < today) e.date = 'Date must be today or in the future.'
    if (!form.timeSlot) e.timeSlot = 'Please select a time slot.'
    if (!form.guests) e.guests = 'Number of guests is required.'
    else if (Number(form.guests) < 1 || Number(form.guests) > 20) e.guests = 'Guests must be between 1 and 20.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setApiError(null)
    try {
      const res = await api.reservations.create({
        date: form.date,
        timeSlot: form.timeSlot,
        guests: Number(form.guests)
      })
      const tableNum = res.reservation.table?.tableNumber || 1
      setAssignedTable(tableNum)
      setSubmitted(true)
      toast.success(res.message || `Table ${tableNum} reserved successfully!`)
    } catch (error: any) {
      setApiError(error.message || 'Failed to book reservation.')
      toast.error(error.message || 'Failed to book reservation.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted && assignedTable) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-card border border-border rounded-2xl shadow-sm p-10 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Reservation Confirmed!</h2>
          <p className="text-muted-foreground text-sm mb-8">
            Your table has been successfully reserved. We look forward to welcoming you.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-8 text-left">
            {[
              { label: 'Date',        value: new Date(form.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
              { label: 'Time',        value: form.timeSlot },
              { label: 'Guests',      value: `${form.guests} ${Number(form.guests) === 1 ? 'guest' : 'guests'}` },
              { label: 'Table',       value: `Table ${assignedTable}` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-muted rounded-xl px-4 py-3">
                <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="flex-1" onClick={() => { setSubmitted(false); setForm({ date: '', timeSlot: '', guests: '' }); setAssignedTable(null) }}>
              Make another
            </Button>
            <Button className="flex-1" onClick={() => router.push('/dashboard/reservations')}>
              My reservations
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Book a Reservation</h1>
        <p className="text-sm text-muted-foreground mt-1">Fill in the details below to reserve your table.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Date */}
          <div className="space-y-1.5">
            <label htmlFor="date" className="text-sm font-medium text-foreground flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-muted-foreground" /> Reservation Date
            </label>
            <input
              id="date"
              type="date"
              min={today}
              value={form.date}
              onChange={set('date')}
              className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
            />
            {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
          </div>

          {/* Time Slot */}
          <div className="space-y-1.5">
            <label htmlFor="timeSlot" className="text-sm font-medium text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" /> Time Slot
            </label>
            <div className="relative">
              <select
                id="timeSlot"
                value={form.timeSlot}
                onChange={set('timeSlot')}
                className="w-full appearance-none px-4 py-2.5 pr-10 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
              >
                <option value="">Select a time…</option>
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
            {errors.timeSlot && <p className="text-xs text-destructive">{errors.timeSlot}</p>}
          </div>

          {/* Guests */}
          <div className="space-y-1.5">
            <label htmlFor="guests" className="text-sm font-medium text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" /> Number of Guests
            </label>
            <input
              id="guests"
              type="number"
              min={1}
              max={20}
              value={form.guests}
              onChange={set('guests')}
              placeholder="e.g. 2"
              className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
            />
            {errors.guests && <p className="text-xs text-destructive">{errors.guests}</p>}
          </div>

          {/* Assigned table (read-only, shown after submit) */}
          {assignedTable && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <TableProperties className="w-4 h-4 text-muted-foreground" /> Assigned Table
              </label>
              <div className="px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-medium text-emerald-700">
                Table {assignedTable}
              </div>
            </div>
          )}

          {/* API Error Box */}
          {apiError && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-500">
              <span className="font-semibold">Booking failed:</span> {apiError}
            </div>
          )}

          {/* Info box */}
          <div className="rounded-xl bg-accent border border-border p-4 text-sm text-muted-foreground">
            A table will be automatically assigned based on your party size and availability. You can cancel up to 2 hours before your reservation.
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Finding the perfect table…' : 'Reserve Table'}
          </Button>
        </form>
      </div>
    </div>
  )
}
