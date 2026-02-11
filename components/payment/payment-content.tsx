"use client"

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

  const [isAuthModalOpen, setIsAuthModalOpen] =
    useState(false)

  const [isPaymentModalOpen, setIsPaymentModalOpen] =
    useState(false)

  const [paymentStep, setPaymentStep] =
    useState<BndesPaymentStep>("precapturing")

  const [isProcessing, setIsProcessing] =
    useState(false)

  function handleOrderFound(foundOrder: Order) {
    setOrder(foundOrder)
    setCurrentStep("checkout")
  }

  function handleBackToSearch() {
    setOrder(null)
    setParcelamento(null)
    setCardData(null)
    setCurrentStep("search")
  }

  function handleProceedToPayment(
    selectedParcelamento: InstallmentOption,
    card: CardData
  ) {
    setParcelamento(selectedParcelamento)
    setCardData(card)
    setIsAuthModalOpen(true)
  }

  async function handleAuthorized() {
    if (isProcessing) return
    setIsProcessing(true)

    setIsAuthModalOpen(false)
    setIsPaymentModalOpen(true)

    if (!order || !parcelamento || !cardData) {
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

      if (!capturaResp.ok) {
        throw new Error(
          capturaData?.error ||
          "Erro na captura"
        )
      }

      /**
       * ==========================================================
       * VALIDAÇÃO FINAL
       * ==========================================================
       */
      if (capturaData?.situacao !== 40) {
        throw new Error(
          "Pagamento não foi capturado com sucesso"
        )
      }

      /**
       * ==========================================================
       * MONTAGEM DO RECEIPT REAL
       * ==========================================================
       */
      const realReceipt: PaymentReceipt = {
        numeroPedidoInterno: order.numeroPedido,
        numeroPedidoBndes: order.numeroPedido,

        valorOriginal:
          parcelamento.valorTotal -
          parcelamento.valorJuros,

        juros: parcelamento.valorJuros,
        valorTotal: parcelamento.valorTotal,
        parcelas: parcelamento.parcelas,
        valorParcela: parcelamento.valorParcela,

        numeroAutorizacao:
          precapturaData.numeroAutorizacao,

        tid: precapturaData.tid,

        situacao: capturaData.situacao,
        descricao: capturaData.descricao,
        dataHoraCaptura:
          capturaData.dataHoraCaptura,
      }

      setReceipt(realReceipt)
      setPaymentStep("success")

      setTimeout(() => {
        setIsPaymentModalOpen(false)
        setCurrentStep("success")
      }, 1200)

    } catch (error: any) {
      console.error(
        "❌ ERRO NO PAGAMENTO:",
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

  function handleNewPayment() {
    setOrder(null)
    setParcelamento(null)
    setCardData(null)
    setReceipt(null)
    setCurrentStep("search")
  }

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
