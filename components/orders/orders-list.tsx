"use client"

/**
 * =============================================================================
 * COMPONENTE - LISTAGEM DE PEDIDOS
 * =============================================================================
 * 
 * Responsabilidade: Exibir lista de pedidos com acoes por status
 * =============================================================================
 */

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  MoreVertical,
  Eye,
  Send,
  FileText,
  Upload,
  Loader2,
  Package,
  Store,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { listarPedidos } from "@/services/orders-service"
import { useEmpresa } from "@/contexts/empresa-context"
import type { Order, OrderStatus } from "@/types/order"
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/types/order"

// =============================================================================
// TIPOS
// =============================================================================

interface OrdersListProps {
  onViewReceipt: (order: Order) => void
  onViewDetails: (order: Order) => void
  onSendInvoice: (order: Order) => void
  onResendPayment: (order: Order) => void
}

// =============================================================================
// COMPONENTE BADGE DE STATUS
// =============================================================================

function StatusBadge({ status }: { status: OrderStatus }) {
  const colors = ORDER_STATUS_COLORS[status]
  const label = ORDER_STATUS_LABELS[status]

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
        colors.bg,
        colors.text,
        colors.border
      )}
    >
      {label}
    </span>
  )
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export function OrdersList({
  onViewReceipt,
  onViewDetails,
  onSendInvoice,
  onResendPayment,
}: OrdersListProps) {
  const { empresaAtiva } = useEmpresa()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "TODOS">("TODOS")

  // Carregar pedidos
  const loadOrders = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await listarPedidos()
      if (response.success) {
        setOrders(response.data)
        setFilteredOrders(response.data)
      }
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders, empresaAtiva])

  // Filtrar pedidos
  useEffect(() => {
    let filtered = orders

    // Filtro por empresa ativa (header)
    if (empresaAtiva && empresaAtiva !== "TODAS") {
      filtered = filtered.filter(order => order.loja.empresaCodigo === empresaAtiva)
    }

    // Filtro por status
    if (statusFilter !== "TODOS") {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Filtro por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        order =>
          order.numeroPedido.toLowerCase().includes(term) ||
          order.loja.nome.toLowerCase().includes(term)
      )
    }

    setFilteredOrders(filtered)
  }, [orders, statusFilter, searchTerm, empresaAtiva])

  // Renderizar acoes baseadas no status
  function renderActions(order: Order) {
    const status = order.status

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Acoes do pedido</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {/* Detalhes - sempre disponivel */}
          <DropdownMenuItem onClick={() => onViewDetails(order)}>
            <Eye className="h-4 w-4 mr-2" />
            Detalhes do Pedido
          </DropdownMenuItem>

          {/* PAGO ou FATURADO */}
          {(status === "PAGO" || status === "FATURADO") && (
            <>
              <DropdownMenuItem onClick={() => onResendPayment(order)}>
                <Send className="h-4 w-4 mr-2" />
                Reenviar Pagamento
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewReceipt(order)}>
                <FileText className="h-4 w-4 mr-2" />
                Visualizar Comprovante
              </DropdownMenuItem>
            </>
          )}

          {/* CANCELADO */}
          {status === "CANCELADO" && (
            <DropdownMenuItem onClick={() => onViewReceipt(order)}>
              <FileText className="h-4 w-4 mr-2" />
              Visualizar Comprovante
            </DropdownMenuItem>
          )}

          {/* PAGO - pode enviar NF */}
          {status === "PAGO" && (
            <DropdownMenuItem onClick={() => onSendInvoice(order)}>
              <Upload className="h-4 w-4 mr-2" />
              Enviar Nota Fiscal
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Carregando pedidos...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pedidos</h1>
          <p className="text-muted-foreground mt-1">
            {empresaAtiva === "TODAS"
              ? "Exibindo pedidos de todas as empresas"
              : `Filtrando pedidos da empresa ${empresaAtiva}`}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadOrders}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </header>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Busca */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por numero ou loja..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro de status */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === "TODOS" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("TODOS")}
              >
                Todos
              </Button>
              <Button
                variant={statusFilter === "PAGO" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("PAGO")}
              >
                Pagos
              </Button>
              <Button
                variant={statusFilter === "FATURADO" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("FATURADO")}
              >
                Faturados
              </Button>
              <Button
                variant={statusFilter === "EM_PROCESSO_PAGAMENTO" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("EM_PROCESSO_PAGAMENTO")}
              >
                Em Processo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pedidos - Desktop */}
      <div className="hidden md:block">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      Pedido
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      Loja
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      Valor
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-right p-4 font-medium text-muted-foreground">
                      Acoes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        Nenhum pedido encontrado
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Package className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">#{order.numeroPedido}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.dataEmissao).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Store className="h-4 w-4 text-muted-foreground" />
                            <span>{order.loja.nome}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold">
                            {order.valorTotal.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </span>
                        </td>
                        <td className="p-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="p-4 text-right">
                          {renderActions(order)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Pedidos - Mobile (Cards) */}
      <div className="md:hidden space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Nenhum pedido encontrado
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">#{order.numeroPedido}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.dataEmissao).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  {renderActions(order)}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Store className="h-4 w-4 text-muted-foreground" />
                    <span>{order.loja.nome}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg">
                      {order.valorTotal.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Contador */}
      <p className="text-sm text-muted-foreground text-center">
        Exibindo {filteredOrders.length} de {orders.length} pedidos
      </p>
    </div>
  )
}
