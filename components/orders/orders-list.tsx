"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { OrdersList as OrdersListOriginal } from "./orders-list-original"

// 👆 IMPORTANTE:
// Renomeie seu arquivo original para:
// components/orders/orders-list-original.tsx
// (sem alterar NADA dentro dele)

type TabMode = "pedidos" | "pendencias"
type StepMode = "list" | "processing" | "success"

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

export function OrdersList(props: any) {
  const [tab, setTab] = useState<TabMode>("pedidos")
  const [step, setStep] = useState<StepMode>("list")
  const [filialSelecionada, setFilialSelecionada] = useState<string>("")
  const [pendencias, setPendencias] = useState(MOCK_PENDENCIAS)

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

  if (step === "processing") {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <h2 className="text-xl font-semibold">
            Envio de Notas Fiscais para o BNDES
          </h2>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Consultando notas fiscais</p>
            <p>Preparando envio das notas</p>
            <p>Agendamento de envio feito com sucesso.</p>
          </div>
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
          <p className="text-muted-foreground max-w-md mx-auto">
            As notas fiscais pendentes estão programadas para serem enviadas.
            Em breve as pendências serão resolvidas.
            Você recebera uma notificação quando o processo terminar.
          </p>
          <Button onClick={() => setStep("list")}>OK</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 relative">

      {/* TABS */}
      <div className="flex gap-6 border-b">
        <button
          onClick={() => setTab("pedidos")}
          className={cn(
            "pb-2 text-sm",
            tab === "pedidos" && "border-b-2 border-primary font-semibold"
          )}
        >
          Pedidos
        </button>

        <button
          onClick={() => setTab("pendencias")}
          className={cn(
            "pb-2 text-sm",
            tab === "pendencias" && "border-b-2 border-primary font-semibold"
          )}
        >
          Pendências - NFE
        </button>
      </div>

      {/* ======================================================
         ABA PEDIDOS - 100% ORIGINAL
      ====================================================== */}

      {tab === "pedidos" && <OrdersListOriginal {...props} />}

      {/* ======================================================
         ABA PENDÊNCIAS
      ====================================================== */}

      {tab === "pendencias" && (
        <>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <span className="font-medium text-sm">Filial:</span>

              <select
                className="border rounded px-3 py-2 text-sm"
                value={filialSelecionada}
                onChange={(e) => setFilialSelecionada(e.target.value)}
              >
                <option value="">Selecione</option>
                {MOCK_FILIAIS.map(f => (
                  <option key={f.id} value={f.id}>{f.nome}</option>
                ))}
              </select>
            </CardContent>
          </Card>

          {filialSelecionada && (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-4">Pedido</th>
                        <th className="text-left p-4">Nota Fiscal</th>
                        <th className="text-left p-4">Valor</th>
                        <th className="text-left p-4">Data Emissão</th>
                        <th className="text-left p-4">Situação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendencias.map((p, i) => (
                        <tr key={i} className="border-b hover:bg-muted/30">
                          <td className="p-4 font-medium">{p.pedido}</td>
                          <td className="p-4">{p.nota}</td>
                          <td className="p-4">
                            {p.valor.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </td>
                          <td className="p-4">{p.data}</td>
                          <td className="p-4">
                            {p.status === "PENDENTE"
                              ? "Pendente"
                              : "Em processamento"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

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
