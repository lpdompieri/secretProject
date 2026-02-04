"use client"

/**
 * =============================================================================
 * COMPONENTE: CONTEUDO PRINCIPAL DO MODULO DE PAGAMENTO
 * =============================================================================
 * 
 * Responsabilidade: Orquestrar o fluxo completo de pagamento, gerenciando
 * a transicao entre as diferentes etapas:
 * 
 * 1. Consulta de pedido (OrderSearch)
 * 2. Checkout com parcelamento (PaymentCheckout)
 * 3. Modal de autorizacao do gerente (ManagerAuthModal)
 * 4. Processamento do pagamento (PaymentProcessing)
 * 5. Tela de sucesso com comprovante (PaymentSuccess)
 * 
 * Estados:
 * - "search": Tela inicial de consulta
 * - "checkout": Selecao de parcelamento
 * - "processing": Processando pagamento
 * - "success": Pagamento concluido
 * =============================================================================
 */

import { useState } from "react"
import { OrderSearch } from "./order-search"
import { PaymentCheckout } from "./payment-checkout"
import { ManagerAuthModal } from "./manager-auth-modal"
import { PaymentProcessing } from "./payment-processing"
import { PaymentSuccess } from "./payment-success"
import { processarPagamento } from "@/services/payment-service"
import type { Order, InstallmentOption, PaymentReceipt, PaymentProcessingStep, CardData } from "@/types/payment"

type PaymentStep = "search" | "checkout" | "processing" | "success"

export function PaymentContent() {
  // Estado do fluxo
  const [currentStep, setCurrentStep] = useState<PaymentStep>("search")
  
  // Dados do pagamento
  const [order, setOrder] = useState<Order | null>(null)
  const [parcelamento, setParcelamento] = useState<InstallmentOption | null>(null)
  const [cardData, setCardData] = useState<CardData | null>(null)
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null)
  
  // Modal de autorizacao
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  
  // Etapa do processamento
  const [processingStep, setProcessingStep] = useState<PaymentProcessingStep>("initiating")

  /**
   * Quando um pedido valido e encontrado, avanca para checkout
   */
  function handleOrderFound(foundOrder: Order) {
    setOrder(foundOrder)
    setCurrentStep("checkout")
  }

  /**
   * Voltar para consulta de pedido
   */
  function handleBackToSearch() {
    setOrder(null)
    setParcelamento(null)
    setCardData(null)
    setCurrentStep("search")
  }

  /**
   * Quando usuario seleciona parcelamento e clica em pagar
   * Agora tambem recebe os dados do cartao
   */
  function handleProceedToPayment(selectedParcelamento: InstallmentOption, card: CardData) {
    setParcelamento(selectedParcelamento)
    setCardData(card)
    setIsAuthModalOpen(true)
  }

  /**
   * Quando autorizacao do gerente e validada
   */
  async function handleAuthorized(codigo: string) {
    setIsAuthModalOpen(false)
    setCurrentStep("processing")
    setProcessingStep("initiating")

    if (!order || !parcelamento) return

    // Processar pagamento
    const result = await processarPagamento(
      order.numeroPedido,
      parcelamento,
      codigo,
      setProcessingStep
    )

    if (result.success && result.receipt) {
      setReceipt(result.receipt)
      setCurrentStep("success")
    } else {
      // Em caso de erro, voltar para checkout
      // TODO: Exibir mensagem de erro
      setCurrentStep("checkout")
    }
  }

  /**
   * Iniciar novo pagamento
   */
  function handleNewPayment() {
    setOrder(null)
    setParcelamento(null)
    setCardData(null)
    setReceipt(null)
    setCurrentStep("search")
  }

  // Renderizar etapa atual
  switch (currentStep) {
    case "search":
      return <OrderSearch onOrderFound={handleOrderFound} />

    case "checkout":
      if (!order) return null
      return (
        <>
          <PaymentCheckout
            order={order}
            onBack={handleBackToSearch}
            onProceed={handleProceedToPayment}
          />
          <ManagerAuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onAuthorized={handleAuthorized}
          />
        </>
      )

    case "processing":
      return <PaymentProcessing currentStep={processingStep} />

    case "success":
      if (!receipt) return null
      return (
        <PaymentSuccess
          receipt={receipt}
          onNewPayment={handleNewPayment}
        />
      )

    default:
      return <OrderSearch onOrderFound={handleOrderFound} />
  }
}
