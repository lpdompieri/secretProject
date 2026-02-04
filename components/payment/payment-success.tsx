"use client"

/**
 * =============================================================================
 * COMPONENTE: TELA DE SUCESSO DO PAGAMENTO
 * =============================================================================
 * 
 * Responsabilidade: Exibir comprovante de pagamento apos conclusao
 * bem-sucedida da transacao.
 * 
 * Acoes disponiveis:
 * - Baixar comprovante (mock - gera arquivo texto)
 * - Voltar para nova consulta de pagamento
 * =============================================================================
 */

import { CheckCircle2, Download, ArrowLeft, Receipt, Calendar, CreditCard, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { downloadComprovante } from "@/services/payment-service"
import type { PaymentReceipt } from "@/types/payment"

interface PaymentSuccessProps {
  receipt: PaymentReceipt
  onNewPayment: () => void
}

/**
 * Formata valor em reais
 */
function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

export function PaymentSuccess({ receipt, onNewPayment }: PaymentSuccessProps) {
  function handleDownload() {
    downloadComprovante(receipt)
  }

  return (
    <div className="flex flex-col items-center animate-in fade-in-0 duration-300">
      {/* Header de sucesso */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary/20 mb-4 animate-in zoom-in-0 duration-500">
          <CheckCircle2 className="w-12 h-12 text-secondary" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Pagamento Realizado com Sucesso
        </h1>
        <p className="text-muted-foreground">
          Sua transacao foi aprovada e processada
        </p>
      </div>

      {/* Comprovante */}
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" aria-hidden="true" />
              Comprovante de Pagamento
            </CardTitle>
            <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
              {receipt.status === "approved" ? "APROVADO" : receipt.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Numero da transacao */}
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Numero da Transacao</p>
            <p className="text-xl font-mono font-bold text-foreground">
              {receipt.numeroTransacao}
            </p>
          </div>

          {/* Grid de informacoes */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Data e hora */}
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <Calendar className="h-5 w-5 text-primary mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-sm text-muted-foreground">Data e Hora</p>
                <p className="font-medium">{receipt.data} as {receipt.hora}</p>
              </div>
            </div>

            {/* Pedido */}
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <Receipt className="h-5 w-5 text-primary mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-sm text-muted-foreground">Numero do Pedido</p>
                <p className="font-medium">{receipt.numeroPedido}</p>
              </div>
            </div>

            {/* Cliente */}
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg sm:col-span-2">
              <Building2 className="h-5 w-5 text-primary mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-medium">{receipt.cliente.nome}</p>
                <p className="text-sm text-muted-foreground">CNPJ: {receipt.cliente.cnpj}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Valores */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-secondary" aria-hidden="true" />
              Detalhes do Pagamento
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor Original</span>
                <span>{formatCurrency(receipt.valorOriginal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Juros</span>
                <span className="text-amber-600">+{formatCurrency(receipt.juros)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Valor Total</span>
                <span className="text-primary">{formatCurrency(receipt.valorTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Parcelamento</span>
                <span className="font-medium">
                  {receipt.parcelas}x de {formatCurrency(receipt.valorParcela)}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Autorizacao */}
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Autorizacao</p>
            <p className="font-medium">
              Codigo: {receipt.autorizacao.codigo}
              {receipt.autorizacao.gerente && (
                <span className="text-muted-foreground ml-2">
                  (Gerente: {receipt.autorizacao.gerente})
                </span>
              )}
            </p>
          </div>

          {/* Acoes */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleDownload}
              className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              <Download className="h-4 w-4 mr-2" aria-hidden="true" />
              Baixar Comprovante
            </Button>
            <Button
              onClick={onNewPayment}
              variant="outline"
              className="flex-1 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
              Voltar para Consulta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
