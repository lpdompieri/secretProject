"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, RefreshCw, Search, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { listarPedidos } from "@/services/orders-service"
import { useEmpresa } from "@/contexts/empresa-context"
import type { Order } from "@/types/order"

// ============================================================
// MOCK CONFIG
// ============================================================

const MOCK_FILIAIS = [
  { id: "1", nome: "Filial Centro" },
  { id: "2", nome: "Filial Norte" },
]

const MOCK_PENDENCIAS = [
  { pedido: "2024007", nota: "1122", valor: 100, data: "01/02/2026", status: "PENDENTE" },
  { pedido: "2024008", nota: "2233", valor: 200, data: "02/02/2026", status: "PENDENTE" },
  { pedido: "2024008", nota: "3344", valor: 300, data: "05/02/2026", status: "PENDENTE" },
  { pedido: "2024009", nota: "4455", valor: 600, data: "06/02/2026", status: "PENDENTE" },
  { pedido: "2024009", nota: "5566", valor: 900, data: "05/02/2026", status: "PENDENTE" },
  { pedido: "2024009", nota: "5567", valor: 200, data: "07/02/2026", status: "PENDENTE" },
]

// ============================================================

type TabMode = "pedidos" | "pendencias"
type StepMode = "list" | "processing" | "success"

export function OrdersList({
  onViewReceipt,
  onViewDetails,
  onSendInvoice,
  onResendPayment,
}: any) {
  const { empresaAtiva } = useEmpresa()

  const [tab, setTab] = useState<TabMode>("pedidos")
  const [step, setStep] = useState<StepMode>("list")

  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [filialSelecionada, setFilialSelecionada] = useState<string | null>(null)
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
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders, empresaAtiva])

  // ==========================================================
  // PROCESSAMENTO INTEGRAÇÃO
  // ==========================================================

  async function processIntegracao() {
    setStep("processing")

    await new Promise(r => setTimeout(r, 2000))
    await new Promise(r => setTimeout(r, 2000))
    await new Promise(r => setTimeout(r, 2000))

    setPendencias(prev =>
      prev.map(p => ({ ...p, status: "EM_PROCESSAMENTO" }))
    )

    setStep("success")
  }

  // ==========================================================
  // RENDER PROCESSING
  // ==========================================================

  if (step === "processing") {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-6">
          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
          <h2 className="text-xl font-semibold">
            Envio de Notas Fiscais para o BNDES
          </h2>

          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Consultando notas fiscais</p>
            <p>Preparando envio das notas</p>
            <p>Agendamento de envio feito com sucesso.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ==========================================================
  // SUCCESS
  // ==========================================================

  if (step === "success") {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-6">
          <h2 className="text-2xl font-bold">
            Processo finalizado com sucesso.
          </h2>

          <p className="text-muted-foreground max-w-lg mx-auto">
            As notas fiscais pendentes estão programadas para serem enviadas.
            Em breve as pendências serão resolvidas.
            <br /><br />
            Você recebera uma notificação quando o processo terminar.
          </p>

          <Button onClick={() => setStep("list")}>
            OK
          </Button>
        </CardContent>
      </Card>
    )
  }

  // ==========================================================
  // RENDER NORMAL
  // ==========================================================

  return (
    <div className="space-y-6 relative">

      {/* TABS */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setTab("pedidos")}
          className={cn("pb-2", tab === "pedidos" && "border-b-2 border-primary font-semibold")}
        >
          Pedidos
        </button>
        <button
          onClick={() => setTab("pendencias")}
          className={cn("pb-2", tab === "pendencias" && "border-b-2 border-primary font-semibold")}
        >
          Pendências - NFE
        </button>
      </div>

      {/* ======================================================
         ABA PEDIDOS ORIGINAL
      ====================================================== */}

      {tab === "pedidos" && (
        <>
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                {orders.length} pedidos carregados
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* ======================================================
         ABA PENDÊNCIAS
      ====================================================== */}

      {tab === "pendencias" && (
        <>
          {/* FILIAL */}
          <Card>
            <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-medium">Filial:</span>

                {MOCK_FILIAIS.length > 1 ? (
                  <select
                    className="border rounded px-3 py-2"
                    value={filialSelecionada ?? ""}
                    onChange={(e) => setFilialSelecionada(e.target.value)}
                  >
                    <option value="">Selecione</option>
                    {MOCK_FILIAIS.map(f => (
                      <option key={f.id} value={f.id}>{f.nome}</option>
                    ))}
                  </select>
                ) : (
                  <span>{MOCK_FILIAIS[0].nome}</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* TABELA */}
          {filialSelecionada && (
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-3 text-left">Pedido</th>
                      <th className="p-3 text-left">Nota Fiscal</th>
                      <th className="p-3 text-left">Valor</th>
                      <th className="p-3 text-left">Data Emissão</th>
                      <th className="p-3 text-left">Situação de envio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendencias.map((p, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-3">{p.pedido}</td>
                        <td className="p-3">{p.nota}</td>
                        <td className="p-3">
                          {p.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </td>
                        <td className="p-3">{p.data}</td>
                        <td className="p-3">
                          {p.status === "PENDENTE"
                            ? "Pendente"
                            : "Em processamento"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {/* BOTÃO FLUTUANTE */}
          {filialSelecionada && (
            <Button
              onClick={processIntegracao}
              disabled={!pendencias.some(p => p.status === "PENDENTE")}
              className="fixed bottom-8 right-8 shadow-lg"
            >
              INTEGRAR NOTAS PENDENTES
            </Button>
          )}
        </>
      )}
    </div>
  )
}
