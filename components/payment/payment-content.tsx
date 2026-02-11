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
 * 4. Modal de processamento do pagamento (BndesPaymentModal)
 * 5. Tela de sucesso com comprovante (PaymentSuccess)
 *
 * IMPORTANTE:
 * - Nao trocamos mais para uma tela de "processing".
 * - O processamento agora ocorre dentro de um modal.
 *
 * Estados:
 * - "search": Tela inicial de consulta
 * - "checkout": Selecao de parcelamento
 * - "success": Pagamento concluido
 * =============================================================================
 */

import { useState } from "react"
import { OrderSearch } from "./order-search"
import { PaymentCheckout } from "./payment-checkout"
import { ManagerAuthModal } from "./manager-auth-modal"
import { PaymentSuccess } from "./payment-success"
import { BndesPaymentModal, BndesPaymentStep } from "./bndes-payment-modal"

import type {
  Order,
  InstallmentOption,
  PaymentReceipt,
  CardData,
} from "@/types/payment"

type PaymentStep = "search" | "checkout" | "success"

export function PaymentContent() {
  /**
   * ===========================================================================
   * ESTADO PRINCIPAL DO FLUXO
   * ===========================================================================
   */
  const [currentStep, setCurrentStep] =
    useState<PaymentStep>("search")

  /**
   * ===========================================================================
   * DADOS DO PAGAMENTO
   * ===========================================================================
   */
  const [order, setOrder] = useState<Order | null>(null)
  const [parcelamento, setParcelamento] =
    useState<InstallmentOption | null>(null)
  const [cardData, setCardData] =
    useState<CardData | null>(null)
  const [receipt, setReceipt] =
    useState<PaymentReceipt | null>(null)

  /**
   * ===========================================================================
   * CONTROLE DE MODAIS
   * ===========================================================================
   */
  const [isAuthModalOpen, setIsAuthModalOpen] =
    useState(false)

  const [isPaymentModalOpen, setIsPaymentModalOpen] =
    useState(false)

  /**
   * ===========================================================================
   * ETAPA DO MODAL DE PAGAMENTO
   * ===========================================================================
   */
  const [paymentStep, setPaymentStep] =
    useState<BndesPaymentStep>("precapturing")

  /**
   * ===========================================================================
   * 1️⃣ Quando um pedido valido e encontrado
   * ===========================================================================
   */
  function handleOrderFound(foundOrder: Order) {
    setOrder(foundOrder)
    setCurrentStep("checkout")
  }

  /**
   * ===========================================================================
   * 2️⃣ Voltar para consulta de pedido
   * ===========================================================================
   */
  function handleBackToSearch() {
    setOrder(null)
    setParcelamento(null)
    setCardData(null)
    setCurrentStep("search")
  }

  /**
   * ===========================================================================
   * 3️⃣ Usuario seleciona parcelamento e clica em pagar
   *    → Abrimos modal de autorizacao do gerente
   * ===========================================================================
   */
  function handleProceedToPayment(
    selectedParcelamento: InstallmentOption,
    card: CardData
  ) {
    setParcelamento(selectedParcelamento)
    setCardData(card)
    setIsAuthModalOpen(true)
  }

  /**
   * ===========================================================================
   * 4️⃣ Gerente autorizou pagamento
   *
   * Fluxo:
   * - Fecha modal de autorizacao
   * - Abre modal de processamento
   * - Executa:
   *      a) Pre-captura
   *      b) Captura
   * - Se sucesso → Tela de sucesso
   * - Se erro → Mantem usuario no checkout
   * ===========================================================================
   */
  async function handleAuthorized() {
    setIsAuthModalOpen(false)
    setIsPaymentModalOpen(true)

    if (!order || !parcelamento || !cardData) {
      setIsPaymentModalOpen(false)
      return
    }

    try {
      /**
       * ===============================
       * PRÉ-CAPTURA
       * ===============================
       */
      setPaymentStep("precapturing")

      // 🔥 Aqui depois entra a chamada real da API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      /**
       * ===============================
       * CAPTURA
       * ===============================
       */
      setPaymentStep("capturing")

      // 🔥 Aqui depois entra a chamada real da API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      /**
       * ===============================
       * SUCESSO
       * ===============================
       */
      setPaymentStep("success")

      await new Promise((resolve) => setTimeout(resolve, 1000))

      /**
       * Simulacao de recibo
       * (Depois substituiremos pelo retorno real do BNDES)
       */
      const fakeReceipt: PaymentReceipt = {
        numeroPedido: order.numeroPedido,
        valor: parcelamento.valorTotal,
        parcelas: parcelamento.quantidadeParcelas,
        data: new Date().toISOString(),
        autorizacao: "BNDES-OK-123456",
      }

      setReceipt(fakeReceipt)
      setIsPaymentModalOpen(false)
      setCurrentStep("success")

    } catch (error) {
      setPaymentStep("error")

      setTimeout(() => {
        setIsPaymentModalOpen(false)
      }, 2000)
    }
  }

  /**
   * ===========================================================================
   * 5️⃣ Iniciar novo pagamento
   * ===========================================================================
   */
  function handleNewPayment() {
    setOrder(null)
    setParcelamento(null)
    setCardData(null)
    setReceipt(null)
    setCurrentStep("search")
  }

  /**
   * ===========================================================================
   * RENDERIZACAO POR ETAPA
   * ===========================================================================
   */
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

          <BndesPaymentModal
            open={isPaymentModalOpen}
            step={paymentStep}
          />
        </>
      )

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
