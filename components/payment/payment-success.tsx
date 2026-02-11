"use client"

import { CheckCircle2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PaymentReceiptCard } from "./payment-receipt-card"
import type { PaymentReceipt } from "@/types/payment"

interface PaymentSuccessProps {
  receipt: PaymentReceipt
  onNewPayment: () => void
}

export function PaymentSuccess({
  receipt,
  onNewPayment,
}: PaymentSuccessProps) {

  console.log("RECEIPT FINAL:", receipt)
  
  const aprovado =
    receipt.situacao === 20 ||
    receipt.situacao === 40

  return (
    <div className="flex flex-col items-center animate-in fade-in-0 duration-300 space-y-8">

      {/* HEADER */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary/20 mb-4">
          <CheckCircle2 className="w-12 h-12 text-secondary" />
        </div>

        <h1 className="text-3xl font-bold mb-2">
          {aprovado
            ? "Pagamento Aprovado"
            : "Pagamento Processado"}
        </h1>

        <p className="text-muted-foreground">
          Transação concluída com sucesso
        </p>
      </div>

      {/* CARD MODERNO */}
      <PaymentReceiptCard receipt={receipt} />

      {/* AÇÕES */}
      <div className="w-full max-w-3xl">
        <Button
          onClick={onNewPayment}
          variant="outline"
          className="w-full"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Novo Pagamento
        </Button>
      </div>
    </div>
  )
}
