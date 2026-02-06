"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"

// Tipos para o usuario e contexto de autenticacao
export interface User {
  cpf: string
  name: string
  email: string
  empresa: string
  perfil: "Vendedor" | "Gerente" | "Financeiro" | "Master"
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isMaster: boolean
  login: (user: User, token?: string) => void
  logout: () => void
  token: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  const login = useCallback((userData: User, authToken?: string) => {
    setUser(userData)
    if (authToken) {
      setToken(authToken)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    router.push("/")
  }, [router])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isMaster: user?.perfil === "Master",
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
