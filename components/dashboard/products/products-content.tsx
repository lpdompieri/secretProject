"use client"

import React, { useState } from "react"
import {
  Search,
  Plus,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  RefreshCw,
  PackageSearch,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Product {
  codigo: string
  descricao: string
  ncm: string
  origemFiscal: string
  statusBndes: "habilitado" | "nao_habilitado"
}

const MOCK_PRODUCTS: Record<string, Product> = {
  "112233": {
    codigo: "112233",
    descricao: "Computador Desktop Empresarial i7 16GB",
    ncm: "8471.30.19",
    origemFiscal: "Nacional",
    statusBndes: "habilitado",
  },
  "223344": {
    codigo: "223344",
    descricao: "Monitor LED 27 polegadas Full HD",
    ncm: "8528.52.20",
    origemFiscal: "Importado",
    statusBndes: "nao_habilitado",
  },
}

interface ProductSearchProps {
  onNavigateToCadastro: () => void
}

export function ProductSearch({ onNavigateToCadastro }: ProductSearchProps) {
  const [searchCode, setSearchCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null)

  async function consultProduct(codigo: string) {
    if (!codigo.trim()) {
      setError("Informe o código do produto")
      return
    }

    setIsLoading(true)
    setError(null)
    setProduct(null)
    setNotFound(false)

    await new Promise((resolve) => setTimeout(resolve, 900))

    const found = MOCK_PRODUCTS[codigo]

    if (found) {
      setProduct(found)
    } else {
      setNotFound(true)
    }

    setIsLoading(false)
  }

  async function handleDownloadBase() {
    setDownloadMessage(null)
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 1200))

    setIsLoading(false)
    setDownloadMessage(
      "Sua base será processada e enviada para o email do cadastrado"
    )
  }

  const produtoCritico =
    product && product.statusBndes === "nao_habilitado"

  return (
    <div className="space-y-8">

      {/* HEADER + ACTION BAR */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Base de Produtos</h1>
          <p className="text-muted-foreground">
            Consulta e governança de habilitação BNDES
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => consultProduct(searchCode)}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownloadBase}
            disabled={isLoading}
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar Base Completa
          </Button>

          <Button
            size="sm"
            onClick={onNavigateToCadastro}
          >
            <Plus className="h-4 w-4 mr-2" />
            Cadastrar Produto
          </Button>
        </div>
      </div>

      {/* Mensagem Download */}
      {downloadMessage && (
        <div className="p-4 rounded-lg border bg-secondary/10 text-secondary text-sm">
          {downloadMessage}
        </div>
      )}

      {/* CARD BUSCA */}
      <Card>
        <CardHeader>
          <CardTitle>Consultar Produto</CardTitle>
          <CardDescription>
            Informe o código para validação fiscal
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 space-y-2">
              <Label>Código do Produto</Label>
              <Input
                placeholder="Digite o código"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
              />
            </div>

            <Button
              onClick={() => consultProduct(searchCode)}
              disabled={isLoading}
              className="self-end"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Consultar
            </Button>
          </div>

          {error && (
            <div className="text-sm text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* RESULTADO */}
      {(product || notFound) && (
        <Card className="animate-in fade-in-50 duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Resultado da Consulta</CardTitle>
              <CardDescription>
                Informações fiscais e status BNDES
              </CardDescription>
            </div>

            {produtoCritico && (
              <Badge variant="destructive">
                Produto não habilitado
              </Badge>
            )}
          </CardHeader>

          <CardContent>
            {notFound ? (
              <div className="py-10 text-center text-muted-foreground">
                <PackageSearch className="h-10 w-10 mx-auto mb-3 opacity-50" />
                Produto não encontrado na base.
              </div>
            ) : product && (
              <div className="space-y-6">

                {/* KPI GRID */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <KpiItem label="Código" value={product.codigo} />
                  <KpiItem label="NCM" value={product.ncm} />
                  <KpiItem label="Origem" value={product.origemFiscal} />
                  <KpiItem
                    label="Status BNDES"
                    value={
                      product.statusBndes === "habilitado"
                        ? "Habilitado"
                        : "Não Habilitado"
                    }
                  />
                </div>

                {/* STATUS AVANÇADO */}
                <div
                  className={cn(
                    "p-5 rounded-lg border flex items-start gap-3",
                    product.statusBndes === "habilitado"
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  )}
                >
                  {product.statusBndes === "habilitado" ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600 shrink-0" />
                  )}

                  <div>
                    <p className="font-semibold">
                      {product.statusBndes === "habilitado"
                        ? "Produto habilitado para Cartão BNDES"
                        : "Produto NÃO habilitado para Cartão BNDES"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Validação conforme regra fiscal e política de crédito.
                    </p>
                  </div>
                </div>

              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/* KPI COMPONENTE */
function KpiItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-lg border bg-muted/30">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  )
}
