'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api, setToken, getToken } from './api'
import { toast } from 'sonner'

export interface User {
  id: string
  name: string
  email: string
  role: 'customer' | 'admin'
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (credentials: any, requiredRole?: 'customer' | 'admin') => Promise<void>
  register: (details: any) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      const token = getToken()
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await api.auth.getMe()
        setUser(response.user)
      } catch (error) {
        console.error('Session validation failed:', error)
        setToken(null)
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  const login = async (credentials: any, requiredRole?: 'customer' | 'admin') => {
    try {
      const response = await api.auth.login(credentials)
      if (requiredRole && response.user.role !== requiredRole) {
        throw new Error(
          requiredRole === 'admin'
            ? 'Access denied. This login is for administrators only.'
            : 'Access denied. Please use the Admin login portal.'
        )
      }
      setToken(response.token)
      setUser(response.user)
      toast.success(response.user.role === 'admin' ? 'Welcome back, Admin!' : 'Welcome back!')
      if (response.user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed.')
      throw error
    }
  }

  const register = async (details: any) => {
    try {
      const response = await api.auth.register(details)
      setToken(response.token)
      setUser(response.user)
      toast.success('Account created! Welcome to TableMaster.')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Registration failed.')
      throw error
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    toast.success('Logged out successfully.')
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
