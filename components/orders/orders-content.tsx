"use client"

/**
 * =============================================================================
 * COMPONENTE - CONTEUDO DE PEDIDOS (ORQUESTRADOR)
 * =============================================================================
 * 
 * Responsabilidade: Gerenciar estados e fluxo de navegacao do modulo de Pedidos
 * 
 * Fluxo:
 * 1. Lista de pedidos (estado inicial)
 * 2. Visualizar comprovante (substitui conteudo central)
 * 3. Detalhes do pedido (drawer lateral)
 * 4. Modais: reenvio de pagamento, envio de NF
 * =============================================================================
 */

import { useState, useCallback } from "react"
import OrdersList from "./orders-list"
import { OrderReceipt } from "./order-receipt"
import { OrderDetails } from "./order-details"
import { ResendPaymentModal } from "./resend-payment-modal"
import { SendInvoiceModal } from "./send-invoice-modal"
import type { Order } from "@/types/order"

// =============================================================================
// TIPOS
// =============================================================================

type ViewMode = "list" | "receipt"

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export function OrdersContent() {
  // Estados de navegacao
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Estados de modais
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isResendModalOpen, setIsResendModalOpen] = useState(false)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)

  // Ordem selecionada para modais
  const [modalOrder, setModalOrder] = useState<Order | null>(null)

  // =========================================================================
  // HANDLERS
  // =========================================================================

  /**
   * Visualizar comprovante - substitui conteudo central
   */
  const handleViewReceipt = useCallback((order: Order) => {
    setSelectedOrder(order)
    setViewMode("receipt")
  }, [])

  /**
   * Voltar para lista
   */
  const handleBackToList = useCallback(() => {
    setSelectedOrder(null)
    setViewMode("list")
  }, [])

  /**
   * Abrir detalhes do pedido
   */
  const handleViewDetails = useCallback((order: Order) => {
    setModalOrder(order)
    setIsDetailsOpen(true)
  }, [])

  /**
   * Fechar detalhes
   */
  const handleCloseDetails = useCallback(() => {
    setIsDetailsOpen(false)
    setModalOrder(null)
  }, [])

  /**
   * Abrir modal de reenvio de pagamento
   */
  const handleResendPayment = useCallback((order: Order) => {
    setModalOrder(order)
    setIsResendModalOpen(true)
  }, [])

  /**
   * Fechar modal de reenvio
   */
  const handleCloseResendModal = useCallback(() => {
    setIsResendModalOpen(false)
  }, [])

  /**
   * Apos reenvio, ir para comprovante
   */
  const handleResendViewReceipt = useCallback(() => {
    if (modalOrder) {
      setSelectedOrder(modalOrder)
      setViewMode("receipt")
    }
    setIsResendModalOpen(false)
    setModalOrder(null)
  }, [modalOrder])

  /**
   * Abrir modal de envio de NF
   */
  const handleSendInvoice = useCallback((order: Order) => {
    setModalOrder(order)
    setIsInvoiceModalOpen(true)
  }, [])

  /**
   * Fechar modal de NF
   */
  const handleCloseInvoiceModal = useCallback(() => {
    setIsInvoiceModalOpen(false)
  }, [])

  /**
   * Apos envio de NF com sucesso
   */
  const handleInvoiceSuccess = useCallback(() => {
    setModalOrder(null)
    // Recarregar lista acontece automaticamente via estado
  }, [])

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <>
      {/* Conteudo Principal */}
      {viewMode === "list" && (
        <OrdersList
          onViewReceipt={handleViewReceipt}
          onViewDetails={handleViewDetails}
          onSendInvoice={handleSendInvoice}
          onResendPayment={handleResendPayment}
        />
      )}

      {viewMode === "receipt" && selectedOrder && (
        <OrderReceipt
          order={selectedOrder}
          onBack={handleBackToList}
        />
      )}

      {/* Drawer de Detalhes */}
      <OrderDetails
        order={modalOrder}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
      />

      {/* Modal de Reenvio de Pagamento */}
      <ResendPaymentModal
        order={modalOrder}
        isOpen={isResendModalOpen}
        onClose={handleCloseResendModal}
        onViewReceipt={handleResendViewReceipt}
      />

      {/* Modal de Envio de Nota Fiscal */}
      <SendInvoiceModal
        order={modalOrder}
        isOpen={isInvoiceModalOpen}
        onClose={handleCloseInvoiceModal}
        onSuccess={handleInvoiceSuccess}
      />
    </>
  )
}
