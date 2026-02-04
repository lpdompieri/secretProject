"use client"

import { useState, useEffect, useCallback } from "react"
import { ClipboardList, CreditCard, DollarSign, AlertCircle, Loader2 } from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"

// Constante para URL da API - ajuste conforme seu backend
const API_URL = "/api/dashboard"

interface DashboardData {
  totalPedidos: number
  totalPagamentos: number
  valorTotal: number
  trends: {
    pedidos: number
    pagamentos: number
    valor: number
  }
}

// Dados mockados enquanto a API nao esta pronta
const MOCK_DATA: DashboardData = {
  totalPedidos: 47,
  totalPagamentos: 38,
  valorTotal: 125750.0,
  trends: {
    pedidos: 12,
    pagamentos: 8,
    valor: 15,
  },
}

// Formatar data atual em portugues
function formatCurrentDate(): string {
  const date = new Date()
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

// Formatar valor em reais
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function CockpitContent() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Funcao para buscar dados do dashboard
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // TODO: Descomentar quando o backend estiver pronto
      /*
      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Adicionar token JWT quando implementado
          // "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Erro ao carregar dados do dashboard")
      }

      const data = await response.json()
      setDashboardData(data)
      */

      // Simulacao de delay da API
      await new Promise((resolve) => setTimeout(resolve, 800))
      
      // Usar dados mockados
      setDashboardData(MOCK_DATA)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar dados"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  return (
    <div className="space-y-6">
      {/* Titulo e data */}
      <header>
        <h1 className="text-3xl font-bold text-foreground">Cockpit</h1>
        <p className="text-muted-foreground mt-1">
          {formatCurrentDate()}
        </p>
      </header>

      {/* Mensagem de erro */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
          <button
            onClick={fetchDashboardData}
            className="ml-auto text-sm font-medium underline hover:no-underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Cards de estatisticas */}
      <section aria-label="Estatisticas do dia">
        <h2 className="sr-only">Resumo do dia</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total de Pedidos Hoje"
            value={dashboardData?.totalPedidos ?? 0}
            icon={ClipboardList}
            description="pedidos realizados"
            trend={dashboardData ? {
              value: dashboardData.trends.pedidos,
              isPositive: dashboardData.trends.pedidos >= 0
            } : undefined}
            isLoading={isLoading}
          />
          <StatCard
            title="Pagamentos Processados"
            value={dashboardData?.totalPagamentos ?? 0}
            icon={CreditCard}
            description="pagamentos confirmados"
            trend={dashboardData ? {
              value: dashboardData.trends.pagamentos,
              isPositive: dashboardData.trends.pagamentos >= 0
            } : undefined}
            isLoading={isLoading}
          />
          <StatCard
            title="Valor Total do Dia"
            value={dashboardData ? formatCurrency(dashboardData.valorTotal) : "R$ 0,00"}
            icon={DollarSign}
            description="em transacoes"
            trend={dashboardData ? {
              value: dashboardData.trends.valor,
              isPositive: dashboardData.trends.valor >= 0
            } : undefined}
            isLoading={isLoading}
          />
        </div>
      </section>

      {/* Loading indicator global */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          <span>Carregando dados...</span>
        </div>
      )}
    </div>
  )
}
