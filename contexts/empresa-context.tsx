"use client"

import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getAllEmpresas } from "@/mocks/empresas"

interface EmpresaOption {
  codigo: string
  nome: string
}

interface EmpresaContextType {
  empresaAtiva: string        // codigo da empresa ativa, ou "TODAS"
  setEmpresaAtiva: (codigo: string) => void
  empresas: EmpresaOption[]   // lista completa (sem "Todas")
  empresasComTodas: EmpresaOption[] // lista com opcao "Todas" no inicio (para Master)
  isTodasSelecionada: boolean
}

const EmpresaContext = createContext<EmpresaContextType | undefined>(undefined)

export function EmpresaProvider({ children }: { children: ReactNode }) {
  const { user, isMaster } = useAuth()
  const [empresaAtiva, setEmpresaAtivaState] = useState<string>("")

  const empresas = useMemo(() => getAllEmpresas(), [])

  const empresasComTodas = useMemo(() => [
    { codigo: "TODAS", nome: "Todas as Empresas" },
    ...empresas,
  ], [empresas])

  // Sincronizar empresa ativa com o usuario logado
  useEffect(() => {
    if (user) {
      if (isMaster) {
        // Master inicia com "Todas" selecionada
        setEmpresaAtivaState("TODAS")
      } else {
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
    empresasComTodas,
    isTodasSelecionada: empresaAtiva === "TODAS",
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
