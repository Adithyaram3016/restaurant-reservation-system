'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { CustomerSidebar } from '@/components/customer-sidebar'
import { MobileNav } from '@/components/mobile-nav'
import { useAuth } from '@/lib/auth-context'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login')
      } else if (user.role !== 'customer') {
        router.replace('/admin')
      }
    }
  }, [user, loading, router])

  if (loading || !user || user.role !== 'customer') {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <CustomerSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileNav variant="customer" />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
