"use client"

/**
 * =============================================================================
 * COMPONENTE - COMPROVANTE DE PAGAMENTO
 * =============================================================================
 * 
 * Responsabilidade: Exibir comprovante de pagamento de um pedido
 * =============================================================================
 */

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Download,
  CheckCircle2,
  Receipt,
  Store,
  Calendar,
  CreditCard,
} from "lucide-react"
import type { Order } from "@/types/order"
import { gerarComprovante } from "@/services/orders-service"

// =============================================================================
// TIPOS
// =============================================================================

interface OrderReceiptProps {
  order: Order
  onBack: () => void
}

// =============================================================================
// COMPONENTE
// =============================================================================

export function OrderReceipt({ order, onBack }: OrderReceiptProps) {
  const receipt = gerarComprovante(order)

  if (!receipt) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Pedidos
        </Button>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Comprovante nao disponivel para este pedido
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  function handleSaveReceipt() {
    // Simula download do comprovante
    // INTEGRACAO: Aqui seria chamada a API para gerar PDF
    alert("Comprovante salvo com sucesso!")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Pedidos
        </Button>
        <Button onClick={handleSaveReceipt} className="gap-2">
          <Download className="h-4 w-4" />
          Salvar Comprovante
        </Button>
      </div>

      {/* Comprovante */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-xl">Comprovante de Pagamento</CardTitle>
          <p className="text-sm text-muted-foreground">
            Transacao realizada com sucesso
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status e Data */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Receipt className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Pedido #{receipt.numeroPedido}</p>
                <p className="text-sm text-muted-foreground">
                  Status: {receipt.status}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{receipt.data}</span>
              </div>
              <p className="text-sm text-muted-foreground">{receipt.hora}</p>
            </div>
          </div>

          {/* Loja */}
          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <Store className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{receipt.loja}</p>
              <p className="text-sm text-muted-foreground">CNPJ: {receipt.cnpjLoja}</p>
            </div>
          </div>

          <Separator />

          {/* Valores */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Valor Original</span>
              <span>
                {receipt.valorOriginal.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Parcelamento</span>
              <span>{receipt.parcelas}x de {receipt.valorParcela.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Taxa de Juros</span>
              <span>{receipt.taxaJuros}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Valor dos Juros</span>
              <span>
                {receipt.valorJuros.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Valor Total</span>
              <span className="text-primary">
                {receipt.valorTotal.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>
          </div>

          <Separator />

          {/* Dados do Cartao */}
          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Cartao {receipt.cartao.bandeira}</p>
              <p className="text-sm text-muted-foreground">
                Final {receipt.cartao.finalCartao}
              </p>
            </div>
          </div>

          {/* Dados da Transacao */}
          <div className="p-4 bg-muted/30 rounded-lg space-y-2">
            <p className="text-sm font-medium mb-3">Dados da Transacao</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">ID Transacao</p>
                <p className="font-mono">{receipt.transacaoId}</p>
              </div>
              <div>
                <p className="text-muted-foreground">NSU Host</p>
                <p className="font-mono">{receipt.nsuHost}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Autorizacao</p>
                <p className="font-mono">{receipt.codigoAutorizacao}</p>
              </div>
            </div>
          </div>

          {/* Footer do Comprovante */}
          <div className="text-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Este comprovante e valido como documento fiscal.
            </p>
            <p className="text-xs text-muted-foreground">
              Em caso de duvidas, entre em contato com o suporte.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
