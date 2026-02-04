"use client"

import React from "react"

/**
 * =============================================================================
 * COMPONENTE: CONSULTA DE PEDIDO PARA PAGAMENTO
 * =============================================================================
 * 
 * Responsabilidade: Interface para buscar pedidos por numero e validar
 * elegibilidade para pagamento com Cartao BNDES.
 * 
 * Fluxo:
 * 1. Usuario digita numero do pedido
 * 2. Clica em "Consultar Pedido"
 * 3. Sistema valida e retorna resultado ou erro
 * 4. Se valido, chama callback onOrderFound para prosseguir ao checkout
 * =============================================================================
 */

import { useState } from "react"
import { Search, AlertTriangle, XCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { consultarPedidoParaPagamento } from "@/services/payment-service"
import type { Order, OrderPaymentStatus } from "@/types/payment"
import { cn } from "@/lib/utils"

interface OrderSearchProps {
  onOrderFound: (order: Order) => void
}

/**
 * Retorna o estilo do alerta baseado no tipo de erro
 */
function getAlertStyle(type: OrderPaymentStatus): {
  variant: "default" | "destructive"
  icon: typeof AlertTriangle
  className: string
} {
  switch (type) {
    case "invalid_products":
      return {
        variant: "default",
        icon: AlertTriangle,
        className: "border-amber-500 bg-amber-50 text-amber-900",
      }
    case "invalid_customer":
      return {
        variant: "destructive",
        icon: XCircle,
        className: "",
      }
    default:
      return {
        variant: "default",
        icon: Info,
        className: "border-muted",
      }
  }
}

export function OrderSearch({ onOrderFound }: OrderSearchProps) {
  const [numeroPedido, setNumeroPedido] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<{
    type: OrderPaymentStatus
    message: string
  } | null>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    
    if (!numeroPedido.trim()) {
      setError({
        type: "not_found",
        message: "Digite o numero do pedido para consultar.",
      })
      return
    }

    setIsLoading(true)
    setError(null)

    const result = await consultarPedidoParaPagamento(numeroPedido.trim())

    setIsLoading(false)

    if (result.success && result.order) {
      // Pedido valido - prosseguir para checkout
      onOrderFound(result.order)
    } else if (result.error) {
      // Exibir erro
      setError(result.error)
    }
  }

  const alertStyle = error ? getAlertStyle(error.type) : null
  const AlertIcon = alertStyle?.icon || Info

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Pagamento</h1>
        <p className="text-muted-foreground mt-1">
          Consulte um pedido para realizar pagamento com Cartao BNDES
        </p>
      </header>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-xl">Consultar Pedido</CardTitle>
          <CardDescription>
            Digite o numero do pedido para verificar elegibilidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="numeroPedido">Numero do Pedido</Label>
              <div className="flex gap-3">
                <Input
                  id="numeroPedido"
                  type="text"
                  placeholder="Ex: 345678"
                  value={numeroPedido}
                  onChange={(e) => setNumeroPedido(e.target.value)}
                  disabled={isLoading}
                  className="flex-1"
                  aria-describedby={error ? "search-error" : undefined}
                />
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2">
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                      </span>
                      Consultando...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" aria-hidden="true" />
                      Consultar Pedido
                    </>
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert
                id="search-error"
                variant={alertStyle?.variant}
                className={cn("animate-in fade-in-0 slide-in-from-top-2", alertStyle?.className)}
                role="alert"
              >
                <AlertIcon className="h-4 w-4" aria-hidden="true" />
                <AlertTitle>
                  {error.type === "invalid_products" && "Produtos nao habilitados"}
                  {error.type === "invalid_customer" && "Cliente nao habilitado"}
                  {error.type === "not_found" && "Pedido nao encontrado"}
                </AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}
          </form>

          {/* Informacoes de ajuda */}
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-sm font-medium text-foreground mb-2">
              Codigos de teste:
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li><code className="bg-muted px-1 rounded">123456</code> - Produtos nao habilitados</li>
              <li><code className="bg-muted px-1 rounded">234567</code> - Cliente nao habilitado</li>
              <li><code className="bg-muted px-1 rounded">345678</code> - Pedido valido</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
