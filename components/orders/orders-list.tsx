"use client"

/**
 * =============================================================================
 * LISTAGEM DE PEDIDOS - ENTERPRISE INTERMEDIÁRIO
 * =============================================================================
 */

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
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

interface OrdersListProps {
  onViewReceipt: (order: Order) => void
  onViewDetails: (order: Order) => void
  onSendInvoice: (order: Order) => void
  onResendPayment: (order: Order) => void
}

// =============================================================================
// STATUS BADGE
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
  const [selected, setSelected] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "TODOS">("TODOS")

  // ==============================
  // LOAD
  // ==============================

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

  // ==============================
  // FILTROS
  // ==============================

  useEffect(() => {
    let filtered = orders

    if (empresaAtiva && empresaAtiva !== "TODAS") {
      filtered = filtered.filter(
        order => order.loja.empresaCodigo === empresaAtiva
      )
    }

    if (statusFilter !== "TODOS") {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

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

  // ==============================
  // KPIs
  // ==============================

  const totalPedidos = filteredOrders.length

  const totalValor = useMemo(() => {
    return filteredOrders.reduce((acc, o) => acc + o.valorTotal, 0)
  }, [filteredOrders])

  const totalPagos = filteredOrders.filter(o => o.status === "PAGO").length

  // ==============================
  // SELEÇÃO
  // ==============================

  const toggleSelect = (id: string) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const clearSelection = () => setSelected([])

  // ==============================
  // ACTIONS
  // ==============================

  function renderActions(order: Order) {
    const status = order.status

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => onViewDetails(order)}>
            <Eye className="h-4 w-4 mr-2" />
            Detalhes
          </DropdownMenuItem>

          {(status === "PAGO" || status === "FATURADO") && (
            <>
              <DropdownMenuItem onClick={() => onResendPayment(order)}>
                <Send className="h-4 w-4 mr-2" />
                Reenviar Pagamento
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewReceipt(order)}>
                <FileText className="h-4 w-4 mr-2" />
                Comprovante
              </DropdownMenuItem>
            </>
          )}

          {status === "PAGO" && (
            <DropdownMenuItem onClick={() => onSendInvoice(order)}>
              <Upload className="h-4 w-4 mr-2" />
              Enviar NF
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // ==============================
  // LOADING
  // ==============================

  if (isLoading) {
    return (
      <div className="flex flex-col items-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Carregando pedidos...</p>
      </div>
    )
  }

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Central de Pedidos</h2>
          <p className="text-sm text-muted-foreground">
            Gestão operacional e financeira de pedidos
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadOrders}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pedidos</p>
            <p className="text-2xl font-bold">{totalPedidos}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Valor Total</p>
            <p className="text-2xl font-bold">
              {totalValor.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pagos</p>
            <p className="text-2xl font-bold">{totalPagos}</p>
          </CardContent>
        </Card>
      </div>

      {/* FILTROS */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número ou loja..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {["TODOS", "PAGO", "FATURADO", "EM_PROCESSO_PAGAMENTO"].map(status => (
              <Button
                key={status}
                size="sm"
                variant={statusFilter === status ? "default" : "outline"}
                onClick={() => setStatusFilter(status as any)}
              >
                {status}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ACTION BAR */}
      {selected.length > 0 && (
        <Card className="border-primary">
          <CardContent className="p-4 flex justify-between items-center">
            <span className="text-sm">
              {selected.length} pedido(s) selecionado(s)
            </span>
            <Button variant="outline" size="sm" onClick={clearSelection}>
              Limpar seleção
            </Button>
          </CardContent>
        </Card>
      )}

      {/* TABELA DESKTOP */}
      <div className="hidden md:block">
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-4"></th>
                  <th className="p-4 text-left">Pedido</th>
                  <th className="p-4 text-left">Loja</th>
                  <th className="p-4 text-left">Valor</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id} className="border-b hover:bg-muted/30">
                    <td className="p-4">
                      <Checkbox
                        checked={selected.includes(order.id)}
                        onCheckedChange={() => toggleSelect(order.id)}
                      />
                    </td>

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
                        {order.loja.nome}
                      </div>
                    </td>

                    <td className="p-4 font-semibold">
                      {order.valorTotal.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>

                    <td className="p-4">
                      <StatusBadge status={order.status} />
                    </td>

                    <td className="p-4 text-right">
                      {renderActions(order)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* CONTADOR */}
      <p className="text-sm text-muted-foreground text-center">
        Exibindo {filteredOrders.length} pedidos
      </p>
    </div>
  )
}
