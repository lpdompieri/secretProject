"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar, type MenuSection } from "@/components/dashboard/dashboard-sidebar"
import { CockpitContent } from "@/components/dashboard/cockpit/cockpit-content"
import { ProductsContent } from "@/components/dashboard/products/products-content"
import { PaymentContent } from "@/components/payment/payment-content"
import { OrdersContent } from "@/components/orders/orders-content"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

// Componente placeholder para secoes nao implementadas
function PlaceholderContent({ title }: { title: string }) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground mt-1">
          Esta secao esta em desenvolvimento
        </p>
      </header>
      <div className="flex items-center justify-center h-64 bg-muted/50 rounded-lg border-2 border-dashed border-border">
        <p className="text-muted-foreground">Conteudo em breve</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<MenuSection>("cockpit")

  // Verificar autenticacao
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  // Nao renderizar ate verificar autenticacao
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
        return <PlaceholderContent title="Empresa" />
      case "usuario":
        return <PlaceholderContent title="Usuario" />
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
