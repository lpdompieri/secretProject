"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar, type MenuSection } from "@/components/dashboard/dashboard-sidebar"
import { CockpitContent } from "@/components/dashboard/cockpit/cockpit-content"
import { ProductsContent } from "@/components/dashboard/products/products-content"
import { EmpresaContent } from "@/components/dashboard/empresa/empresa-content"
import { GerenciarUsuariosContent } from "@/components/dashboard/usuarios/gerenciar-usuarios-content"
import { PerfisContent } from "@/components/dashboard/usuarios/perfis-content"
import { PaymentContent } from "@/components/payment/payment-content"
import { OrdersContent } from "@/components/orders/orders-content"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, isAuthLoading } = useAuth()
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<MenuSection>("cockpit")

  // Verificar autenticacao somente apos o carregamento inicial
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, isAuthLoading, router])

  // Mostrar loading enquanto verifica autenticacao
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">Carregando...</span>
        </div>
      </div>
    )
  }

  // Nao renderizar se nao autenticado (redirect vai acontecer via useEffect)
  if (!isAuthenticated) {
    return null
  }

  // Renderizar conteudo baseado na secao ativa
  function renderContent() {
    switch (activeSection) {
      case "cockpit":
        return <CockpitContent />
      case "produtos":
        return <ProductsContent />
      case "empresa":
        return <EmpresaContent />
      case "gerenciar-usuarios":
        return <GerenciarUsuariosContent />
      case "perfis-usuarios":
        return <PerfisContent />
      case "pagamento":
        return <PaymentContent />
      case "pedidos":
        return <OrdersContent />
      default:
        return <CockpitContent />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
      <DashboardSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <main
        className={cn(
          "pt-16 min-h-screen transition-all duration-300",
          "lg:pl-64"
        )}
      >
        <div className="p-6 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}
