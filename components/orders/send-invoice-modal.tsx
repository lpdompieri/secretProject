"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Loader2, RefreshCw, CheckCircle2, XCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"
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

function mockSendInvoice(): Promise<{ success: boolean }> {
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

  // Upload XML
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClose = () => {
    setViewMode("details")
    setInvoices([])
    setSelectedFile(null)
    setFormError(null)
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
      }
    } catch (error) {
      console.error("Erro ao reenviar nota:", error)
    } finally {
      setProcessingInvoiceId(null)
    }
  }

  // ==========================================================
  // UPLOAD XML
  // ==========================================================

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith(".xml")) {
      setFormError("Selecione um arquivo XML válido")
      return
    }

    setSelectedFile(file)
    setFormError(null)
  }

  function handleRemoveFile() {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  async function handleSendInvoice() {
    if (!selectedFile) {
      setFormError("Selecione um XML antes de enviar")
      return
    }

    setSending(true)

    try {
      if (USE_MOCK) {
        await mockSendInvoice()
      } else {
        const formData = new FormData()
        formData.append("file", selectedFile)

        await fetch(`/api/bndes/send-invoice`, {
          method: "POST",
          body: formData,
        })
      }

      await loadInvoices()
      setViewMode("details")
      setSelectedFile(null)
      onSuccess()
    } catch (error) {
      console.error("Erro ao enviar XML:", error)
      setFormError("Erro ao enviar nota fiscal")
    } finally {
      setSending(false)
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
          <div className="space-y-6">
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xml"
                onChange={handleFileSelect}
                className="sr-only"
              />

              {!selectedFile ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg",
                    "border-border hover:border-primary/50 hover:bg-muted/50 transition-colors",
                    "cursor-pointer w-full"
                  )}
                >
                  <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium">
                    Clique para selecionar o XML da nota fiscal
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Apenas arquivos .xml
                  </p>
                </button>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <FileText className="h-8 w-8 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {formError && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                {formError}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setViewMode("details")}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSendInvoice}
                disabled={!selectedFile || sending}
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Enviar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
