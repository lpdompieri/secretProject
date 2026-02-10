"use client"

import {
  CheckCircle2,
  Download,
  ArrowLeft,
  Receipt,
  Calendar,
  CreditCard,
  Building2,
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
import { downloadComprovante } from "@/services/payment-service"
import type { PaymentReceipt } from "@/types/payment"

interface PaymentSuccessProps {
  receipt: PaymentReceipt
  onNewPayment: () => void
}

/**
 * Formata valor em reais (DEFENSIVO)
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

export function PaymentSuccess({
  receipt,
  onNewPayment,
}: PaymentSuccessProps) {
  function handleDownload() {
    downloadComprovante(receipt)
  }

  return (
    <div className="flex flex-col items-center animate-in fade-in-0 duration-300">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary/20 mb-4">
          <CheckCircle2 className="w-12 h-12 text-secondary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">
          Pagamento Realizado com Sucesso
        </h1>
        <p className="text-muted-foreground">
          Sua transacao foi aprovada e processada
        </p>
      </div>

      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="bg-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Comprovante de Pagamento
            </CardTitle>
            <Badge variant="secondary">
              {receipt.status === "approved"
                ? "APROVADO"
                : receipt.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Numero da Transacao
            </p>
            <p className="text-xl font-mono font-bold">
              {receipt.numeroTransacao}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex gap-3 p-3 bg-muted/30 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Data e Hora
                </p>
                <p className="font-medium">
                  {receipt.data} às {receipt.hora}
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-3 bg-muted/30 rounded-lg">
              <Receipt className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Numero do Pedido
                </p>
                <p className="font-medium">
                  {receipt.numeroPedido}
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-3 bg-muted/30 rounded-lg sm:col-span-2">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Cliente
                </p>
                <p className="font-medium">
                  {receipt.cliente.nome}
                </p>
                <p className="text-sm text-muted-foreground">
                  CNPJ: {receipt.cliente.cnpj}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-secondary" />
              Detalhes do Pagamento
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Valor Original</span>
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
                <span>Total</span>
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
          </div>

          <Separator />

          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Autorizacao
            </p>
            <p className="font-medium">
              Codigo: {receipt.autorizacao.codigo}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleDownload}
              className="flex-1 bg-secondary text-secondary-foreground"
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar Comprovante
            </Button>
            <Button
              onClick={onNewPayment}
              variant="outline"
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
