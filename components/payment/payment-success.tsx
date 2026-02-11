"use client"

import {
  CheckCircle2,
  Download,
  ArrowLeft,
  Receipt,
  Calendar,
  CreditCard,
  Hash,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import type { PaymentReceipt } from "@/types/payment"

interface PaymentSuccessProps {
  receipt: PaymentReceipt
  onNewPayment: () => void
}

/**
 * ============================================================================
 * UTIL: Formatar moeda
 * ============================================================================
 */
function formatCurrency(value?: number): string {
  if (typeof value !== "number" || isNaN(value)) {
    return "R$ 0,00"
  }

  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

/**
 * ============================================================================
 * UTIL: Formatar data ISO do BNDES
 * ============================================================================
 */
function formatDateTime(iso: string) {
  if (!iso) return "-"

  const date = new Date(iso)

  return date.toLocaleString("pt-BR")
}

/**
 * ============================================================================
 * COMPONENTE
 * ============================================================================
 */
export function PaymentSuccess({
  receipt,
  onNewPayment,
}: PaymentSuccessProps) {

  const pagamentoEfetuado =
    receipt.situacao === 40

  return (
    <div className="flex flex-col items-center animate-in fade-in-0 duration-300">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary/20 mb-4">
          <CheckCircle2 className="w-12 h-12 text-secondary" />
        </div>

        <h1 className="text-3xl font-bold mb-2">
          {pagamentoEfetuado
            ? "Pagamento Efetuado"
            : "Pagamento Processado"}
        </h1>

        <p className="text-muted-foreground">
          {receipt.descricao}
        </p>
      </div>

      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="bg-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Comprovante de Pagamento BNDES
            </CardTitle>

            <Badge variant="secondary">
              {pagamentoEfetuado
                ? "PAGAMENTO EFETUADO"
                : receipt.descricao}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">

          {/* PEDIDOS */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Pedido Consultado</span>
              <span className="font-medium">
                {receipt.numeroPedidoInterno}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Pedido BNDES</span>
              <span className="font-medium">
                {receipt.numeroPedidoBndes}
              </span>
            </div>
          </div>

          <Separator />

          {/* VALORES */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Valor do Pedido</span>
              <span>
                {formatCurrency(receipt.valorOriginal)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Juros</span>
              <span className="text-amber-600">
                +{formatCurrency(receipt.juros)}
              </span>
            </div>

            <Separator />

            <div className="flex justify-between text-lg font-bold">
              <span>Total do Pagamento</span>
              <span className="text-primary">
                {formatCurrency(receipt.valorTotal)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Parcelamento</span>
              <span>
                {receipt.parcelas}x de{" "}
                {formatCurrency(receipt.valorParcela)}
              </span>
            </div>
          </div>

          <Separator />

          {/* DADOS BNDES */}
          <div className="space-y-3 text-sm">

            <div className="flex justify-between">
              <span>Código de Autorização</span>
              <span className="font-medium">
                {receipt.numeroAutorizacao}
              </span>
            </div>

            <div className="flex justify-between">
              <span>TID</span>
              <span className="font-mono text-xs break-all">
                {receipt.tid}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Status</span>
              <span className="font-medium">
                {pagamentoEfetuado
                  ? "PAGAMENTO EFETUADO"
                  : receipt.descricao}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Data do Pagamento</span>
              <span>
                {formatDateTime(receipt.dataHoraCaptura)}
              </span>
            </div>
          </div>

          <Separator />

          {/* AÇÕES */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onNewPayment}
              variant="outline"
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Novo Pagamento
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
