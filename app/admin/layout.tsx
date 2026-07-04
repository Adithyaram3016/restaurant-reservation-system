'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { AdminSidebar } from '@/components/admin-sidebar'
import { MobileNav } from '@/components/mobile-nav'
import { useAuth } from '@/lib/auth-context'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const isAdminLogin = pathname === '/admin/login'

  useEffect(() => {
    if (!loading) {
      if (isAdminLogin) {
        if (user?.role === 'admin') {
          router.replace('/admin')
        }
      } else {
        if (!user) {
          router.replace('/login')
        } else if (user.role !== 'admin') {
          router.replace('/dashboard')
        }
      }
    }
  }, [user, loading, router, isAdminLogin])

  if (isAdminLogin) {
    return <>{children}</>
  }

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileNav variant="admin" />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
