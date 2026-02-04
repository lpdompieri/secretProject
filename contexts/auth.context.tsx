"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"

// Tipos para o usuário e contexto de autenticação
export interface User {
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (user: User, token?: string) => void
  logout: () => void
  // Preparado para JWT no futuro
  token: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Constante para a chave do token (preparado para JWT)
const TOKEN_KEY = "auth_token"
const USER_KEY = "auth_user"

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  const login = useCallback((userData: User, authToken?: string) => {
    setUser(userData)
    if (authToken) {
      setToken(authToken)
      // TODO: Armazenar token de forma segura (httpOnly cookie via API é recomendado)
      // sessionStorage.setItem(TOKEN_KEY, authToken)
    }
    // sessionStorage.setItem(USER_KEY, JSON.stringify(userData))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    // Limpar storage quando implementado
    // sessionStorage.removeItem(TOKEN_KEY)
    // sessionStorage.removeItem(USER_KEY)
    
    // TODO: Chamar API de logout para invalidar token no servidor
    // await fetch('/api/auth/logout', { method: 'POST' })
    
    router.push("/")
  }, [router])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
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
