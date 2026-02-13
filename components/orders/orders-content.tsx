"use client"

/**
 * =============================================================================
 * COMPONENTE - CONTEUDO DE PEDIDOS (ORQUESTRADOR)
 * =============================================================================
 */

import { useState, useCallback } from "react"
import { OrdersList } from "./orders-list"
import { OrdersPendencias } from "./orders-pendencias"
import { OrderReceipt } from "./order-receipt"
import { OrderDetails } from "./order-details"
import { ResendPaymentModal } from "./resend-payment-modal"
import { SendInvoiceModal } from "./send-invoice-modal"
import { Button } from "@/components/ui/button"
import type { Order } from "@/types/order"

// =============================================================================
// TIPOS
// =============================================================================

type ViewMode = "list" | "receipt"
type TabMode = "pedidos" | "pendencias"

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export function OrdersContent() {
  // Controle de abas
  const [tab, setTab] = useState<TabMode>("pedidos")

  // Estados de navegacao
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Estados de modais
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isResendModalOpen, setIsResendModalOpen] = useState(false)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)

  const [modalOrder, setModalOrder] = useState<Order | null>(null)

  // =========================================================================
  // HANDLERS
  // =========================================================================

  const handleViewReceipt = useCallback((order: Order) => {
    setSelectedOrder(order)
    setViewMode("receipt")
  }, [])

  const handleBackToList = useCallback(() => {
    setSelectedOrder(null)
    setViewMode("list")
  }, [])

  const handleViewDetails = useCallback((order: Order) => {
    setModalOrder(order)
    setIsDetailsOpen(true)
  }, [])

  const handleCloseDetails = useCallback(() => {
    setIsDetailsOpen(false)
    setModalOrder(null)
  }, [])

  const handleResendPayment = useCallback((order: Order) => {
    setModalOrder(order)
    setIsResendModalOpen(true)
  }, [])

  const handleCloseResendModal = useCallback(() => {
    setIsResendModalOpen(false)
  }, [])

  const handleResendViewReceipt = useCallback(() => {
    if (modalOrder) {
      setSelectedOrder(modalOrder)
      setViewMode("receipt")
    }
    setIsResendModalOpen(false)
    setModalOrder(null)
  }, [modalOrder])

  const handleSendInvoice = useCallback((order: Order) => {
    setModalOrder(order)
    setIsInvoiceModalOpen(true)
  }, [])

  const handleCloseInvoiceModal = useCallback(() => {
    setIsInvoiceModalOpen(false)
  }, [])

  const handleInvoiceSuccess = useCallback(() => {
    setModalOrder(null)
  }, [])

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="space-y-6">
      
      {/* =========================================================
         HEADER DE ABAS (PADRÃO VISUAL DO SISTEMA)
      ========================================================== */}
      {viewMode === "list" && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 border-b pb-3">
          <Button
            variant={tab === "pedidos" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("pedidos")}
            className="w-full sm:w-auto"
          >
            Pedidos
          </Button>

          <Button
            variant={tab === "pendencias" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("pendencias")}
            className="w-full sm:w-auto"
          >
            Pendências - NFE
          </Button>
        </div>
      )}

      {/* =========================================================
         CONTEÚDO PRINCIPAL
      ========================================================== */}

      {viewMode === "list" && tab === "pedidos" && (
        <OrdersList
          onViewReceipt={handleViewReceipt}
          onViewDetails={handleViewDetails}
          onSendInvoice={handleSendInvoice}
          onResendPayment={handleResendPayment}
        />
      )}

      {viewMode === "list" && tab === "pendencias" && (
        <OrdersPendencias />
      )}

      {viewMode === "receipt" && selectedOrder && (
        <OrderReceipt
          order={selectedOrder}
          onBack={handleBackToList}
        />
      )}

      {/* =========================================================
         MODAIS E DRAWERS
      ========================================================== */}

      <OrderDetails
        order={modalOrder}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
      />

      <ResendPaymentModal
        order={modalOrder}
        isOpen={isResendModalOpen}
        onClose={handleCloseResendModal}
        onViewReceipt={handleResendViewReceipt}
      />

      <SendInvoiceModal
        order={modalOrder}
        isOpen={isInvoiceModalOpen}
        onClose={handleCloseInvoiceModal}
        onSuccess={handleInvoiceSuccess}
      />
    </div>
  )
}
