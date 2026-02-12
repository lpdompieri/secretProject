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
// COMPONENTE PRINCIPAL
// ============================================================

export function SendInvoiceModal({
order,
isOpen,
onClose,
onSuccess,
}: Props) {
const [viewMode, setViewMode] = useState("details")
const [invoices, setInvoices] = useState<Invoice[]>([])
const [loading, setLoading] = useState(false)
const [processingInvoiceId, setProcessingInvoiceId] = useState<string | null>(null)

// ==========================================================
// CARREGAR NOTAS DO PEDIDO
// ==========================================================

const loadInvoices = useCallback(async () => {
if (!order) return

setLoading(true)

try {
  // 1️⃣ Buscar notas no backend
  const response = await fetch(`/api/orders/${order.id}/invoices`)
  const data = await response.json()

  const backendInvoices: Invoice[] = data.data

  // 2️⃣ Consultar BNDES para cada nota
  const enriched = await Promise.all(
    backendInvoices.map(async (inv) => {
      try {
        const bndesRes = await fetch(
          `/api/bndes/check-invoice?numero=${inv.numero}&serie=${inv.serie}`
        )
        const bndesData = await bndesRes.json()

        return {
          ...inv,
          integradoBndes: bndesData.integrado,
          dataIntegracao: bndesData.dataIntegracao,
        }
      } catch {
        return {
          ...inv,
          integradoBndes: false,
        }
      }
    })
  )

  setInvoices(enriched)
} catch (error) {
  console.error("Erro ao carregar notas:", error)
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
// REENVIAR NOTA
// ==========================================================

const handleResendInvoice = async (invoice: Invoice) => {
setProcessingInvoiceId(invoice.id)

try {
  // 1️⃣ Buscar dados completos no backend
  await fetch(`/api/invoices/${invoice.id}`)

  // 2️⃣ Enviar para BNDES
  const response = await fetch(`/api/bndes/send-invoice`, {
    method: "POST",
    body: JSON.stringify({ invoiceId: invoice.id }),
  })

  const result = await response.json()

  if (result.success) {
    await loadInvoices()
  }
} catch (error) {
  console.error("Erro ao reenviar nota:", error)
} finally {
  setProcessingInvoiceId(null)
}

}

// ==========================================================
// RENDER
// ==========================================================

return (




{viewMode === "details" ? "Detalhes de NFe" : "Enviar Nota Fiscal"}




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
                      inv.dataIntegracao
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
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>

          <Button onClick={() => setViewMode("send")}>
            Enviar Nota Fiscal
          </Button>
        </div>
      </>
    ) : (
      <div className="py-8 text-center">
        {/* Aqui você mantém sua implementação atual de envio manual */}
        <p>Selecione a nota fiscal para envio.</p>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setViewMode("details")}>
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
