"use client"

/**
 * =============================================================================
 * COMPONENTE: CHECKOUT DE PAGAMENTO
 * =============================================================================
 * 
 * Responsabilidade: Exibir resumo do pedido, opcoes de parcelamento,
 * dados do cartao BNDES e calcular valores com juros.
 * 
 * Parcelamento:
 * - Agora obtido via API BNDES
 * - Token (mock por enquanto)
 * =============================================================================
 */

import { useState, useMemo, useCallback, useEffect } from "react"
import {
  ArrowLeft,
  CreditCard,
  Calculator,
  Receipt,
  AlertCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
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
  PaymentPayload,
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
// VALIDACOES (inalteradas)
// =============================================================================

function validateCardNumber(numero: string): string | undefined {
  const digits = numero.replace(/\D/g, "")
  if (!digits) return "Numero do cartao e obrigatorio"
  if (digits.length !== 16) return "Numero do cartao deve ter 16 digitos"
  return undefined
}

function validateCardHolder(nome: string): string | undefined {
  if (!nome.trim()) return "Nome do titular e obrigatorio"
  if (nome.trim().length < 3) return "Nome muito curto"
  return undefined
}

function validateExpiry(validade: string): string | undefined {
  if (!validade) return "Validade e obrigatoria"
  const parts = validade.split("/")
  if (parts.length !== 2) return "Formato invalido (MM/AA)"

  const month = parseInt(parts[0], 10)
  const year = parseInt(parts[1], 10)

  if (month < 1 || month > 12) return "Mes invalido"

  const currentYear = new Date().getFullYear() % 100
  const currentMonth = new Date().getMonth() + 1

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return "Cartao vencido"
  }

  return undefined
}

function validateCVV(cvv: string): string | undefined {
  if (!cvv) return "CVV e obrigatorio"
  if (cvv.length !== 3) return "CVV deve ter 3 digitos"
  return undefined
}

function validateCPF(cpf: string): string | undefined {
  const digits = cpf.replace(/\D/g, "")
  if (!digits) return "CPF e obrigatorio"
  if (digits.length !== 11) return "CPF deve ter 11 digitos"
  if (/^(\d)\1+$/.test(digits)) return "CPF invalido"
  return undefined
}

function validateCardData(cardData: CardData): CardValidationErrors {
  return {
    numero: validateCardNumber(cardData.numero),
    nomeTitular: validateCardHolder(cardData.nomeTitular),
    validade: validateExpiry(cardData.validade),
    cvv: validateCVV(cardData.cvv),
    cpfTitular: validateCPF(cardData.cpfTitular),
  }
}

function hasValidationErrors(errors: CardValidationErrors): boolean {
  return Object.values(errors).some((error) => error !== undefined)
}

// =============================================================================
// TOKEN (mock temporario)
// =============================================================================

async function fetchBndesToken(): Promise<string> {
  // 🔐 Em breve: vir do backend
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
  const [parcelasSelecionadas, setParcelasSelecionadas] = useState<number>(1)
  const [opcoesParcelamento, setOpcoesParcelamento] = useState<
    InstallmentOption[]
  >([])
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
  // BUSCAR PARCELAMENTO BNDES
  // =============================================================================

  useEffect(() => {
    async function loadParcelamento() {
      try {
        setLoadingParcelamento(true)
        setParcelamentoError(null)

        const token = await fetchBndesToken()

        const response = await fetchBndesInstallments(token, {
          cnpj: order.cliente.cnpj,
          valorTotal: order.valorBase,
        })

        const adaptado: InstallmentOption[] = response.parcelas.map((p) => ({
          parcelas: p.numeroParcelas,
          valorParcela: p.valorParcela,
          valorTotal: p.valorTotal,
          taxaJuros: p.taxaJuros,
          valorJuros: p.valorTotal - order.valorBase,
        }))

        setOpcoesParcelamento(adaptado)
        setParcelasSelecionadas(adaptado[0]?.parcelas ?? 1)
      } catch (err) {
        console.error(err)
        setParcelamentoError("Erro ao consultar parcelamento no BNDES")
      } finally {
        setLoadingParcelamento(false)
      }
    }

    loadParcelamento()
  }, [order])

  // =============================================================================
  // DERIVADOS
  // =============================================================================

  const parcelamentoAtual = useMemo(
    () =>
      opcoesParcelamento.find(
        (op) => op.parcelas === parcelasSelecionadas
      ) || opcoesParcelamento[0],
    [opcoesParcelamento, parcelasSelecionadas]
  )

  const handleCardDataChange = useCallback(
    (newCardData: CardData) => {
      setCardData(newCardData)
      setFormError(null)
    },
    []
  )

  const validateForm = useCallback((): boolean => {
    const errors = validateCardData(cardData)
    setCardErrors(errors)
    return !hasValidationErrors(errors)
  }, [cardData])

  function handleProceed() {
    setFormError(null)

    if (!validateForm()) {
      setFormError("Preencha todos os dados do cartao corretamente")
      return
    }

    if (!parcelamentoAtual) return

    onProceed(parcelamentoAtual, cardData)
  }

  const isFormFilled = useMemo(() => {
    return (
      cardData.numero.replace(/\D/g, "").length === 16 &&
      cardData.nomeTitular.trim().length >= 3 &&
      cardData.validade.length === 5 &&
      cardData.cvv.length === 3 &&
      cardData.cpfTitular.replace(/\D/g, "").length === 11
    )
  }, [cardData])

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className="space-y-6">
      {/* Cabecalho */}
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
        {/* Coluna esquerda */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Resumo do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between font-bold">
                <span>Valor do Pedido</span>
                <span>{formatCurrency(order.valorBase)}</span>
              </div>
            </CardContent>
          </Card>

          <CardInputForm
            cardData={cardData}
            onChange={handleCardDataChange}
            errors={cardErrors}
            onValidate={validateForm}
          />
        </div>

        {/* Coluna direita */}
        <Card className="h-fit">
          <CardHeader className="bg-primary text-primary-foreground">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Cartao BNDES
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
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
                    {opcoesParcelamento.map((opcao) => (
                      <SelectItem
                        key={opcao.parcelas}
                        value={opcao.parcelas.toString()}
                      >
                        {opcao.parcelas}x de{" "}
                        {formatCurrency(opcao.valorParcela)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {parcelamentoAtual && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(parcelamentoAtual.valorTotal)}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {parcelamentoAtual.parcelas}x de{" "}
                  {formatCurrency(parcelamentoAtual.valorParcela)}
                </div>
              </div>
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
