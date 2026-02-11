"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export type BndesPaymentStep =
  | "precapturing"
  | "capturing"
  | "success"
  | "error"

interface Props {
  open: boolean
  step: BndesPaymentStep
  error?: string | null
}

export function BndesPaymentModal({
  open,
  step,
  error,
}: Props) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Processando pagamento BNDES</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          {/* PRÉ-CAPTURA */}
          <div className="flex items-center gap-3">
            {step === "precapturing" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : step === "capturing" ||
              step === "success" ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <CheckCircle className="h-5 w-5 text-muted-foreground" />
            )}
            <span>Pré-captura do pagamento</span>
          </div>

          {/* CAPTURA */}
          <div className="flex items-center gap-3">
            {step === "capturing" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : step === "success" ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <CheckCircle className="h-5 w-5 text-muted-foreground" />
            )}
            <span>Captura do pagamento</span>
          </div>

          {/* SUCESSO */}
          {step === "success" && (
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>Pagamento confirmado com sucesso</span>
            </div>
          )}

          {/* ERRO */}
          {step === "error" && (
            <div className="flex items-center gap-3 text-red-600">
              <XCircle className="h-5 w-5" />
              <span>{error || "Erro ao processar pagamento"}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
