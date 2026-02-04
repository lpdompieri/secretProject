"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Plus, Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

// Constante para URL da API - ajuste conforme seu backend
const API_URL = "/api/products"

interface Product {
  codigo: string
  descricao: string
  ncm: string
  origemFiscal: string
  statusBndes: "habilitado" | "nao_habilitado"
}

// Dados mockados para simulacao
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

  // Funcao para consultar produto
  async function consultProduct(codigo: string) {
    if (!codigo.trim()) {
      setError("Por favor, informe o codigo do produto")
      return
    }

    setIsLoading(true)
    setError(null)
    setProduct(null)
    setNotFound(false)

    try {
      // TODO: Descomentar quando o backend estiver pronto
      /*
      const response = await fetch(`${API_URL}/${codigo}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Adicionar token JWT quando implementado
          // "Authorization": `Bearer ${token}`,
        },
      })

      if (response.status === 404) {
        setNotFound(true)
        return
      }

      if (!response.ok) {
        throw new Error("Erro ao consultar produto")
      }

      const data = await response.json()
      setProduct(data)
      */

      // Simulacao de delay da API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Verificar se o produto existe nos dados mockados
      const foundProduct = MOCK_PRODUCTS[codigo]
      
      if (foundProduct) {
        setProduct(foundProduct)
      } else {
        setNotFound(true)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao consultar produto"
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
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" aria-hidden="true" />
                    )}
                    Consultar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onNavigateToCadastro}
                    className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground bg-transparent"
                  >
                    <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                    Cadastrar Produto
                  </Button>
                </div>
              </div>
            </div>

            {/* Mensagem de erro */}
            {error && (
              <div
                id="search-error"
                role="alert"
                className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg"
              >
                <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Resultado da consulta */}
      {(product || notFound) && (
        <Card className="animate-in fade-in-50 duration-300">
          <CardHeader>
            <CardTitle className="text-xl">Resultado da Consulta</CardTitle>
          </CardHeader>
          <CardContent>
            {notFound ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <AlertTriangle className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                </div>
                <p className="text-lg font-medium text-foreground">
                  Produto nao encontrado na base de dados
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Verifique o codigo informado ou cadastre um novo produto
                </p>
              </div>
            ) : product && (
              <div className="space-y-6">
                {/* Dados do produto */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Codigo do Produto</p>
                    <p className="font-medium text-foreground">{product.codigo}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">NCM</p>
                    <p className="font-medium text-foreground">{product.ncm}</p>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <p className="text-sm text-muted-foreground">Descricao</p>
                    <p className="font-medium text-foreground">{product.descricao}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Origem Fiscal</p>
                    <p className="font-medium text-foreground">{product.origemFiscal}</p>
                  </div>
                </div>

                {/* Status BNDES */}
                <div
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-lg border",
                    product.statusBndes === "habilitado"
                      ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900"
                      : "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900"
                  )}
                >
                  {product.statusBndes === "habilitado" ? (
                    <>
                      <CheckCircle2 
                        className="h-6 w-6 text-green-600 dark:text-green-400 shrink-0" 
                        aria-hidden="true" 
                      />
                      <div>
                        <p className="font-semibold text-green-700 dark:text-green-300">
                          HABILITADO para venda com Cartao BNDES
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400 mt-0.5">
                          Este produto esta apto para transacoes com o Cartao BNDES
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle 
                        className="h-6 w-6 text-red-600 dark:text-red-400 shrink-0" 
                        aria-hidden="true" 
                      />
                      <div>
                        <p className="font-semibold text-red-700 dark:text-red-300">
                          NAO ESTA HABILITADO para venda com Cartao BNDES
                        </p>
                        <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">
                          Este produto nao pode ser comercializado com o Cartao BNDES
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
