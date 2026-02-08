"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

type BndesStep = "creating" | "finalizing" | "error"

interface Props {
  open: boolean
  step: BndesStep
  pedido?: string | null
  error?: string | null
}

export function BndesProcessModal({
  open,
  step,
  pedido,
  error,
}: Props) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Processando pagamento BNDES</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {step === "creating" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
            <span>Gerando pedido no BNDES</span>
          </div>

          {pedido && (
            <div className="flex items-center gap-3">
              {step === "finalizing" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              <span>
                Pedido criado: <strong>{pedido}</strong>
              </span>
            </div>
          )}

          {step === "error" && (
            <div className="flex items-center gap-3 text-red-600">
              <XCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
