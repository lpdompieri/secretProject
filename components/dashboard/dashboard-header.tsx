"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Menu, LogOut, Building2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useEmpresa } from "@/contexts/empresa-context"

interface DashboardHeaderProps {
  onMenuClick: () => void
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { user, isMaster, logout } = useAuth()
  const { empresaAtiva, setEmpresaAtiva, empresas, empresasComTodas } = useEmpresa()

  // Busca o nome da empresa ativa para exibir em usuarios nao-master
  const nomeEmpresaAtiva = empresas.find((e) => e.codigo === empresaAtiva)?.nome || empresaAtiva

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-primary shadow-md">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            aria-label="Abrir menu"
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </Button>
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-lg bg-primary-foreground flex items-center justify-center"
              aria-hidden="true"
            >
              <span className="text-primary font-bold text-sm">B</span>
            </div>
            <span className="text-lg font-bold text-primary-foreground hidden sm:block">
              FinviaPay
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Master: combo com opcao "Todas" + empresas */}
          {user && isMaster && (
            <div className="hidden sm:flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary-foreground" aria-hidden="true" />
              <Select value={empresaAtiva} onValueChange={setEmpresaAtiva}>
                <SelectTrigger 
                  className="w-56 h-8 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground text-sm focus:ring-primary-foreground/30"
                  aria-label="Selecionar empresa"
                >
                  <SelectValue placeholder="Selecionar empresa" />
                </SelectTrigger>
                <SelectContent>
                  {empresasComTodas.map((emp) => (
                    <SelectItem key={emp.codigo} value={emp.codigo}>
                      {emp.codigo === "TODAS" ? emp.nome : `${emp.codigo} - ${emp.nome}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Nao-Master: mostra empresa fixa */}
          {user && !isMaster && user.empresa && (
            <div className="hidden sm:flex items-center gap-2 text-primary-foreground text-sm">
              <Building2 className="h-4 w-4" aria-hidden="true" />
              <span>
                Empresa: <span className="font-semibold">{nomeEmpresaAtiva}</span>
              </span>
            </div>
          )}

          <span className="text-primary-foreground text-sm hidden md:block">
            Ola, <span className="font-medium">{user?.name || "Usuario"}</span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-primary-foreground hover:bg-primary-foreground/10 gap-2"
            aria-label="Sair da conta"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
