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

import { checkBndesEligibility } from "@/services/product-service"

interface ProductSearchProps {
  onNavigateToCadastro: () => void
}

export function ProductSearch({ onNavigateToCadastro }: ProductSearchProps) {
  const [searchCode, setSearchCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [bndesEligible, setBndesEligible] = useState<boolean | null>(null)
  const [ruleVersion, setRuleVersion] = useState<string | null>(null)

  async function consultProduct(codigo: string) {
    if (!codigo.trim()) {
      setError("Por favor, informe o código do produto")
      return
    }

    setIsLoading(true)
    setError(null)
    setBndesEligible(null)
    setRuleVersion(null)

    try {
      const eligibility = await checkBndesEligibility(codigo)

      if (!eligibility.success) {
        throw new Error(
          eligibility.error || "Erro ao consultar elegibilidade BNDES"
        )
      }

      setBndesEligible(eligibility.eligible ?? false)
      setRuleVersion(eligibility.ruleVersion ?? null)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao consultar produto"
      )
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
      {/* Formulário de busca */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Consultar Produto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productCode">Código do Produto</Label>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  id="productCode"
                  type="text"
                  placeholder="Digite o código do produto"
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
      {bndesEligible !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Resultado da Consulta</CardTitle>
          </CardHeader>
          <CardContent>
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
                      HABILITADO para venda com Cartão BNDES
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
                      NÃO HABILITADO para venda com Cartão BNDES
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
