"use client"

/**
 * =============================================================================
 * COMPONENTE: CONTEUDO PRINCIPAL DO MODULO DE PAGAMENTO
 * =============================================================================
 *
 * Fluxo:
 * 1. Consulta pedido
 * 2. Checkout
 * 3. Autorizacao gerente
 * 4. Modal processamento (pré-captura + captura)
 * 5. Tela sucesso
 * =============================================================================
 */

import { useState } from "react"
import { OrderSearch } from "./order-search"
import { PaymentCheckout } from "./payment-checkout"
import { ManagerAuthModal } from "./manager-auth-modal"
import { PaymentSuccess } from "./payment-success"
import {
  BndesPaymentModal,
  BndesPaymentStep,
} from "./bndes-payment-modal"

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
   * ESTADO PRINCIPAL
   * ===========================================================================
   */
  const [currentStep, setCurrentStep] =
    useState<PaymentStep>("search")

  const [order, setOrder] =
    useState<Order | null>(null)

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
   * ETAPA DO PROCESSAMENTO
   * ===========================================================================
   */
  const [paymentStep, setPaymentStep] =
    useState<BndesPaymentStep>("precapturing")

  /**
   * Proteção contra double click / múltiplas execuções
   */
  const [isProcessing, setIsProcessing] =
    useState(false)

  /**
   * ===========================================================================
   * 1️⃣ Pedido encontrado
   * ===========================================================================
   */
  function handleOrderFound(foundOrder: Order) {
    setOrder(foundOrder)
    setCurrentStep("checkout")
  }

  /**
   * ===========================================================================
   * 2️⃣ Voltar para busca
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
   * 3️⃣ Usuario clicou em pagar
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
   * 4️⃣ Gerente autorizou → Fluxo real BNDES
   * ===========================================================================
   */
  async function handleAuthorized() {
    if (isProcessing) return
    setIsProcessing(true)

    setIsAuthModalOpen(false)
    setIsPaymentModalOpen(true)

    if (!order || !parcelamento || !cardData) {
      setIsPaymentModalOpen(false)
      setIsProcessing(false)
      return
    }

    try {
      /**
       * ==========================================================
       * PRÉ-CAPTURA
       * ==========================================================
       */
      setPaymentStep("precapturing")

      console.log("🟡 [FRONT] Iniciando PRÉ-CAPTURA",
        order.numeroPedido)

      const precapturaResp = await fetch(
        "/api/bndes/pedido-precaptura",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pedido: order.numeroPedido,
            numeroCartao: cardData.numero.replace(/\D/g, ""),
            mesValidade: cardData.validade.slice(0, 2),
            anoValidade:
              "20" + cardData.validade.slice(3),
            codigoSeguranca: cardData.cvv,
          }),
        }
      )

      const precapturaData =
        await precapturaResp.json()

      console.log(
        "🟢 [FRONT] RESPOSTA PRÉ-CAPTURA:",
        precapturaData
      )

      if (!precapturaResp.ok) {
        throw new Error(
          precapturaData?.error ||
          "Erro na pré-captura"
        )
      }

      /**
       * ==========================================================
       * CAPTURA
       * ==========================================================
       */
      setPaymentStep("capturing")

      console.log(
        "🟡 [FRONT] Iniciando CAPTURA",
        order.numeroPedido
      )

      const capturaResp = await fetch(
        "/api/bndes/pedido-captura",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pedido: order.numeroPedido,
          }),
        }
      )

      const capturaData =
        await capturaResp.json()

      console.log(
        "🟢 [FRONT] RESPOSTA CAPTURA:",
        capturaData
      )

      if (!capturaResp.ok) {
        throw new Error(
          capturaData?.error ||
          "Erro na captura"
        )
      }

      /**
       * ==========================================================
       * SUCESSO
       * ==========================================================
       */
      setPaymentStep("success")

      const realReceipt: PaymentReceipt = {
        numeroPedido: order.numeroPedido,
        valor: parcelamento.valorTotal,
        parcelas:
          parcelamento.quantidadeParcelas,
        data: new Date().toISOString(),
        autorizacao:
          capturaData?.numeroAutorizacao ||
          capturaData?.autorizacao ||
          "Autorizado",
      }

      setReceipt(realReceipt)

      setTimeout(() => {
        setIsPaymentModalOpen(false)
        setCurrentStep("success")
      }, 1200)

    } catch (error: any) {
      console.error(
        "❌ [FRONT] ERRO NO PAGAMENTO:",
        error
      )

      setPaymentStep("error")

      setTimeout(() => {
        setIsPaymentModalOpen(false)
      }, 2000)
    } finally {
      setIsProcessing(false)
    }
  }

  /**
   * ===========================================================================
   * 5️⃣ Novo pagamento
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
   * RENDER
   * ===========================================================================
   */
  switch (currentStep) {
    case "search":
      return (
        <OrderSearch
          onOrderFound={handleOrderFound}
        />
      )

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
            onClose={() =>
              setIsAuthModalOpen(false)
            }
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
      return (
        <OrderSearch
          onOrderFound={handleOrderFound}
        />
      )
  }
}
