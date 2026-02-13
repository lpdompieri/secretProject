"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Store, Package, Loader2, AlertCircle } from "lucide-react"

type Status = "PENDENTE" | "EM_PROCESSAMENTO" | "INTEGRADO" | "ERRO"

type Pendencia = {
  id: string
  pedido: string
  nota: string
  chaveNfe: string
  valor: number
  data: string
  situacao: Status
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
  {
    id: "1",
    pedido: "2024007",
    nota: "1122",
    chaveNfe: "92348342384324623470745",
    valor: 100,
    data: "01/02/2026",
    situacao: "PENDENTE",
  },
  {
    id: "2",
    pedido: "2024008",
    nota: "2233",
    chaveNfe: "83476587658765876587654",
    valor: 200,
    data: "02/02/2026",
    situacao: "EM_PROCESSAMENTO",
  },
]

export function OrdersPendencias() {
  const [filialSelecionada, setFilialSelecionada] = useState<string | null>(null)
  const [pendencias, setPendencias] = useState<Pendencia[]>([])
  const [selecionadas, setSelecionadas] = useState<string[]>([])
  const [filtroStatus, setFiltroStatus] = useState<Status | "TODOS">("TODOS")

  const carregar = () => setPendencias(MOCK_PENDENCIAS)

  // ==============================
  // MÉTRICAS
  // ==============================

  const totalPendentes = pendencias.filter(p => p.situacao === "PENDENTE").length
  const totalProcessando = pendencias.filter(p => p.situacao === "EM_PROCESSAMENTO").length
  const valorTotal = pendencias
    .filter(p => p.situacao === "PENDENTE")
    .reduce((acc, p) => acc + p.valor, 0)

  const pendenciasFiltradas = useMemo(() => {
    if (filtroStatus === "TODOS") return pendencias
    return pendencias.filter(p => p.situacao === filtroStatus)
  }, [pendencias, filtroStatus])

  const toggleSelecionada = (id: string) => {
    setSelecionadas(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const integrarSelecionadas = () => {
    setPendencias(prev =>
      prev.map(p =>
        selecionadas.includes(p.id)
          ? { ...p, situacao: "EM_PROCESSAMENTO" }
          : p
      )
    )
    setSelecionadas([])
  }

  const renderStatus = (status: Status) => {
    switch (status) {
      case "PENDENTE":
        return <Badge variant="secondary">Pendente</Badge>
      case "EM_PROCESSAMENTO":
        return (
          <Badge variant="default" className="gap-1 flex items-center">
            <Loader2 className="h-3 w-3 animate-spin" />
            Processando
          </Badge>
        )
      case "INTEGRADO":
        return <Badge className="bg-green-600">Integrado</Badge>
      case "ERRO":
        return (
          <Badge variant="destructive" className="gap-1 flex items-center">
            <AlertCircle className="h-3 w-3" />
            Erro
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">

      {/* HEADER E FILIAL */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Central de Integração Fiscal</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie o envio de notas fiscais ao BNDES
          </p>
        </div>

        <div className="flex items-center gap-3">
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
        </div>
      </div>

      {filialSelecionada && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{totalPendentes}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Processando</p>
                <p className="text-2xl font-bold">{totalProcessando}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Valor Pendente</p>
                <p className="text-2xl font-bold">
                  {valorTotal.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* FILTRO */}
          <div className="flex gap-3">
            {["TODOS", "PENDENTE", "EM_PROCESSAMENTO"].map(status => (
              <Button
                key={status}
                size="sm"
                variant={filtroStatus === status ? "default" : "outline"}
                onClick={() => setFiltroStatus(status as any)}
              >
                {status}
              </Button>
            ))}
          </div>

          {/* ACTION BAR */}
          {selecionadas.length > 0 && (
            <Card className="border-primary">
              <CardContent className="p-4 flex items-center justify-between">
                <span className="text-sm">
                  {selecionadas.length} nota(s) selecionada(s)
                </span>
                <Button onClick={integrarSelecionadas}>
                  Integrar selecionadas
                </Button>
              </CardContent>
            </Card>
          )}

          {/* TABELA */}
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-4"></th>
                    <th className="p-4 text-left">Pedido</th>
                    <th className="p-4 text-left">Nota</th>
                    <th className="p-4 text-left">Valor</th>
                    <th className="p-4 text-left">Chave NFE</th>
                    <th className="p-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pendenciasFiltradas.map(p => (
                    <tr key={p.id} className="border-b hover:bg-muted/30">
                      <td className="p-4">
                        <Checkbox
                          checked={selecionadas.includes(p.id)}
                          onCheckedChange={() => toggleSelecionada(p.id)}
                          disabled={p.situacao !== "PENDENTE"}
                        />
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">#{p.pedido}</p>
                          <p className="text-sm text-muted-foreground">
                            {p.data}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">{p.nota}</td>
                      <td className="p-4 font-semibold">
                        {p.valor.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </td>
                      <td className="p-4 font-mono text-sm break-all">
                        {p.chaveNfe}
                      </td>
                      <td className="p-4">{renderStatus(p.situacao)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
