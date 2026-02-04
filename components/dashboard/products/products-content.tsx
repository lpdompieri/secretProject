"use client"

import { useState } from "react"
import { ProductSearch } from "./product-search"
import { ProductRegister } from "./product-register"

type ProductView = "search" | "register"

export function ProductsContent() {
  const [currentView, setCurrentView] = useState<ProductView>("search")

  return (
    <div className="space-y-6">
      {/* Titulo da secao */}
      <header>
        <h1 className="text-3xl font-bold text-foreground">Produtos</h1>
        <p className="text-muted-foreground mt-1">
          {currentView === "search" 
            ? "Consulte ou cadastre produtos no sistema"
            : "Cadastre novos produtos no sistema"
          }
        </p>
      </header>

      {/* Conteudo baseado na view atual */}
      {currentView === "search" ? (
        <ProductSearch onNavigateToCadastro={() => setCurrentView("register")} />
      ) : (
        <ProductRegister onBack={() => setCurrentView("search")} />
      )}
    </div>
  )
}
