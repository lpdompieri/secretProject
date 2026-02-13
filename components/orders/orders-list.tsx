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

      {tab === "pedidos" && (
        <>
          {/* ====== ABA PEDIDOS (SEU CÓDIGO ATUAL AQUI) ====== */}
        </>
      )}

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
