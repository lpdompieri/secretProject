"use client"

import React from "react"

/**
 * =============================================================================
 * COMPONENTE - MODAL DE ENVIO DE NOTA FISCAL
 * =============================================================================
 * 
 * Responsabilidade: Upload e envio de arquivo XML de nota fiscal
 * =============================================================================
 */

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle2, Loader2, Upload, FileText, X, File } from "lucide-react"
import { cn } from "@/lib/utils"
import { enviarNotaFiscal } from "@/services/orders-service"
import type { Order } from "@/types/order"

// =============================================================================
// TIPOS
// =============================================================================

interface SendInvoiceModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

// =============================================================================
// COMPONENTE
// =============================================================================

export function SendInvoiceModal({
  order,
  isOpen,
  onClose,
  onSuccess,
}: SendInvoiceModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileSelect(file: File) {
    // Validar extensao
    if (!file.name.toLowerCase().endsWith(".xml")) {
      alert("Por favor, selecione um arquivo XML")
      return
    }
    setSelectedFile(file)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave() {
    setIsDragging(false)
  }

  async function handleSend() {
    if (!order || !selectedFile) return

    setIsLoading(true)
    try {
      const response = await enviarNotaFiscal(order.numeroPedido, selectedFile)
      if (response.success) {
        setIsSuccess(true)
      }
    } catch (error) {
      console.error("Erro ao enviar nota fiscal:", error)
    } finally {
      setIsLoading(false)
    }
  }

  function handleClose() {
    setSelectedFile(null)
    setIsSuccess(false)
    setIsLoading(false)
    onClose()
  }

  function handleSuccessClose() {
    handleClose()
    onSuccess()
  }

  if (!order) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Enviar Nota Fiscal
              </DialogTitle>
              <DialogDescription>
                Pedido #{order.numeroPedido} - {order.loja.nome}
              </DialogDescription>
            </DialogHeader>

            {/* Area de Upload */}
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50",
                selectedFile && "border-green-500 bg-green-50"
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xml"
                onChange={handleInputChange}
                className="hidden"
                aria-label="Selecionar arquivo XML"
              />

              {selectedFile ? (
                <div className="space-y-3">
                  <div className="h-12 w-12 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                    <File className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-700">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    className="text-muted-foreground"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remover
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="h-12 w-12 mx-auto rounded-full bg-muted flex items-center justify-center">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Arraste o arquivo XML aqui</p>
                    <p className="text-sm text-muted-foreground">
                      ou clique para selecionar
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Selecionar Arquivo
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button
                onClick={handleSend}
                disabled={!selectedFile || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Enviar
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
                Nota Fiscal Enviada!
              </DialogTitle>
              <DialogDescription className="text-center">
                Nota fiscal enviada com sucesso
              </DialogDescription>
            </div>

            <div className="flex justify-center">
              <Button onClick={handleSuccessClose}>
                Fechar
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
