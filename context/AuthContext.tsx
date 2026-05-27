'use client'

import {
  createContext, useContext, useState, useEffect, useCallback,
  type ReactNode,
} from 'react'
import {
  getSession, setSession, clearSession,
  type AuthUser,
} from '@/lib/auth'

// ── Context shape ──────────────────────────────────────────────
interface AuthContextValue {
  user:     AuthUser | null
  isLoaded: boolean          // false until localStorage is read (avoid hydration flash)
  login:    (user: AuthUser) => void
  logout:   () => void
  refresh:  (updates: Partial<AuthUser>) => void  // e.g. cashback changes
}

// ── Context ────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue>({
  user:     null,
  isLoaded: false,
  login:    () => {},
  logout:   () => {},
  refresh:  () => {},
})

// ── Provider ───────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,     setUser]     = useState<AuthUser | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Hydrate from localStorage once on mount
  useEffect(() => {
    setUser(getSession())
    setIsLoaded(true)
  }, [])

  const login = useCallback((u: AuthUser) => {
    setSession(u)
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  const refresh = useCallback((updates: Partial<AuthUser>) => {
    setUser(prev => {
      if (!prev) return prev
      const next = { ...prev, ...updates }
      setSession(next)
      return next
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoaded, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook ───────────────────────────────────────────────────────
export const useAuth = () => useContext(AuthContext)
