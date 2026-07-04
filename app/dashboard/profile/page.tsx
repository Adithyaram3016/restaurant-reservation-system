'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { User, Mail, Phone, MapPin, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'

import { api } from '@/lib/api'

export default function ProfilePage() {
  const { user, loading: authLoading, refreshUser } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || '',
      })
    }
  }, [user])

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.auth.updateProfile({
        name: form.name,
        email: form.email,
        phone: form.phone,
        city: form.city
      })
      await refreshUser()
      toast.success('Profile details saved successfully.')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile.')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  const initials = form.name
    ? form.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account details.</p>
      </div>

      {/* Avatar */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6 flex items-center gap-5">
        <div className="flex-none w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground animate-pulse-subtle">
          {initials}
        </div>
        <div>
          <p className="font-semibold text-foreground">{form.name || 'User'}</p>
          <p className="text-sm text-muted-foreground">{form.email || 'Email'}</p>
          <Button variant="outline" size="sm" className="mt-2 text-xs">
            Change photo
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6 sm:p-8">
        <h2 className="font-semibold text-foreground mb-5">Personal Information</h2>
        <form onSubmit={handleSave} className="space-y-5">
          {[
            { id: 'name',  label: 'Full name',    icon: User,    type: 'text',  autoComplete: 'name'  },
            { id: 'email', label: 'Email address', icon: Mail,    type: 'email', autoComplete: 'email' },
            { id: 'phone', label: 'Phone number',  icon: Phone,   type: 'tel',   autoComplete: 'tel'   },
            { id: 'city',  label: 'City',          icon: MapPin,  type: 'text',  autoComplete: 'address-level2' },
          ].map(({ id, label, icon: Icon, type, autoComplete }) => (
            <div key={id} className="space-y-1.5">
              <label htmlFor={id} className="text-sm font-medium text-foreground">{label}</label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id={id}
                  type={type}
                  autoComplete={autoComplete}
                  value={form[id as keyof typeof form]}
                  onChange={set(id as keyof typeof form)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                />
              </div>
            </div>
          ))}

          <Button type="submit" disabled={loading} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            {loading ? 'Saving…' : 'Save changes'}
          </Button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="bg-card border border-destructive/30 rounded-2xl shadow-sm p-6">
        <h2 className="font-semibold text-foreground mb-1">Danger Zone</h2>
        <p className="text-sm text-muted-foreground mb-4">Permanently delete your account and all reservation history.</p>
        <Button variant="destructive" size="sm" onClick={() => toast.error('Account deletion is disabled in demo mode.')}>
          Delete account
        </Button>
      </div>
    </div>
  )
}
