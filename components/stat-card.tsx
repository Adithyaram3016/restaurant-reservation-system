import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  iconClassName?: string
  trend?: { value: string; positive: boolean }
}

export function StatCard({ title, value, description, icon: Icon, iconClassName, trend }: StatCardProps) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1.5 text-3xl font-bold text-foreground">{value}</p>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <p className={cn('mt-1.5 text-xs font-medium', trend.positive ? 'text-emerald-600' : 'text-red-500')}>
              {trend.positive ? '▲' : '▼'} {trend.value}
            </p>
          )}
        </div>
        <div className={cn('flex items-center justify-center w-11 h-11 rounded-xl', iconClassName ?? 'bg-accent')}>
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </div>
  )
}
