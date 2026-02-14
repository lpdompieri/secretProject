"use client"

import { useState, useEffect, useCallback } from "react"
import {
  ClipboardList,
  CreditCard,
  DollarSign,
  AlertCircle,
  Loader2,
  RefreshCw,
  FileWarning,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/dashboard/stat-card"

const API_URL = "/api/dashboard"

interface DashboardData {
  totalPedidos: number
  totalPagamentos: number
  valorTotal: number
  pedidosPendentesNfe: number
  trends: {
    pedidos: number
    pagamentos: number
    valor: number
    pendentes: number
  }
}

const MOCK_DATA: DashboardData = {
  totalPedidos: 47,
  totalPagamentos: 38,
  valorTotal: 125750.0,
  pedidosPendentesNfe: 6,
  trends: {
    pedidos: 12,
    pagamentos: 8,
    valor: 15,
    pendentes: -2,
  },
}

function formatCurrentDate(): string {
  return new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

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
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      setDashboardData(MOCK_DATA)
      setLastUpdate(new Date())
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar dados"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const pendenciasCriticas =
    dashboardData && dashboardData.pedidosPendentesNfe > 0

  return (
    <div className="space-y-8">

      {/* HEADER + ACTION BAR */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Cockpit Operacional</h1>
          <p className="text-muted-foreground">
            {formatCurrentDate()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {pendenciasCriticas && (
            <Badge variant="destructive" className="px-3 py-1">
              {dashboardData?.pedidosPendentesNfe} Pendências NFE
            </Badge>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* ALERTA DE ERRO */}
      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI GRID ENTERPRISE */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

        <StatCard
          title="Total de Pedidos"
          value={dashboardData?.totalPedidos ?? 0}
          icon={ClipboardList}
          description="Pedidos no período"
          trend={
            dashboardData
              ? {
                  value: dashboardData.trends.pedidos,
                  isPositive: dashboardData.trends.pedidos >= 0,
                }
              : undefined
          }
          isLoading={isLoading}
        />

        <StatCard
          title="Pagamentos Processados"
          value={dashboardData?.totalPagamentos ?? 0}
          icon={CreditCard}
          description="Pagamentos confirmados"
          trend={
            dashboardData
              ? {
                  value: dashboardData.trends.pagamentos,
                  isPositive: dashboardData.trends.pagamentos >= 0,
                }
              : undefined
          }
          isLoading={isLoading}
        />

        <StatCard
          title="Valor Transacionado"
          value={
            dashboardData
              ? formatCurrency(dashboardData.valorTotal)
              : "R$ 0,00"
          }
          icon={DollarSign}
          description="Volume financeiro"
          trend={
            dashboardData
              ? {
                  value: dashboardData.trends.valor,
                  isPositive: dashboardData.trends.valor >= 0,
                }
              : undefined
          }
          isLoading={isLoading}
        />

        {/* NOVO KPI CRÍTICO */}
        <StatCard
          title="Pendências de NFE → BNDES"
          value={dashboardData?.pedidosPendentesNfe ?? 0}
          icon={FileWarning}
          description="Aguardando envio"
          trend={
            dashboardData
              ? {
                  value: dashboardData.trends.pendentes,
                  isPositive: dashboardData.trends.pendentes < 0,
                }
              : undefined
          }
          isLoading={isLoading}
        />
      </section>

      {/* STATUS OPERACIONAL */}
      <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
        <span>
          {isLoading
            ? "Atualizando dados..."
            : "Sistema operacional"}
        </span>

        {lastUpdate && (
          <span>
            Última atualização:{" "}
            {lastUpdate.toLocaleTimeString("pt-BR")}
          </span>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Carregando indicadores...</span>
        </div>
      )}
    </div>
  )
}
