"use client"

/**
 * =============================================================================
 * COMPONENTE: CHECKOUT DE PAGAMENTO
 * =============================================================================
 * 
 * Parcelamento:
 * - Obtido via API BNDES (GET simulacao/financiamento)
 * - Token mock por enquanto
 * =============================================================================
 */

import { useState, useMemo, useCallback, useEffect } from "react"
import {
  ArrowLeft,
  CreditCard,
  Receipt,
  AlertCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { CardInputForm } from "./card-input-form"
import type {
  Order,
  InstallmentOption,
  CardData,
  CardValidationErrors,
} from "@/types/payment"

import { cn } from "@/lib/utils"
import { fetchBndesInstallments } from "@/services/payment/bndes/bndes.installments"

// =============================================================================
// UTIL
// =============================================================================

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

// =============================================================================
// VALIDACOES
// =============================================================================

function validateCardData(cardData: CardData): CardValidationErrors {
  return {
    numero: cardData.numero.replace(/\D/g, "").length !== 16
      ? "Numero do cartao invalido"
      : undefined,
    nomeTitular: !cardData.nomeTitular ? "Nome obrigatorio" : undefined,
    validade: cardData.validade.length !== 5 ? "Validade invalida" : undefined,
    cvv: cardData.cvv.length !== 3 ? "CVV invalido" : undefined,
    cpfTitular:
      cardData.cpfTitular.replace(/\D/g, "").length !== 11
        ? "CPF invalido"
        : undefined,
  }
}

function hasValidationErrors(errors: CardValidationErrors): boolean {
  return Object.values(errors).some(Boolean)
}

// =============================================================================
// TOKEN (mock)
// =============================================================================

async function fetchBndesToken(): Promise<string> {
  return "TOKEN_BNDES_TESTE"
}

// =============================================================================
// COMPONENTE
// =============================================================================

interface PaymentCheckoutProps {
  order: Order
  onBack: () => void
  onProceed: (parcelamento: InstallmentOption, cardData: CardData) => void
}

export function PaymentCheckout({
  order,
  onBack,
  onProceed,
}: PaymentCheckoutProps) {
  const [parcelasSelecionadas, setParcelasSelecionadas] = useState(1)
  const [opcoesParcelamento, setOpcoesParcelamento] = useState<InstallmentOption[]>([])
  const [loadingParcelamento, setLoadingParcelamento] = useState(false)
  const [parcelamentoError, setParcelamentoError] = useState<string | null>(null)

  const [cardData, setCardData] = useState<CardData>({
    numero: "",
    nomeTitular: "",
    validade: "",
    cvv: "",
    cpfTitular: "",
  })

  const [cardErrors, setCardErrors] = useState<CardValidationErrors>({})
  const [formError, setFormError] = useState<string | null>(null)

  // =============================================================================
  // CONSULTAR PARCELAMENTO BNDES (GET)
  // =============================================================================

  useEffect(() => {
    async function loadParcelamento() {
      try {
        console.log("[BNDES] Consultando parcelamento")

        setLoadingParcelamento(true)
        setParcelamentoError(null)

        const token = await fetchBndesToken()

        const response = await fetchBndesInstallments(
          token,
          order.valorBase
        )

        console.log("[BNDES] Resposta:", response)

        const parcelasAdaptadas: InstallmentOption[] =
          response.parcelas.map((p: any) => ({
            parcelas: p.numeroParcelas,
            valorParcela: p.valorParcela,
            valorTotal: p.valorTotal,
            taxaJuros: p.taxaJuros,
            valorJuros: p.valorTotal - order.valorBase,
          }))

        setOpcoesParcelamento(parcelasAdaptadas)
        setParcelasSelecionadas(parcelasAdaptadas[0]?.parcelas ?? 1)
      } catch (error) {
        console.error("[BNDES] ERRO AO CONSULTAR PARCELAMENTO:", error)
        setParcelamentoError("Erro ao consultar parcelamento no BNDES")
      } finally {
        setLoadingParcelamento(false)
      }
    }

    loadParcelamento()
  }, [order.valorBase])

  const parcelamentoAtual = useMemo(
    () =>
      opcoesParcelamento.find(
        (p) => p.parcelas === parcelasSelecionadas
      ),
    [opcoesParcelamento, parcelasSelecionadas]
  )

  const handleCardDataChange = useCallback((data: CardData) => {
    setCardData(data)
    setFormError(null)
  }, [])

  function handleProceed() {
    const errors = validateCardData(cardData)
    setCardErrors(errors)

    if (hasValidationErrors(errors)) {
      setFormError("Preencha os dados do cartao corretamente")
      return
    }

    if (!parcelamentoAtual) return

    onProceed(parcelamentoAtual, cardData)
  }

  const isFormFilled =
    cardData.numero &&
    cardData.nomeTitular &&
    cardData.validade &&
    cardData.cvv &&
    cardData.cpfTitular

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-muted-foreground">
            Pedido #{order.numeroPedido}
          </p>
        </div>
      </div>

      {formError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatCurrency(order.valorBase)}</span>
            </CardContent>
          </Card>

          <CardInputForm
            cardData={cardData}
            onChange={handleCardDataChange}
            errors={cardErrors}
            onValidate={() => true}
          />
        </div>

        <Card>
          <CardHeader className="bg-primary text-primary-foreground">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Cartao BNDES
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <Label>Numero de Parcelas</Label>

            {loadingParcelamento && (
              <p className="text-sm text-muted-foreground">
                Consultando parcelamento...
              </p>
            )}

            {parcelamentoError && (
              <Alert variant="destructive">
                <AlertDescription>{parcelamentoError}</AlertDescription>
              </Alert>
            )}

            {!loadingParcelamento && !parcelamentoError && (
              <Select
                value={parcelasSelecionadas.toString()}
                onValueChange={(v) => setParcelasSelecionadas(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {opcoesParcelamento.map((op) => (
                    <SelectItem
                      key={op.parcelas}
                      value={op.parcelas.toString()}
                    >
                      {op.parcelas}x de {formatCurrency(op.valorParcela)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {parcelamentoAtual && (
              <>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(parcelamentoAtual.valorTotal)}</span>
                </div>
              </>
            )}

            <Button
              onClick={handleProceed}
              disabled={!isFormFilled}
              className={cn(
                "w-full",
                isFormFilled
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              Iniciar Pagamento
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
