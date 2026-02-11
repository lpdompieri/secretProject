"use client"

import {
  Receipt,
  Calendar,
  CreditCard,
  Hash,
  Building2,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

import type { PaymentReceipt } from "@/types/payment"

// ===============================================================
// UTIL
// ===============================================================

function formatCurrency(value?: number): string {
  if (typeof value !== "number" || isNaN(value)) {
    return "R$ 0,00"
  }

  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

function formatDateTime(iso?: string) {
  if (!iso) return "-"

  return new Date(iso).toLocaleString("pt-BR")
}

function mapStatus(situacao?: number) {
  if (situacao === 20 || situacao === 40) {
    return {
      label: "PAGAMENTO APROVADO",
      variant: "secondary" as const,
    }
  }

  return {
    label: "EM PROCESSAMENTO",
    variant: "outline" as const,
  }
}

function mapAdquirente(cnpj?: string) {
  if (!cnpj) return "Não informado"

  const clean = cnpj.replace(/\D/g, "")

  const adquirentes: Record<string, string> = {
    "01027058000191": "Cielo",
  }

  return adquirentes[clean] || clean
}

// ===============================================================
// COMPONENTE
// ===============================================================

interface Props {
  receipt: PaymentReceipt
}

export function PaymentReceiptCard({ receipt }: Props) {
  const status = mapStatus(receipt.situacao)

  return (
    <Card className="w-full max-w-3xl shadow-xl border-0 bg-gradient-to-br from-background to-muted/40">
      <CardHeader className="bg-primary text-primary-foreground rounded-t-xl">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Comprovante de Pagamento BNDES
          </CardTitle>

          <Badge variant={status.variant}>
            {status.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-8 space-y-8">

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
            <span>{formatCurrency(receipt.valorOriginal)}</span>
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

        {/* DADOS TRANSACIONAIS */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Código de Autorização</span>
            <span className="font-semibold">
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
            <span>Data do Pagamento</span>
            <span>
              {formatDateTime(receipt.dataHoraCaptura)}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Adquirente</span>
            <span className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              {mapAdquirente(receipt.cnpjAdquirente)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
