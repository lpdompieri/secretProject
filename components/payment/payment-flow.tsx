"use client"

import { useState } from "react"

import { PaymentCheckout } from "./payment-checkout"
import { ManagerAuthModal } from "./manager-auth-modal"
import { PaymentProcessing } from "./payment-processing"
import { PaymentSuccess } from "./payment-success"

import type {
  Order,
  InstallmentOption,
  CardData,
  PaymentProcessingStep,
  PaymentReceipt,
} from "@/types/payment"

// =============================================================================
// COMPONENTE PRINCIPAL DO FLUXO DE PAGAMENTO
// =============================================================================

type Step =
  | "checkout"
  | "manager-auth"
  | "processing"
  | "success"

interface Props {
  order: Order
}

export function PaymentFlow({ order }: Props) {
  const [step, setStep] = useState<Step>("checkout")

  // Dados vindos do checkout
  const [parcelamento, setParcelamento] =
    useState<InstallmentOption | null>(null)
  const [cardData, setCardData] =
    useState<CardData | null>(null)
  const [numeroPedidoBndes, setNumeroPedidoBndes] =
    useState<string | null>(null)

  // Autorização gerente
  const [codigoGerente, setCodigoGerente] =
    useState<string | null>(null)
  const [nomeGerente, setNomeGerente] =
    useState<string | undefined>(undefined)

  // Processamento
  const [processingStep, setProcessingStep] =
    useState<PaymentProcessingStep>("initiating")

  // Resultado final
  const [receipt, setReceipt] =
    useState<PaymentReceipt | null>(null)

  // =============================================================================
  // CALLBACK DO CHECKOUT
  // =============================================================================

  function handleCheckoutProceed(payload: {
    parcelamento: InstallmentOption
    cardData: CardData
    numeroPedidoBndes: string
  }) {
    setParcelamento(payload.parcelamento)
    setCardData(payload.cardData)
    setNumeroPedidoBndes(payload.numeroPedidoBndes)

    setStep("manager-auth")
  }

  // =============================================================================
  // AUTORIZAÇÃO GERENTE
  // =============================================================================

  async function handleAuthorized(
    codigo: string,
    managerName?: string
  ) {
    setCodigoGerente(codigo)
    setNomeGerente(managerName)

    setStep("processing")
    await processPayment()
  }

  // =============================================================================
  // PROCESSAMENTO DE PAGAMENTO
  // =============================================================================

  async function processPayment() {
    if (!parcelamento || !cardData || !numeroPedidoBndes) return

    try {
      // -----------------------------
      // ETAPA 1 - PRÉ CAPTURA
      // -----------------------------
      setProcessingStep("initiating")

      const precaptura = await fetch(
        "/api/bndes/pedido-precaptura",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pedido: numeroPedidoBndes,
            numeroCartao: cardData.numero.replace(/\D/g, ""),
            mesValidade: cardData.validade.slice(0, 2),
            anoValidade: `20${cardData.validade.slice(3, 5)}`,
            codigoSeguranca: cardData.cvv,
          }),
        }
      )

      if (!precaptura.ok)
        throw new Error("Erro na pré-captura")

      const precapturaResp = await precaptura.json()

      // -----------------------------
      // ETAPA 2 - CAPTURA
      // -----------------------------
      setProcessingStep("processing")

      const captura = await fetch(
        "/api/bndes/pedido-captura",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pedido: numeroPedidoBndes,
          }),
        }
      )

      if (!captura.ok)
        throw new Error("Erro na captura")

      const capturaResp = await captura.json()

      // -----------------------------
      // ETAPA 3 - MONTAGEM DO COMPROVANTE
      // -----------------------------
      setProcessingStep("generating")

      const agora = new Date()

      const receiptFinal: PaymentReceipt = {
        status: "approved",
        numeroTransacao: precapturaResp.tid,
        numeroPedido: order.numeroPedido,
        numeroPedidoBndes,
        data: agora.toLocaleDateString("pt-BR"),
        hora: agora.toLocaleTimeString("pt-BR"),
        cliente: {
          nome: order.cliente.nome,
          cnpj: order.cliente.cnpj,
        },
        valorOriginal: order.valorBase,
        juros: parcelamento.valorJuros,
        valorTotal: parcelamento.valorTotal,
        parcelas: parcelamento.parcelas,
        valorParcela: parcelamento.valorParcela,
        autorizacao: {
          codigo: precapturaResp.numeroAutorizacao,
          gerente: nomeGerente,
          cnpjAdquirente: precapturaResp.cnpjAdquirente,
        },
      }

      setReceipt(receiptFinal)
      setStep("success")
    } catch (err) {
      console.error(err)
      // aqui você pode mandar pra tela de erro se quiser
    }
  }

  // =============================================================================
  // RENDER
  // =============================================================================

  if (step === "checkout") {
    return (
      <PaymentCheckout
        order={order}
        onBack={() => {}}
        onProceed={handleCheckoutProceed}
      />
    )
  }

  if (step === "manager-auth") {
    return (
      <ManagerAuthModal
        isOpen
        onClose={() => setStep("checkout")}
        onAuthorized={handleAuthorized}
      />
    )
  }

  if (step === "processing") {
    return (
      <PaymentProcessing currentStep={processingStep} />
    )
  }

  if (step === "success" && receipt) {
    return (
      <PaymentSuccess
        receipt={receipt}
        onNewPayment={() => setStep("checkout")}
      />
    )
  }

  return null
}
