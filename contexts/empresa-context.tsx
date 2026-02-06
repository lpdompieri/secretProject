"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getAllEmpresas } from "@/mocks/empresas"

interface EmpresaContextType {
  empresaAtiva: string
  setEmpresaAtiva: (codigo: string) => void
  empresas: { codigo: string; nome: string }[]
}

const EmpresaContext = createContext<EmpresaContextType | undefined>(undefined)

export function EmpresaProvider({ children }: { children: ReactNode }) {
  const { user, isMaster } = useAuth()
  const [empresaAtiva, setEmpresaAtivaState] = useState<string>("")

  const empresas = getAllEmpresas()

  // Sincronizar empresa ativa com o usuario logado
  useEffect(() => {
    if (user) {
      if (isMaster) {
        // Master inicia sem empresa selecionada, pode escolher
        setEmpresaAtivaState(empresas.length > 0 ? empresas[0].codigo : "")
      } else {
        // Usuarios normais usam a empresa do seu cadastro
        setEmpresaAtivaState(user.empresa)
      }
    } else {
      setEmpresaAtivaState("")
    }
  }, [user, isMaster, empresas])

  const setEmpresaAtiva = useCallback((codigo: string) => {
    setEmpresaAtivaState(codigo)
  }, [])

  const value: EmpresaContextType = {
    empresaAtiva,
    setEmpresaAtiva,
    empresas,
  }

  return <EmpresaContext.Provider value={value}>{children}</EmpresaContext.Provider>
}

export function useEmpresa() {
  const context = useContext(EmpresaContext)
  if (context === undefined) {
    throw new Error("useEmpresa deve ser usado dentro de um EmpresaProvider")
  }
  return context
}
