"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { ServerSession } from "@/lib/auth/server-session"

// Tipos para o usuario e contexto de autenticacao
export interface User {
  cpf: string
  name: string
  email: string
  empresa: string
  perfil: "Vendedor" | "Gerente" | "Financeiro" | "Master"
  role?: string
  companyId?: string
  scopes?: string[]
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAuthLoading: boolean
  isMaster: boolean
  isAdmin: boolean
  scopes: string[]
  can: (scope: string) => boolean
  login: (user: User, token?: string) => void
  logout: () => void
  token: string | null
}

const AUTH_STORAGE_KEY = "finviapay_auth"

function getStoredAuth(): { user: User; token: string | null } | null {
  if (typeof window === "undefined") return null
  try {
    const stored = sessionStorage.getItem(AUTH_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // ignore
  }
  return null
}

function mapServerSessionToUser(session: ServerSession): User {
  return {
    cpf: session.userId,
    name: session.name,
    email: session.email,
    empresa: session.companyId,
    perfil: session.isAdmin ? "Master" : "Vendedor",
    role: session.role,
    companyId: session.companyId,
    scopes: session.scopes,
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
  initialSession?: ServerSession | null
}

export function AuthProvider({ children, initialSession = null }: AuthProviderProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(initialSession ? mapServerSessionToUser(initialSession) : null)
  const [token, setToken] = useState<string | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  // Restaurar sessao do sessionStorage ao montar
  useEffect(() => {
    const stored = getStoredAuth()
    if (stored) {
      setUser(stored.user)
      setToken(stored.token)
    }
    setIsAuthLoading(false)
  }, [])

  const login = useCallback((userData: User, authToken?: string) => {
    setUser(userData)
    const t = authToken ?? null
    setToken(t)
    try {
      sessionStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ user: userData, token: t })
      )
    } catch {
      // ignore
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    try {
      sessionStorage.removeItem(AUTH_STORAGE_KEY)
    } catch {
      // ignore
    }
    router.push("/")
  }, [router])

  const scopes = user?.scopes ?? []
  const isAdmin = user?.role === "ADMIN" || user?.perfil === "Master"
  const can = useCallback(
    (scope: string) => isAdmin || scopes.includes(scope),
    [isAdmin, scopes]
  )

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAuthLoading,
    isMaster: user?.perfil === "Master" || isAdmin,
    isAdmin,
    scopes,
    can,
    login,
    logout,
    token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}
