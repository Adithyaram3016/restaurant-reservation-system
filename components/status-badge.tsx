'use client'

import { cn } from '@/lib/utils'
import type { ReservationStatus, TableStatus } from '@/lib/data'

const reservationConfig: Record<ReservationStatus, { label: string; className: string }> = {
  confirmed:  { label: 'Confirmed',  className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  pending:    { label: 'Pending',    className: 'bg-amber-50  text-amber-700  ring-amber-200'    },
  cancelled:  { label: 'Cancelled',  className: 'bg-red-50    text-red-700    ring-red-200'      },
  completed:  { label: 'Completed',  className: 'bg-slate-100 text-slate-600  ring-slate-200'    },
}

const tableConfig: Record<TableStatus, { label: string; className: string }> = {
  available: { label: 'Available', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  occupied:  { label: 'Occupied',  className: 'bg-red-50     text-red-700    ring-red-200'      },
  reserved:  { label: 'Reserved',  className: 'bg-amber-50   text-amber-700  ring-amber-200'    },
}

interface ReservationBadgeProps {
  status: ReservationStatus
}

export function ReservationBadge({ status }: ReservationBadgeProps) {
  const cfg = reservationConfig[status]
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', cfg.className)}>
      {cfg.label}
    </span>
  )
}

interface TableStatusBadgeProps {
  status: TableStatus
}

export function TableStatusBadge({ status }: TableStatusBadgeProps) {
  const cfg = tableConfig[status]
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', cfg.className)}>
      <span className={cn('mr-1.5 h-1.5 w-1.5 rounded-full',
        status === 'available' ? 'bg-emerald-500' :
        status === 'occupied'  ? 'bg-red-500'     : 'bg-amber-500'
      )} />
      {cfg.label}
    </span>
  )
}
