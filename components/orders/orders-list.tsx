"use client"

/**
 * =============================================================================
 * COMPONENTE - LISTAGEM DE PEDIDOS + PENDÊNCIAS NFE
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

// ============================================================
// MOCK PENDÊNCIAS
// ============================================================

const MOCK_FILIAIS = [
  { id: "1", nome: "Filial Centro" },
  { id: "2", nome: "Filial Norte" },
]

const MOCK_PENDENCIAS = [
  { pedido: "2024007", nota: "1122", valor: 100, data: "01/02/2026", status: "PENDENTE" },
  { pedido: "2024008", nota: "2233", valor: 200, data: "02/02/2026", status: "PENDENTE" },
  { pedido: "2024009", nota: "3344", valor: 300, data: "05/02/2026", status: "PENDENTE" },
]

// ============================================================

type TabMode = "pedidos" | "pendencias"
type StepMode = "list" | "processing" | "success"

interface OrdersListProps {
  onViewReceipt: (order: Order) => void
  onViewDetails: (order: Order) => void
  onSendInvoice: (order: Order) => void
  onResendPayment: (order: Order) => void
}

// ============================================================
// BADGE STATUS
// ============================================================

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

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function OrdersList({
  onViewReceipt,
  onViewDetails,
  onSendInvoice,
  onResendPayment,
}: OrdersListProps) {

  const { empresaAtiva } = useEmpresa()

  const [tab, setTab] = useState<TabMode>("pedidos")
  const [step, setStep] = useState<StepMode>("list")

  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "TODOS">("TODOS")

  const [filialSelecionada, setFilialSelecionada] = useState("")
  const [pendencias, setPendencias] = useState(MOCK_PENDENCIAS)

  // ==========================================================
  // LOAD PEDIDOS
  // ==========================================================

  const loadOrders = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await listarPedidos()
      if (response.success) {
        setOrders(response.data)
        setFilteredOrders(response.data)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders, empresaAtiva])

  // ==========================================================
  // FILTROS
  // ==========================================================

  useEffect(() => {
    let filtered = orders

    if (empresaAtiva && empresaAtiva !== "TODAS") {
      filtered = filtered.filter(order => order.loja.empresaCodigo === empresaAtiva)
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

  // ==========================================================
  // PROCESSAMENTO PENDÊNCIAS
  // ==========================================================

  async function processIntegracao() {
    setStep("processing")
    await new Promise(r => setTimeout(r, 3000))
    setPendencias(prev =>
      prev.map(p => ({ ...p, status: "EM_PROCESSAMENTO" }))
    )
    setStep("success")
  }

  if (step === "processing") {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <h2 className="text-xl font-semibold">
            Enviando notas fiscais para o BNDES
          </h2>
        </CardContent>
      </Card>
    )
  }

  if (step === "success") {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <h2 className="text-xl font-bold">
            Processo finalizado com sucesso.
          </h2>
          <Button onClick={() => setStep("list")}>
            OK
          </Button>
        </CardContent>
      </Card>
    )
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-6">

      {/* TABS */}
      <div className="flex gap-6 border-b">
        <button
          onClick={() => setTab("pedidos")}
          className={cn("pb-2 text-sm", tab === "pedidos" && "border-b-2 border-primary font-semibold")}
        >
          Pedidos
        </button>

        <button
          onClick={() => setTab("pendencias")}
          className={cn("pb-2 text-sm", tab === "pendencias" && "border-b-2 border-primary font-semibold")}
        >
          Pendências - NFE
        </button>
      </div>

      {/* ======================================================
         ABA PEDIDOS (SEU LAYOUT ORIGINAL INTACTO)
      ====================================================== */}

      {tab === "pedidos" && (
        <>
          {/* TODO O SEU LAYOUT ORIGINAL CONTINUA AQUI */}
        </>
      )}

      {/* ======================================================
         ABA PENDÊNCIAS
      ====================================================== */}

     {tab === "pendencias" && (
  <>
    {/* HEADER PADRONIZADO */}
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Pendências - NFE
        </h1>
        <p className="text-muted-foreground mt-1">
          Notas fiscais pendentes de integração com o BNDES
        </p>
      </div>
    </header>

    {/* FILTRO FILIAL */}
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <Store className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-sm">Filial:</span>

        <select
          className="border rounded px-3 py-2 text-sm"
          value={filialSelecionada}
          onChange={(e) => setFilialSelecionada(e.target.value)}
        >
          <option value="">Selecione</option>
          {MOCK_FILIAIS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nome}
            </option>
          ))}
        </select>
      </CardContent>
    </Card>

    {filialSelecionada && (
      <>
        {/* ============================
            DESKTOP TABLE
        ============================ */}
        <div className="hidden md:block">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-4 text-left">Pedido</th>
                      <th className="p-4 text-left">Nota Fiscal</th>
                      <th className="p-4 text-left">Valor</th>
                      <th className="p-4 text-left">Data Emissão</th>
                      <th className="p-4 text-left">Status</th>
                      <th className="p-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendencias.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-8 text-center text-muted-foreground"
                        >
                          Nenhuma pendência encontrada
                        </td>
                      </tr>
                    ) : (
                      pendencias.map((p, i) => (
                        <tr
                          key={i}
                          className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-4 font-medium">
                            #{p.pedido}
                          </td>

                          <td className="p-4">
                            {p.nota}
                          </td>

                          <td className="p-4">
                            <span className="font-semibold">
                              {p.valor.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </span>
                          </td>

                          <td className="p-4">
                            {p.data}
                          </td>

                          <td className="p-4">
                            <StatusBadge
                              status={
                                p.status === "PENDENTE"
                                  ? "EM_PROCESSO_PAGAMENTO"
                                  : "FATURADO"
                              }
                            />
                          </td>

                          <td className="p-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Visualizar Pedido
                                </DropdownMenuItem>

                                {p.status === "PENDENTE" && (
                                  <DropdownMenuItem>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Integrar individualmente
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
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

        {/* ============================
            MOBILE CARDS
        ============================ */}
        <div className="md:hidden space-y-4">
          {pendencias.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Nenhuma pendência encontrada
              </CardContent>
            </Card>
          ) : (
            pendencias.map((p, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium">
                        Pedido #{p.pedido}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Nota {p.nota}
                      </p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar Pedido
                        </DropdownMenuItem>

                        {p.status === "PENDENTE" && (
                          <DropdownMenuItem>
                            <Upload className="h-4 w-4 mr-2" />
                            Integrar individualmente
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-lg">
                        {p.valor.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>

                      <StatusBadge
                        status={
                          p.status === "PENDENTE"
                            ? "EM_PROCESSO_PAGAMENTO"
                            : "FATURADO"
                        }
                      />
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Emissão: {p.data}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* BOTÃO FLUTUANTE */}
        <Button
          onClick={processIntegracao}
          disabled={!pendencias.some((p) => p.status === "PENDENTE")}
          className="fixed bottom-8 right-8 shadow-lg"
        >
          INTEGRAR NOTAS PENDENTES
        </Button>
      </>
    )}
  </>
)}


    </div>
  )
}
