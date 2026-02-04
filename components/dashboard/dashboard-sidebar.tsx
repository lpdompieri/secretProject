"use client"

import React from "react"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Building2, Users, Package, CreditCard, ClipboardList, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface MenuItem {
  label: string
  icon: React.ElementType
  href: string
}

const menuItems: MenuItem[] = [
  { label: "Empresa", icon: Building2, href: "/dashboard/empresa" },
  { label: "Usuário", icon: Users, href: "/dashboard/usuario" },
  { label: "Produtos", icon: Package, href: "/dashboard/produtos" },
  { label: "Pagamento", icon: CreditCard, href: "/dashboard/pagamento" },
  { label: "Pedidos", icon: ClipboardList, href: "/dashboard/pedidos" },
]

interface DashboardSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const sidebarRef = useRef<HTMLElement>(null)

  // Fechar sidebar ao pressionar Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  // Gerenciar foco e scroll do body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      sidebarRef.current?.focus()
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-foreground/50 transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        role="navigation"
        aria-label="Menu principal"
        tabIndex={-1}
        className={cn(
          "fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-64 bg-card shadow-xl",
          "transform transition-transform duration-300 ease-in-out",
          "lg:translate-x-0 lg:shadow-md",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border lg:hidden">
          <span className="font-semibold text-foreground">Menu</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Fechar menu"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2" role="list">
            {menuItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg",
                    "text-foreground hover:bg-muted transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-ring"
                  )}
                  onClick={(e) => {
                    e.preventDefault()
                    // TODO: Implementar navegação real
                    // router.push(item.href)
                    onClose()
                  }}
                >
                  <item.icon className="h-5 w-5 text-secondary" aria-hidden="true" />
                  <span className="font-medium">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  )
}
