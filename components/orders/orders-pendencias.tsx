"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Store } from "lucide-react"

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

const MOCK_FILIAIS: Filial[] = [
  { id: "1", nome: "Loja Centro" },
  { id: "2", nome: "Loja Shopping" },
]

const MOCK_PENDENCIAS: Pendencia[] = [
  { pedido: "2024007", nota: "1122", valor: 100, data: "01/02/2026", situacao: "PENDENTE" },
  { pedido: "2024008", nota: "2233", valor: 200, data: "02/02/2026", situacao: "PENDENTE" },
]

export function OrdersPendencias() {
  const [filialSelecionada, setFilialSelecionada] = useState<string | null>(null)
  const [pendencias, setPendencias] = useState<Pendencia[]>([])
  const [processando, setProcessando] = useState(false)
  const [etapa, setEtapa] = useState(0)

  const carregar = () => setPendencias(MOCK_PENDENCIAS)

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms))

  const integrar = async () => {
    setProcessando(true)
    setEtapa(1)
    await delay(2000)
    setEtapa(2)
    await delay(3000)
    setEtapa(3)
    await delay(2000)
    setEtapa(4)
  }

  const finalizar = () => {
    setPendencias(prev =>
      prev.map(p => ({ ...p, situacao: "EM_PROCESSAMENTO" }))
    )
    setProcessando(false)
    setEtapa(0)
  }

  if (processando) {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-6">
          <h2 className="text-xl font-bold">
            Envio de Notas Fiscais para o BNDES
          </h2>

          {etapa === 1 && <p>Consultando notas fiscais...</p>}
          {etapa === 2 && <p>Preparando envio das notas...</p>}
          {etapa === 3 && <p>Agendamento feito com sucesso...</p>}
          {etapa === 4 && (
            <>
              <p className="font-semibold text-green-600">
                Processo finalizado com sucesso.
              </p>
              <Button onClick={finalizar}>OK</Button>
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <Store className="h-4 w-4" />
          <select
            className="border rounded px-3 py-2 text-sm"
            value={filialSelecionada ?? ""}
            onChange={(e) => {
              setFilialSelecionada(e.target.value)
              carregar()
            }}
          >
            <option value="">Selecione a filial</option>
            {MOCK_FILIAIS.map(f => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {filialSelecionada && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-4 text-left">Pedido</th>
                  <th className="p-4 text-left">Nota</th>
                  <th className="p-4 text-left">Valor</th>
                  <th className="p-4 text-left">Data</th>
                  <th className="p-4 text-left">Situação</th>
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
                      <Badge>
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
      )}

      {filialSelecionada && (
        <Button
          onClick={integrar}
          disabled={!pendencias.some(p => p.situacao === "PENDENTE")}
          className="fixed bottom-8 right-8"
        >
          INTEGRAR NOTAS PENDENTES
        </Button>
      )}
    </div>
  )
}
