"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Store } from "lucide-react"

/* =====================================================
   TIPAGENS
===================================================== */

type Pendencia = {
  pedido: string
  nota: string
  valor: number
  data: string
  situacao: "PENDENTE" | "EM_PROCESSAMENTO"
}

type Filial = {
  id: string
  nome: string
}

/* =====================================================
   MOCKS
===================================================== */

const MOCK_FILIAIS: Filial[] = [
  { id: "1", nome: "Loja Centro" },
  { id: "2", nome: "Loja Shopping" },
]

const MOCK_PENDENCIAS: Pendencia[] = [
  { pedido: "2024007", nota: "1122", valor: 100, data: "01/02/2026", situacao: "PENDENTE" },
  { pedido: "2024008", nota: "2233", valor: 200, data: "02/02/2026", situacao: "PENDENTE" },
  { pedido: "2024008", nota: "3344", valor: 300, data: "05/02/2026", situacao: "PENDENTE" },
  { pedido: "2024009", nota: "4455", valor: 600, data: "06/02/2026", situacao: "PENDENTE" },
  { pedido: "2024009", nota: "5566", valor: 900, data: "05/02/2026", situacao: "PENDENTE" },
  { pedido: "2024009", nota: "5567", valor: 200, data: "07/02/2026", situacao: "PENDENTE" },
]

/* =====================================================
   COMPONENTE
===================================================== */

export default function OrdersList() {
  const [tab, setTab] = useState<"pedidos" | "pendencias">("pedidos")

  /* ===============================
     ESTADOS PENDENCIAS
  =============================== */

  const [filialSelecionada, setFilialSelecionada] = useState<string | null>(null)
  const [pendencias, setPendencias] = useState<Pendencia[]>([])
  const [processando, setProcessando] = useState(false)
  const [etapa, setEtapa] = useState(0)

  const usuarioTemMultiplasFiliais = MOCK_FILIAIS.length > 1

  /* ===============================
     HANDLERS
  =============================== */

  const carregarPendencias = () => {
    setPendencias(MOCK_PENDENCIAS)
  }

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms))

  const iniciarIntegracao = async () => {
    setProcessando(true)
    setEtapa(1)

    await delay(2000)
    setEtapa(2)

    await delay(3000)
    setEtapa(3)

    await delay(2000)
    setEtapa(4)
  }

  const finalizarProcesso = () => {
    setPendencias(prev =>
      prev.map(p => ({
        ...p,
        situacao: "EM_PROCESSAMENTO",
      }))
    )

    setProcessando(false)
    setEtapa(0)
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="space-y-6">

      {/* ===============================
         HEADER TABS
      =============================== */}

      <div className="flex gap-4 border-b pb-2">
        <button
          onClick={() => setTab("pedidos")}
          className={tab === "pedidos" ? "font-bold border-b-2 border-primary pb-1" : ""}
        >
          Pedidos
        </button>

        <button
          onClick={() => setTab("pendencias")}
          className={tab === "pendencias" ? "font-bold border-b-2 border-primary pb-1" : ""}
        >
          Pendências - NFE
        </button>
      </div>

      {/* =====================================================
         ABA PEDIDOS (NÃO ALTERAR)
      ===================================================== */}
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

      {/* =====================================================
         ABA PENDÊNCIAS
      ===================================================== */}

      {tab === "pendencias" && (
        <>
          {/* PROCESSAMENTO */}
          {processando ? (
            <Card>
              <CardContent className="p-8 text-center space-y-6">

                <h2 className="text-xl font-bold">
                  Envio de Notas Fiscais para o BNDES
                </h2>

                {etapa === 1 && <p>Consultando notas fiscais...</p>}
                {etapa === 2 && <p>Preparando envio das notas...</p>}
                {etapa === 3 && <p>Agendamento de envio feito com sucesso...</p>}
                {etapa === 4 && (
                  <>
                    <p className="font-semibold text-green-600">
                      Processo finalizado com sucesso.
                    </p>

                    <p>
                      As notas fiscais pendentes estão programadas para serem enviadas.
                      Em breve as pendências serão resolvidas.
                    </p>

                    <p>
                      Você receberá uma notificação quando o processo terminar.
                    </p>

                    <Button onClick={finalizarProcesso}>
                      OK
                    </Button>
                  </>
                )}

              </CardContent>
            </Card>
          ) : (
            <>
              {/* SELETOR FILIAL */}
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <Store className="h-4 w-4" />
                  <span className="font-medium">Filial:</span>

                  {usuarioTemMultiplasFiliais ? (
                    <select
                      className="border rounded px-3 py-2 text-sm"
                      value={filialSelecionada ?? ""}
                      onChange={(e) => {
                        setFilialSelecionada(e.target.value)
                        carregarPendencias()
                      }}
                    >
                      <option value="">Selecione</option>
                      {MOCK_FILIAIS.map(f => (
                        <option key={f.id} value={f.id}>
                          {f.nome}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span>{MOCK_FILIAIS[0].nome}</span>
                  )}
                </CardContent>
              </Card>

              {filialSelecionada && (
                <>
                  {/* TABELA */}
                  <Card>
                    <CardContent className="p-0">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="p-4 text-left">Pedido</th>
                            <th className="p-4 text-left">Nota Fiscal</th>
                            <th className="p-4 text-left">Valor</th>
                            <th className="p-4 text-left">Data Emissão</th>
                            <th className="p-4 text-left">Situação de envio</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendencias.map((p, i) => (
                            <tr key={i} className="border-b">
                              <td className="p-4">{p.pedido}</td>
                              <td className="p-4">{p.nota}</td>
                              <td className="p-4">
                                {p.valor.toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </td>
                              <td className="p-4">{p.data}</td>
                              <td className="p-4">
                                <Badge
                                  variant={p.situacao === "PENDENTE" ? "secondary" : "default"}
                                >
                                  {p.situacao === "PENDENTE"
                                    ? "Pendente"
                                    : "Em processamento"}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>

                  {/* BOTÃO FLUTUANTE */}
                  <Button
                    onClick={iniciarIntegracao}
                    disabled={!pendencias.some(p => p.situacao === "PENDENTE")}
                    className="fixed bottom-8 right-8 shadow-lg"
                  >
                    INTEGRAR NOTAS PENDENTES
                  </Button>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
