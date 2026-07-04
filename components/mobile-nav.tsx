'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Menu, X, LayoutDashboard, CalendarPlus, BookOpen, User, LogOut,
  UtensilsCrossed, CalendarDays, LayoutGrid, Users,
} from 'lucide-react'

const CUSTOMER_NAV = [
  { label: 'Dashboard',        href: '/dashboard',              icon: LayoutDashboard },
  { label: 'Book Reservation', href: '/dashboard/book',         icon: CalendarPlus    },
  { label: 'My Reservations',  href: '/dashboard/reservations', icon: BookOpen        },
  { label: 'Profile',          href: '/dashboard/profile',      icon: User            },
]

const ADMIN_NAV = [
  { label: 'Dashboard',      href: '/admin',              icon: LayoutDashboard },
  { label: 'Reservations',   href: '/admin/reservations', icon: CalendarDays    },
  { label: 'Manage Tables',  href: '/admin/tables',       icon: LayoutGrid      },
  { label: 'Users',          href: '/admin/users',        icon: Users           },
]

import { useAuth } from '@/lib/auth-context'

interface MobileNavProps {
  variant: 'customer' | 'admin'
}

export function MobileNav({ variant }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { logout } = useAuth()
  const nav = variant === 'customer' ? CUSTOMER_NAV : ADMIN_NAV
  const label = variant === 'customer' ? 'Customer Portal' : 'Admin Panel'

  return (
    <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-card border-b border-border">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
          <UtensilsCrossed className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <p className="font-semibold text-sm text-foreground leading-tight">TableMaster</p>
          <p className="text-[10px] text-muted-foreground">{label}</p>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        <span className="sr-only">Toggle menu</span>
      </Button>

      {open && (
        <div className="absolute top-full left-0 right-0 bg-card border-b border-border shadow-lg">
          <nav className="px-3 py-3 space-y-0.5">
            {nav.map(({ label, href, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className={cn('w-4 h-4', active ? 'text-primary' : '')} />
                  {label}
                </Link>
              )
            })}
            <button
              onClick={() => {
                setOpen(false)
                logout()
              }}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
