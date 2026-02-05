"use client"

import React, { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Search,
  Plus,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"

import { checkBndesEligibility } from "@/services/product-services"

interface Product {
  codigo: string
  descricao: string
  ncm: string
  origemFiscal: string
}

// Dados mockados apenas para DADOS CADASTRAIS
const MOCK_PRODUCTS: Record<string, Product> = {
  "112233": {
    codigo: "112233",
    descricao: "Computador Desktop Empresarial i7 16GB",
    ncm: "8471.30.19",
    origemFiscal: "Nacional",
  },
  "223344": {
    codigo: "223344",
    descricao: "Monitor LED 27 polegadas Full HD",
    ncm: "8528.52.20",
    origemFiscal: "Importado",
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

  const [bndesEligible, setBndesEligible] = useState<boolean | null>(null)
  const [ruleVersion, setRuleVersion] = useState<string | null>(null)

  async function consultProduct(codigo: string) {
    if (!codigo.trim()) {
      setError("Por favor, informe o codigo do produto")
      return
    }

    setIsLoading(true)
    setError(null)
    setProduct(null)
    setNotFound(false)
    setBndesEligible(null)
    setRuleVersion(null)

    try {
      /**
       * 1️⃣ Consulta dados do produto (mock cadastral)
       */
      await new Promise((resolve) => setTimeout(resolve, 600))

      const foundProduct = MOCK_PRODUCTS[codigo]

      if (!foundProduct) {
        setNotFound(true)
        return
      }

      setProduct(foundProduct)

      /**
       * 2️⃣ Consulta elegibilidade BNDES (API REAL / MOCKADA NO SERVICE)
       */
      const eligibility = await checkBndesEligibility(codigo)

      if (!eligibility.success) {
        throw new Error(
          eligibility.error || "Erro ao validar elegibilidade BNDES"
        )
      }

      setBndesEligible(eligibility.eligible ?? false)
      setRuleVersion(eligibility.ruleVersion ?? null)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao consultar produto"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    consultProduct(searchCode)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      consultProduct(searchCode)
    }
  }

  return (
    <div className="space-y-6">
      {/* Formulario de busca */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Consultar Produto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productCode">Codigo do Produto</Label>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  id="productCode"
                  type="text"
                  placeholder="Digite o codigo do produto"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                  aria-describedby={error ? "search-error" : undefined}
                />
                <div className="flex gap-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    Consultar
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={onNavigateToCadastro}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar Produto
                  </Button>
                </div>
              </div>
            </div>

            {error && (
              <div
                id="search-error"
                className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Resultado */}
      {(product || notFound) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Resultado da Consulta</CardTitle>
          </CardHeader>
          <CardContent>
            {notFound ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <p className="font-medium">Produto nao encontrado</p>
              </div>
            ) : (
              product && (
                <div className="space-y-6">
                  {/* Dados */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Codigo do Produto
                      </p>
                      <p className="font-medium">{product.codigo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">NCM</p>
                      <p className="font-medium">{product.ncm}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-sm text-muted-foreground">Descricao</p>
                      <p className="font-medium">{product.descricao}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Origem Fiscal
                      </p>
                      <p className="font-medium">{product.origemFiscal}</p>
                    </div>
                  </div>

                  {/* Status BNDES */}
                  {bndesEligible !== null && (
                    <div
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg border",
                        bndesEligible
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      )}
                    >
                      {bndesEligible ? (
                        <>
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                          <div>
                            <p className="font-semibold text-green-700">
                              HABILITADO para venda com Cartao BNDES
                            </p>
                            {ruleVersion && (
                              <p className="text-sm text-green-600">
                                Regra aplicada: {ruleVersion}
                              </p>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-6 w-6 text-red-600" />
                          <div>
                            <p className="font-semibold text-red-700">
                              NAO HABILITADO para venda com Cartao BNDES
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
