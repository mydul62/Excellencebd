'use client'

import * as React from 'react'
import type { Role, User } from '@/types'
import {
  loginApi,
  registerApi,
  saveAccessToken,
  clearAccessToken,
  type ServerRole,
  type ServerUser,
} from '@/serverdata/auth'

const STORAGE_KEY = 'bf_auth_user'

interface RegisterData {
  name: string
  email: string
  password: string
  phone?: string
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (data: RegisterData) => Promise<User>
  logout: () => void
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

function mapRole(role: ServerRole): Role {
  return role.toLowerCase() as Role
}

function toClientUser(serverUser: ServerUser): User {
  return {
    id: serverUser.id,
    name: serverUser.name,
    email: serverUser.email,
    role: mapRole(serverUser.role),
    avatar: serverUser.avatar ?? undefined,
    phone: serverUser.phone ?? undefined,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setUser(JSON.parse(stored))
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    } finally {
      setLoading(false)
    }
  }, [])

  const persist = React.useCallback((u: User | null) => {
    setUser(u)

    if (typeof window !== 'undefined') {
      if (u) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  const login = React.useCallback(
    async (email: string, password: string): Promise<User> => {
      const { user: serverUser, accessToken } = await loginApi({
        email,
        password,
      })

      saveAccessToken(accessToken)

      const clientUser = toClientUser(serverUser)

      persist(clientUser)

      return clientUser
    },
    [persist],
  )

  const register = React.useCallback(
    async (data: RegisterData): Promise<User> => {
      const { user: serverUser, accessToken } = await registerApi({
        name: data.name,
        email: data.email,
        password: data.password, // ✅ FIXED
        phone: data.phone,
      })

      saveAccessToken(accessToken)

      const clientUser = toClientUser(serverUser)

      persist(clientUser)

      return clientUser
    },
    [persist],
  )

  const logout = React.useCallback(() => {
    clearAccessToken()
    persist(null)
  }, [persist])

  const value = React.useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
    }),
    [user, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)

  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return ctx
}