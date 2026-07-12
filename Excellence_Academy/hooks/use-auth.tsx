'use client'

import * as React from 'react'
import { demoUsers } from '@/data/users'
import type { Role, User } from '@/types'

const STORAGE_KEY = 'bf_auth_user'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  loginAs: (role: Role) => Promise<User>
  register: (data: { name: string; email: string; phone: string }) => Promise<User>
  logout: () => void
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

function stripPassword(u: (typeof demoUsers)[number]): User {
  const { password: _password, ...rest } = u
  return rest
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setUser(JSON.parse(stored))
    } catch {
      // ignore corrupted storage
    }
    setLoading(false)
  }, [])

  const persist = React.useCallback((u: User | null) => {
    setUser(u)
    if (typeof window !== 'undefined') {
      if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
      else localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const login = React.useCallback(
    async (email: string, password: string) => {
      await new Promise((r) => setTimeout(r, 600))
      const match = demoUsers.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
      )
      if (!match) throw new Error('Invalid email or password')
      const clean = stripPassword(match)
      persist(clean)
      return clean
    },
    [persist],
  )

  const loginAs = React.useCallback(
    async (role: Role) => {
      await new Promise((r) => setTimeout(r, 400))
      const match = demoUsers.find((u) => u.role === role)
      if (!match) throw new Error('Demo account not found')
      const clean = stripPassword(match)
      persist(clean)
      return clean
    },
    [persist],
  )

  const register = React.useCallback(
    async (data: { name: string; email: string; phone: string }) => {
      await new Promise((r) => setTimeout(r, 700))
      const newUser: User = {
        id: `s-${Date.now()}`,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: 'student',
        avatar: 'https://i.pravatar.cc/300?img=12',
      }
      persist(newUser)
      return newUser
    },
    [persist],
  )

  const logout = React.useCallback(() => persist(null), [persist])

  const value = React.useMemo(
    () => ({ user, loading, login, loginAs, register, logout }),
    [user, loading, login, loginAs, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
