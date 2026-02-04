"use client"

import { Button } from "@/components/ui/button"
import { Menu, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface DashboardHeaderProps {
  onMenuClick: () => void
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { user, logout } = useAuth()

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
              BNDES
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-primary-foreground text-sm hidden sm:block">
            Olá, <span className="font-medium">{user?.name || "Usuário"}</span>
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
