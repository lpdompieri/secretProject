"use client"

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
import { BndesProcessModal } from "./bndes-process-modal"

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
// COMPONENTES
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

  // MODAL BNDES
  const [showModal, setShowModal] = useState(false)
  const [bndesStep, setBndesStep] =
    useState<"creating" | "finalizing" | "error">("creating")
  const [numeroPedidoBndes, setNumeroPedidoBndes] =
    useState<string | null>(null)
  const [bndesError, setBndesError] = useState<string | null>(null)

  // =============================================================================
  // PARCELAMENTO
  // =============================================================================

  useEffect(() => {
    async function loadParcelamento() {
      try {
        setLoadingParcelamento(true)
        setParcelamentoError(null)

        const resp = await fetch(
          `/api/bndes/parcelamento?valor=${order.valorBase}`
        )

        if (!resp.ok) throw new Error()

        const data = await resp.json()

        const adaptadas = data.formasPagamento.map((p: any) => {
          const total = p.valorParcela * p.prazo
          return {
            parcelas: p.prazo,
            valorParcela: p.valorParcela,
            valorTotal: total,
            taxaJuros: data.taxa,
            valorJuros: total - order.valorBase,
          }
        })

        adaptadas.sort((a: any, b: any) => a.parcelas - b.parcelas)
        setOpcoesParcelamento(adaptadas)
        setParcelasSelecionadas(adaptadas[0]?.parcelas ?? 1)
      } catch {
        setParcelamentoError("Erro ao consultar parcelamento BNDES")
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

    if (hasValidationErrors(errors) || !parcelamentoAtual) {
      setFormError("Preencha os dados corretamente")
      return
    }

    try {
      setShowModal(true)
      setBndesStep("creating")
      setBndesError(null)

      const binCartao = cardData.numero
        .replace(/\D/g, "")
        .slice(0, 6)

      const criarResp = await fetch("/api/bndes/pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          binCartao,
          cpfCnpjComprador: "21882543000150",
        }),
      })

      let pedido: string | null = null
      const ct = criarResp.headers.get("content-type")

      if (ct?.includes("application/json")) {
        const json = await criarResp.json()
        pedido = json.numero || json.id || json.pedido || null
      } else {
        pedido = (await criarResp.text())?.trim()
      }

      if (!pedido) throw new Error("Pedido não retornado")

      setNumeroPedidoBndes(pedido)
      setBndesStep("finalizing")
      
console.log("🔥 PEDIDO QUE VOU USAR NO PUT:", pedido)
console.log("🔥 URL:", `/api/bndes/pedido/${pedido}`)
      
      const finalizar = await fetch(`/api/bndes/pedido/${pedido}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parcelas: parcelamentoAtual.parcelas,
          valorPagamento: order.valorBase,
          endereco: "Avenida Paulo Gracindo",
          numero: "100",
          bairro: "Gávea",
          municipio: "Uberlândia",
          uf: "MG",
          cep: "38411145",
          itens: [
            {
              produto: "7125",
              quantidade: 1,
              precoUnitario: order.valorBase,
            },
          ],
        }),
      })
      
      
      if (!finalizar.ok) throw new Error("Erro ao finalizar pedido")

      setShowModal(false)
      onProceed(parcelamentoAtual, cardData)
    } catch (err: any) {
      setBndesStep("error")
      setBndesError(err.message || "Erro no fluxo BNDES")
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
    <>
      <BndesProcessModal
        open={showModal}
        step={bndesStep}
        pedido={numeroPedidoBndes}
        error={bndesError}
      />

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

              {!loadingParcelamento && !parcelamentoError && (
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
                      {formatCurrency(parcelamentoAtual.valorTotal)}
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
    </>
  )
}
