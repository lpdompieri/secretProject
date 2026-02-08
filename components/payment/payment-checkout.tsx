"use client"

/**
 * =============================================================================
 * COMPONENTE: CHECKOUT DE PAGAMENTO – CARTÃO BNDES
 * =============================================================================
 * - Consulta parcelamento via API interna (/api/bndes/parcelamento)
 * - Client NÃO conhece token BNDES
 * - Fluxo:
 *   1) Simular parcelamento
 *   2) Selecionar parcelas
 *   3) Criar pedido BNDES
 *   4) Finalizar pedido
 * =============================================================================
 */

import { useState, useMemo, useCallback, useEffect } from "react"
import {
  ArrowLeft,
  CreditCard,
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
// VALIDAÇÕES
// =============================================================================

function validateCardData(cardData: CardData): CardValidationErrors {
  return {
    numero:
      cardData.numero.replace(/\D/g, "").length !== 16
        ? "Número do cartão inválido"
        : undefined,
    nomeTitular: !cardData.nomeTitular
      ? "Nome do titular obrigatório"
      : undefined,
    validade:
      cardData.validade.length !== 5
        ? "Validade inválida"
        : undefined,
    cvv:
      cardData.cvv.length !== 3
        ? "CVV inválido"
        : undefined,
    cpfTitular:
      cardData.cpfTitular.replace(/\D/g, "").length !== 11
        ? "CPF inválido"
        : undefined,
  }
}

function hasValidationErrors(errors: CardValidationErrors): boolean {
  return Object.values(errors).some(Boolean)
}

// =============================================================================
// COMPONENTE
// =============================================================================

interface PaymentCheckoutProps {
  order: Order
  onBack: () => void
  onProceed: (
    parcelamento: InstallmentOption,
    cardData: CardData
  ) => void
}

export function PaymentCheckout({
  order,
  onBack,
  onProceed,
}: PaymentCheckoutProps) {
  const [parcelasSelecionadas, setParcelasSelecionadas] = useState(1)
  const [opcoesParcelamento, setOpcoesParcelamento] =
    useState<InstallmentOption[]>([])
  const [loadingParcelamento, setLoadingParcelamento] = useState(false)
  const [parcelamentoError, setParcelamentoError] =
    useState<string | null>(null)

  const [cardData, setCardData] = useState<CardData>({
    numero: "",
    nomeTitular: "",
    validade: "",
    cvv: "",
    cpfTitular: "",
  })

  const [cardErrors, setCardErrors] =
    useState<CardValidationErrors>({})
  const [formError, setFormError] = useState<string | null>(null)

  // =============================================================================
  // CONSULTAR PARCELAMENTO (API INTERNA)
  // =============================================================================

  useEffect(() => {
    async function loadParcelamento() {
      try {
        console.log("[BNDES] Consultando parcelamento")

        setLoadingParcelamento(true)
        setParcelamentoError(null)

        const response = await fetch(
          `/api/bndes/parcelamento?valor=${order.valorBase}`
        )

        if (!response.ok) {
          throw new Error("Erro ao consultar parcelamento")
        }

        const data = await response.json()

        if (
          !data.formasPagamento ||
          !Array.isArray(data.formasPagamento)
        ) {
          throw new Error("Resposta de parcelamento inválida")
        }

        const parcelasAdaptadas: InstallmentOption[] =
          data.formasPagamento.map((p: any) => {
            const total = p.valorParcela * p.prazo

            return {
              parcelas: p.prazo,
              valorParcela: p.valorParcela,
              valorTotal: total,
              taxaJuros: data.taxa,
              valorJuros: total - order.valorBase,
            }
          })

        // 🔥 garante ordem crescente
        const ordenadas = parcelasAdaptadas.sort(
          (a, b) => a.parcelas - b.parcelas
        )

        setOpcoesParcelamento(ordenadas)
        setParcelasSelecionadas(ordenadas[0]?.parcelas ?? 1)
      } catch (err) {
        console.error("[BNDES] ERRO:", err)
        setParcelamentoError(
          "Erro ao consultar parcelamento no BNDES"
        )
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

  // =============================================================================
  // INICIAR PAGAMENTO
  // =============================================================================

  async function handleProceed() {
    const errors = validateCardData(cardData)
    setCardErrors(errors)

    if (hasValidationErrors(errors)) {
      setFormError("Preencha os dados do cartão corretamente")
      return
    }

    if (!parcelamentoAtual) return

    try {
      setFormError(null)

      const binCartao = cardData.numero
        .replace(/\D/g, "")
        .slice(0, 6)

      // 1️⃣ Criar pedido
      const criarPedidoResp = await fetch("/api/bndes/pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          binCartao,
          cpfCnpjComprador: "21882543000150", // mock
        }),
      })

      if (!criarPedidoResp.ok) {
        throw new Error("Erro ao criar pedido BNDES")
      }

      const pedidoBndes = await criarPedidoResp.json()
      const numeroPedido =
        pedidoBndes.numero ||
        pedidoBndes.id ||
        pedidoBndes.pedido

      if (!numeroPedido) {
        throw new Error("Número do pedido BNDES não retornado")
      }

      // 2️⃣ Finalizar pedido
      const finalizarResp = await fetch(
        `/api/bndes/pedido/${numeroPedido}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endereco: "Avenida Paulo Gracindo",
            numero: "100",
            bairro: "Gávea",
            municipio: "Uberlândia",
            uf: "MG",
            cep: "38411145",
            parcelas: parcelamentoAtual.parcelas,
            valorPagamento: Number(
              order.valorBase.toFixed(2)
            ),
            itens: [
              {
                produto: "7125",
                quantidade: 1,
                precoUnitario: Number(
                  order.valorBase.toFixed(2)
                ),
              },
            ],
          }),
        }
      )

      if (!finalizarResp.ok) {
        throw new Error("Erro ao finalizar pedido BNDES")
      }

      onProceed(parcelamentoAtual, cardData)
    } catch (err) {
      console.error(err)
      setFormError("Erro ao iniciar pagamento no BNDES")
    }
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
              Cartão BNDES
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <Label>Número de Parcelas</Label>

            {loadingParcelamento && (
              <p className="text-sm text-muted-foreground">
                Consultando parcelamento...
              </p>
            )}

            {parcelamentoError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {parcelamentoError}
                </AlertDescription>
              </Alert>
            )}

            {!loadingParcelamento &&
              !parcelamentoError && (
                <Select
                  value={parcelasSelecionadas.toString()}
                  onValueChange={(v) =>
                    setParcelasSelecionadas(Number(v))
                  }
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
                        {op.parcelas}x de{" "}
                        {formatCurrency(op.valorParcela)}
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
                  <span>
                    {formatCurrency(
                      parcelamentoAtual.valorTotal
                    )}
                  </span>
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
