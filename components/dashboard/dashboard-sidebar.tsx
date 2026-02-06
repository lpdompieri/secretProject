"use client"

import React from "react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Building2, Users, Package, CreditCard, ClipboardList, X, LayoutDashboard, ChevronDown, UserCog, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

export type MenuSection = 
  | "cockpit" 
  | "empresa" 
  | "gerenciar-usuarios"
  | "perfis-usuarios"
  | "produtos" 
  | "pagamento" 
  | "pedidos"

interface MenuItem {
  label: string
  icon: React.ElementType
  section?: MenuSection
  submenu?: SubMenuItem[]
}

interface SubMenuItem {
  label: string
  icon: React.ElementType
  section: MenuSection
}

const menuItems: MenuItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, section: "cockpit" },
  { label: "Empresa", icon: Building2, section: "empresa" },
  { 
    label: "Usuarios", 
    icon: Users,
    submenu: [
      { label: "Gerenciar Usuarios", icon: UserCog, section: "gerenciar-usuarios" },
      { label: "Perfis de Usuarios", icon: ShieldCheck, section: "perfis-usuarios" },
    ]
  },
  { label: "Produtos", icon: Package, section: "produtos" },
  { label: "Pagamento", icon: CreditCard, section: "pagamento" },
  { label: "Pedidos", icon: ClipboardList, section: "pedidos" },
]

interface DashboardSidebarProps {
  isOpen: boolean
  onClose: () => void
  activeSection: MenuSection
  onSectionChange: (section: MenuSection) => void
}

export function DashboardSidebar({ 
  isOpen, 
  onClose, 
  activeSection, 
  onSectionChange 
}: DashboardSidebarProps) {
  const sidebarRef = useRef<HTMLElement>(null)
  const [openSubmenus, setOpenSubmenus] = useState<string[]>(["Usuarios"])

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

  function handleMenuClick(section: MenuSection) {
    onSectionChange(section)
    onClose()
  }

  function toggleSubmenu(label: string) {
    setOpenSubmenus((prev) =>
      prev.includes(label)
        ? prev.filter((l) => l !== label)
        : [...prev, label]
    )
  }

  function isSubmenuActive(item: MenuItem): boolean {
    if (!item.submenu) return false
    return item.submenu.some((sub) => sub.section === activeSection)
  }

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
          <ul className="space-y-1" role="list">
            {menuItems.map((item) => {
              // Item com submenu
              if (item.submenu) {
                const isOpen = openSubmenus.includes(item.label)
                const isActive = isSubmenuActive(item)

                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => toggleSubmenu(item.label)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-lg",
                        "transition-colors text-left",
                        "focus:outline-none focus:ring-2 focus:ring-ring",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted"
                      )}
                      aria-expanded={isOpen}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon 
                          className={cn(
                            "h-5 w-5",
                            isActive ? "text-primary" : "text-secondary"
                          )} 
                          aria-hidden="true" 
                        />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <ChevronDown 
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          isOpen && "rotate-180"
                        )} 
                        aria-hidden="true" 
                      />
                    </button>

                    {/* Submenu */}
                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-200",
                        isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                      )}
                    >
                      <ul className="ml-4 mt-1 space-y-1 border-l-2 border-border pl-4" role="list">
                        {item.submenu.map((sub) => (
                          <li key={sub.section}>
                            <button
                              type="button"
                              onClick={() => handleMenuClick(sub.section)}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
                                "transition-colors text-left text-sm",
                                "focus:outline-none focus:ring-2 focus:ring-ring",
                                activeSection === sub.section
                                  ? "bg-primary text-primary-foreground"
                                  : "text-foreground hover:bg-muted"
                              )}
                              aria-current={activeSection === sub.section ? "page" : undefined}
                            >
                              <sub.icon 
                                className={cn(
                                  "h-4 w-4",
                                  activeSection === sub.section
                                    ? "text-primary-foreground"
                                    : "text-secondary"
                                )} 
                                aria-hidden="true" 
                              />
                              <span className="font-medium">{sub.label}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                )
              }

              // Item simples (sem submenu)
              return (
                <li key={item.section}>
                  <button
                    type="button"
                    onClick={() => handleMenuClick(item.section!)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg",
                      "transition-colors text-left",
                      "focus:outline-none focus:ring-2 focus:ring-ring",
                      activeSection === item.section
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    )}
                    aria-current={activeSection === item.section ? "page" : undefined}
                  >
                    <item.icon 
                      className={cn(
                        "h-5 w-5",
                        activeSection === item.section 
                          ? "text-primary-foreground" 
                          : "text-secondary"
                      )} 
                      aria-hidden="true" 
                    />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>
    </>
  )
}
