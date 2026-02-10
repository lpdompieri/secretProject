"use client"

import { useEffect, useState } from "react"
import { Loader2, CheckCircle2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import type {
  PaymentProcessingStep,
  PaymentReceipt,
  InstallmentOption,
  CardData,
} from "@/types/payment"

interface PaymentProcessingProps {
  numeroPedidoBndes: string
  orderNumeroSistema: string
  parcelamento: InstallmentOption
  cardData: CardData
  onSuccess: (receipt: PaymentReceipt) => void
  onError: (message: string) => void
}

interface StepInfo {
  id: PaymentProcessingStep
  label: string
}

const steps: StepInfo[] = [
  { id: "initiating", label: "Iniciando transacao de pagamento" },
  { id: "processing", label: "Efetuando pagamento" },
  { id: "generating", label: "Gerando comprovante de pagamento" },
]

function getStepStatus(
  stepId: PaymentProcessingStep,
  currentStep: PaymentProcessingStep
): "completed" | "current" | "pending" {
  const order: PaymentProcessingStep[] = [
    "initiating",
    "processing",
    "generating",
  ]
  const currentIndex = order.indexOf(currentStep)
  const stepIndex = order.indexOf(stepId)

  if (stepIndex < currentIndex) return "completed"
  if (stepIndex === currentIndex) return "current"
  return "pending"
}

export function PaymentProcessing({
  numeroPedidoBndes,
  orderNumeroSistema,
  parcelamento,
  cardData,
  onSuccess,
  onError,
}: PaymentProcessingProps) {
  const [currentStep, setCurrentStep] =
    useState<PaymentProcessingStep>("initiating")

  useEffect(() => {
    async function processar() {
      try {
        // ======================================================
        // 1️⃣ PRÉ-CAPTURA
        // ======================================================
        setCurrentStep("initiating")

        console.log("🟡 [BNDES] Iniciando PRÉ-CAPTURA")
        console.log("📤 Payload pré-captura:", {
          pedido: numeroPedidoBndes,
          numeroCartao: cardData.numero.replace(/\D/g, ""),
          mesValidade: cardData.validade.slice(0, 2),
          anoValidade: "20" + cardData.validade.slice(3),
          codigoSeguranca: cardData.cvv,
        })

        const precapturaResp = await fetch(
          "/api/bndes/pedido-precaptura",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              pedido: numeroPedidoBndes,
              numeroCartao: cardData.numero.replace(/\D/g, ""),
              mesValidade: cardData.validade.slice(0, 2),
              anoValidade: "20" + cardData.validade.slice(3),
              codigoSeguranca: cardData.cvv,
            }),
          }
        )

        if (!precapturaResp.ok) {
          throw new Error("Erro na pré-captura do pagamento")
        }

        const precaptura = await precapturaResp.json()

        console.log("✅ [BNDES] PRÉ-CAPTURA REALIZADA COM SUCESSO")
        console.log("📥 Resposta pré-captura BNDES:", precaptura)

        // ======================================================
        // 2️⃣ CAPTURA
        // ======================================================
        setCurrentStep("processing")

        console.log("🟡 [BNDES] Iniciando CAPTURA")
        console.log("📤 Payload captura:", {
          pedido: numeroPedidoBndes,
        })

        const capturaResp = await fetch(
          "/api/bndes/pedido-captura",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              pedido: numeroPedidoBndes,
            }),
          }
        )

        if (!capturaResp.ok) {
          throw new Error("Erro na captura do pagamento")
        }

        const captura = await capturaResp.json()

        console.log("✅ [BNDES] CAPTURA REALIZADA COM SUCESSO")
        console.log("📥 Resposta captura BNDES:", captura)

        // ======================================================
        // 3️⃣ GERAR COMPROVANTE
        // ======================================================
        setCurrentStep("generating")

        console.log("🟢 [SISTEMA] Gerando comprovante de pagamento")

        const agora = new Date()

        const valorJuros = parcelamento.valorJuros ?? 0
        const valorParcela = parcelamento.valorParcela ?? 0
        const valorTotal = parcelamento.valorTotal ?? 0
        const valorOriginal = valorTotal - valorJuros

        const receipt: PaymentReceipt = {
          status: "approved",
          numeroTransacao: precaptura.tid,
          numeroPedido: numeroPedidoBndes,
          data: agora.toLocaleDateString("pt-BR"),
          hora: agora.toLocaleTimeString("pt-BR"),
          valorOriginal,
          juros: valorJuros,
          valorTotal,
          parcelas: parcelamento.parcelas,
          valorParcela,
          cliente: {
            nome: "Cliente BNDES",
            cnpj: captura.cnpjAdquirente,
          },
          autorizacao: {
            codigo: precaptura.numeroAutorizacao,
          },
          pedidoSistema: orderNumeroSistema,
        }

        console.log("📄 [SISTEMA] COMPROVANTE FINAL GERADO")
        console.log("🧾 PaymentReceipt:", receipt)

        onSuccess(receipt)
      } catch (err: any) {
        console.error("❌ [ERRO PAGAMENTO]", err)
        onError(err.message || "Erro ao processar pagamento")
      }
    }

    processar()
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h2 className="text-2xl font-bold mb-6">
        Processando Pagamento
      </h2>

      <div className="w-full max-w-md space-y-4">
        {steps.map((step) => {
          const status = getStepStatus(step.id, currentStep)

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-lg transition-all",
                status === "current" && "bg-primary/10",
                status === "completed" && "bg-secondary/10",
                status === "pending" && "opacity-50"
              )}
            >
              {status === "completed" && (
                <CheckCircle2 className="text-secondary" />
              )}
              {status === "current" && (
                <Loader2 className="animate-spin text-primary" />
              )}
              {status === "pending" && (
                <Circle className="text-muted-foreground" />
              )}

              <span>{step.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
