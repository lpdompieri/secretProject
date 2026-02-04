"use client"

/**
 * =============================================================================
 * COMPONENTE - MODAL DE REENVIO DE PAGAMENTO
 * =============================================================================
 * 
 * Responsabilidade: Confirmar e exibir resultado do reenvio de dados de pagamento
 * =============================================================================
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle2, Loader2, Send, FileText, X } from "lucide-react"
import { reenviarPagamento } from "@/services/orders-service"
import type { Order } from "@/types/order"

// =============================================================================
// TIPOS
// =============================================================================

interface ResendPaymentModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onViewReceipt: () => void
}

// =============================================================================
// COMPONENTE
// =============================================================================

export function ResendPaymentModal({
  order,
  isOpen,
  onClose,
  onViewReceipt,
}: ResendPaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleResend() {
    if (!order) return

    setIsLoading(true)
    try {
      const response = await reenviarPagamento(order.numeroPedido)
      if (response.success) {
        setIsSuccess(true)
      }
    } catch (error) {
      console.error("Erro ao reenviar pagamento:", error)
    } finally {
      setIsLoading(false)
    }
  }

  function handleClose() {
    setIsSuccess(false)
    setIsLoading(false)
    onClose()
  }

  function handleViewReceipt() {
    handleClose()
    onViewReceipt()
  }

  if (!order) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                Reenviar Pagamento
              </DialogTitle>
              <DialogDescription>
                Deseja reenviar os dados do pagamento do pedido #{order.numeroPedido}?
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pedido</span>
                  <span className="font-medium">#{order.numeroPedido}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Loja</span>
                  <span className="font-medium">{order.loja.nome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor</span>
                  <span className="font-medium">
                    {order.valorTotal.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button onClick={handleResend} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Reenviar
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center py-6">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <DialogTitle className="text-center mb-2">
                Dados Reenviados!
              </DialogTitle>
              <DialogDescription className="text-center">
                Dados do pagamento reenviados com sucesso
              </DialogDescription>
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleViewReceipt}>
                <FileText className="h-4 w-4 mr-2" />
                Visualizar Comprovante
              </Button>
              <Button onClick={handleClose}>
                <X className="h-4 w-4 mr-2" />
                Fechar
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
