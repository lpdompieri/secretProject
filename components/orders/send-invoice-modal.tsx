"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, CheckCircle2, XCircle } from "lucide-react"
import type { Order } from "@/types/order"

// ============================================================
// CONFIG MOCK
// ============================================================

const USE_MOCK = true

// ============================================================
// TIPOS
// ============================================================

type ViewMode = "details" | "send"

interface Invoice {
  id: string
  numero: string
  serie: string
  dataEmissao: string
  integradoBndes: boolean
  dataIntegracao?: string
}

interface Props {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

// ============================================================
// MOCK FUNCTIONS
// ============================================================

function mockFetchInvoices(): Promise<Invoice[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: "1",
          numero: "423424",
          serie: "S1",
          dataEmissao: "2026-01-22",
          integradoBndes: true,
          dataIntegracao: "22/01/2026",
        },
        {
          id: "2",
          numero: "423432",
          serie: "S1",
          dataEmissao: "2026-01-24",
          integradoBndes: false,
        },
      ])
    }, 1000)
  })
}

function mockResendInvoice(): Promise<{ success: boolean }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true })
    }, 1500)
  })
}

// ============================================================
// COMPONENTE
// ============================================================

export function SendInvoiceModal({
  order,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("details")
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [processingInvoiceId, setProcessingInvoiceId] = useState<string | null>(null)

  const handleClose = () => {
    setViewMode("details")
    setInvoices([])
    setProcessingInvoiceId(null)
    onClose()
  }

  // ==========================================================
  // LOAD INVOICES
  // ==========================================================

  const loadInvoices = useCallback(async () => {
    if (!order) return

    setLoading(true)

    try {
      if (USE_MOCK) {
        const data = await mockFetchInvoices()
        setInvoices(data)
      } else {
        const response = await fetch(`/api/orders/${order.id}/invoices`)
        const data = await response.json()
        setInvoices(data?.data ?? [])
      }
    } catch (error) {
      console.error("Erro ao carregar notas:", error)
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }, [order])

  useEffect(() => {
    if (isOpen && viewMode === "details") {
      loadInvoices()
    }
  }, [isOpen, viewMode, loadInvoices])

  // ==========================================================
  // RESEND
  // ==========================================================

  const handleResendInvoice = async (invoice: Invoice) => {
    setProcessingInvoiceId(invoice.id)

    try {
      if (USE_MOCK) {
        await mockResendInvoice()

        setInvoices((prev) =>
          prev.map((inv) =>
            inv.id === invoice.id
              ? {
                  ...inv,
                  integradoBndes: true,
                  dataIntegracao: new Date().toLocaleDateString("pt-BR"),
                }
              : inv
          )
        )
      } else {
        const response = await fetch(`/api/bndes/send-invoice`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ invoiceId: invoice.id }),
        })

        const result = await response.json()

        if (result?.success) {
          await loadInvoices()
        }
      }
    } catch (error) {
      console.error("Erro ao reenviar nota:", error)
    } finally {
      setProcessingInvoiceId(null)
    }
  }

  if (!order) return null

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose()
      }}
    >
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {viewMode === "details"
              ? "Detalhes de NFe"
              : "Enviar Nota Fiscal"}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : viewMode === "details" ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Número</th>
                    <th className="text-left p-3">Série</th>
                    <th className="text-left p-3">Data Emissão</th>
                    <th className="text-left p-3">Integrado BNDES</th>
                    <th className="text-left p-3">Data Integração</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b">
                      <td className="p-3">{inv.numero}</td>
                      <td className="p-3">{inv.serie}</td>
                      <td className="p-3">
                        {new Date(inv.dataEmissao).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="p-3">
                        {inv.integradoBndes ? (
                          <CheckCircle2 className="text-green-600 h-4 w-4" />
                        ) : (
                          <XCircle className="text-red-600 h-4 w-4" />
                        )}
                      </td>
                      <td className="p-3">
                        {inv.integradoBndes ? (
                          inv.dataIntegracao ?? "-"
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResendInvoice(inv)}
                            disabled={processingInvoiceId === inv.id}
                          >
                            {processingInvoiceId === inv.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Reenviar
                              </>
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handleClose}>
                Fechar
              </Button>

              <Button onClick={() => setViewMode("send")}>
                Enviar Nota Fiscal
              </Button>
            </div>
          </>
        ) : (
          <div className="py-8 text-center">
            <p>Selecione a nota fiscal para envio.</p>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setViewMode("details")}
              >
                Cancelar
              </Button>
              <Button onClick={onSuccess}>Enviar</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
