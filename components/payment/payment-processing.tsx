"use client"

/**
 * =============================================================================
 * COMPONENTE: PROCESSAMENTO DE PAGAMENTO
 * =============================================================================
 * 
 * Responsabilidade: Exibir tela de loading com etapas do processamento
 * enquanto o pagamento esta sendo efetuado.
 * 
 * Etapas:
 * 1. Iniciando transacao de pagamento (2s)
 * 2. Efetuando pagamento (3s)
 * 3. Gerando comprovante de pagamento (2s)
 * =============================================================================
 */

import { useEffect, useState } from "react"
import { Loader2, CheckCircle2, Circle } from "lucide-react"
import type { PaymentProcessingStep } from "@/types/payment"
import { cn } from "@/lib/utils"

interface PaymentProcessingProps {
  currentStep: PaymentProcessingStep
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
  const stepOrder: PaymentProcessingStep[] = ["initiating", "processing", "generating"]
  const currentIndex = stepOrder.indexOf(currentStep)
  const stepIndex = stepOrder.indexOf(stepId)

  if (stepIndex < currentIndex) return "completed"
  if (stepIndex === currentIndex) return "current"
  return "pending"
}

export function PaymentProcessing({ currentStep }: PaymentProcessingProps) {
  const [dots, setDots] = useState("")

  // Animacao de pontos
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."))
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in-0 duration-300">
      {/* Spinner principal */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full border-4 border-muted" />
        <div 
          className="absolute inset-0 w-24 h-24 rounded-full border-4 border-primary border-t-transparent animate-spin"
          aria-hidden="true"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" aria-hidden="true" />
        </div>
      </div>

      {/* Titulo */}
      <h2 className="text-2xl font-bold text-foreground mb-2">
        Processando Pagamento{dots}
      </h2>
      <p className="text-muted-foreground mb-8">
        Aguarde enquanto processamos sua transacao
      </p>

      {/* Lista de etapas */}
      <div className="w-full max-w-md space-y-4" role="status" aria-live="polite">
        {steps.map((step) => {
          const status = getStepStatus(step.id, currentStep)
          
          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-lg transition-all duration-300",
                status === "current" && "bg-primary/10 border border-primary/20",
                status === "completed" && "bg-secondary/10",
                status === "pending" && "opacity-50"
              )}
            >
              {/* Icone de status */}
              <div className="flex-shrink-0">
                {status === "completed" && (
                  <CheckCircle2 
                    className="w-6 h-6 text-secondary animate-in zoom-in-0 duration-200" 
                    aria-hidden="true"
                  />
                )}
                {status === "current" && (
                  <Loader2 
                    className="w-6 h-6 text-primary animate-spin" 
                    aria-hidden="true"
                  />
                )}
                {status === "pending" && (
                  <Circle 
                    className="w-6 h-6 text-muted-foreground" 
                    aria-hidden="true"
                  />
                )}
              </div>

              {/* Label da etapa */}
              <span
                className={cn(
                  "font-medium",
                  status === "current" && "text-primary",
                  status === "completed" && "text-secondary",
                  status === "pending" && "text-muted-foreground"
                )}
              >
                {step.label}
                {status === "current" && (
                  <span className="sr-only"> - em andamento</span>
                )}
                {status === "completed" && (
                  <span className="sr-only"> - concluido</span>
                )}
              </span>
            </div>
          )
        })}
      </div>

      {/* Aviso */}
      <p className="text-xs text-muted-foreground mt-8 text-center">
        Nao feche esta pagina durante o processamento
      </p>
    </div>
  )
}
