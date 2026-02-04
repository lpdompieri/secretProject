"use client"

/**
 * =============================================================================
 * COMPONENTE: CHECKOUT DE PAGAMENTO
 * =============================================================================
 * 
 * Responsabilidade: Exibir resumo do pedido, opcoes de parcelamento,
 * dados do cartao BNDES e calcular valores com juros.
 * 
 * Logica de Juros:
 * - 1x: 0% de juros (a vista)
 * - 2x a 36x: (N-1) * 5% de juros sobre o valor base
 * - Exemplo 12x: 11 * 5% = 55% de juros
 * 
 * INTEGRACAO FUTURA:
 * 1. Gateway de Pagamento: Tokenizacao do cartao
 * 2. Sistema Antifraude: Validacao de transacao
 * 3. Autorizacao BNDES: Confirmacao com o banco
 * =============================================================================
 */

import { useState, useMemo, useCallback } from "react"
import { ArrowLeft, CreditCard, Calculator, Receipt, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { gerarOpcoesParcelamento } from "@/services/payment-service"
import { CardInputForm } from "./card-input-form"
import type { Order, InstallmentOption, CardData, CardValidationErrors, PaymentPayload } from "@/types/payment"
import { cn } from "@/lib/utils"

interface PaymentCheckoutProps {
  order: Order
  onBack: () => void
  onProceed: (parcelamento: InstallmentOption, cardData: CardData) => void
}

/**
 * Formata valor em reais
 */
function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

// =============================================================================
// FUNCOES DE VALIDACAO
// =============================================================================

/**
 * Valida numero do cartao (16 digitos)
 */
function validateCardNumber(numero: string): string | undefined {
  const digits = numero.replace(/\D/g, "")
  if (!digits) return "Numero do cartao e obrigatorio"
  if (digits.length !== 16) return "Numero do cartao deve ter 16 digitos"
  return undefined
}

/**
 * Valida nome do titular
 */
function validateCardHolder(nome: string): string | undefined {
  if (!nome.trim()) return "Nome do titular e obrigatorio"
  if (nome.trim().length < 3) return "Nome muito curto"
  return undefined
}

/**
 * Valida data de validade (MM/AA)
 */
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

/**
 * Valida CVV (3 digitos)
 */
function validateCVV(cvv: string): string | undefined {
  if (!cvv) return "CVV e obrigatorio"
  if (cvv.length !== 3) return "CVV deve ter 3 digitos"
  return undefined
}

/**
 * Valida CPF (11 digitos)
 */
function validateCPF(cpf: string): string | undefined {
  const digits = cpf.replace(/\D/g, "")
  if (!digits) return "CPF e obrigatorio"
  if (digits.length !== 11) return "CPF deve ter 11 digitos"
  
  // Validacao basica de CPF (todos digitos iguais)
  if (/^(\d)\1+$/.test(digits)) return "CPF invalido"
  
  return undefined
}

/**
 * Valida todos os campos do cartao
 */
function validateCardData(cardData: CardData): CardValidationErrors {
  return {
    numero: validateCardNumber(cardData.numero),
    nomeTitular: validateCardHolder(cardData.nomeTitular),
    validade: validateExpiry(cardData.validade),
    cvv: validateCVV(cardData.cvv),
    cpfTitular: validateCPF(cardData.cpfTitular),
  }
}

/**
 * Verifica se existem erros de validacao
 */
function hasValidationErrors(errors: CardValidationErrors): boolean {
  return Object.values(errors).some((error) => error !== undefined)
}

// =============================================================================
// FUNCOES DE INTEGRACAO (PREPARADAS PARA BACKEND)
// =============================================================================

/**
 * Prepara o payload para envio ao backend
 * 
 * INTEGRACAO:
 * Esta funcao prepara os dados para processamento. Em producao,
 * o cartao deve ser tokenizado ANTES de enviar ao backend.
 * 
 * @param cardData - Dados do cartao
 * @param order - Dados do pedido
 * @param parcelamento - Opcao de parcelamento selecionada
 * @param codigoAutorizacao - Codigo do gerente
 */
async function preparePaymentPayload(
  cardData: CardData,
  order: Order,
  parcelamento: InstallmentOption,
  codigoAutorizacao: string
): Promise<PaymentPayload> {
  
  // === TOKENIZACAO DO CARTAO ===
  // Em producao, o cartao deve ser tokenizado pelo gateway
  // para nao trafegar dados sensiveis
  
  /*
  // === INTEGRACAO REAL: GATEWAY DE PAGAMENTO ===
  // Exemplo com gateway hipotetico
  
  const tokenResponse = await fetch("https://gateway.exemplo.com/tokenize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GATEWAY_PUBLIC_KEY}`,
    },
    body: JSON.stringify({
      card_number: cardData.numero.replace(/\s/g, ""),
      holder_name: cardData.nomeTitular,
      expiration_month: cardData.validade.split("/")[0],
      expiration_year: `20${cardData.validade.split("/")[1]}`,
      cvv: cardData.cvv,
    }),
  })
  
  const tokenData = await tokenResponse.json()
  const cardToken = tokenData.token
  */
  // === FIM INTEGRACAO REAL ===

  // === MOCK: SIMULA TOKENIZACAO ===
  const cardToken = `tok_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  // === FIM MOCK ===

  return {
    cardToken,
    numeroPedido: order.numeroPedido,
    parcelas: parcelamento.parcelas,
    valorTotal: parcelamento.valorTotal,
    codigoAutorizacao,
  }
}

/**
 * Envia pagamento para processamento
 * 
 * ENDPOINTS DE INTEGRACAO:
 * - POST /api/payments/bndes - Processar pagamento
 * - Gateway: Autorizar transacao
 * - Antifraude: Validar transacao
 */
async function submitPayment(payload: PaymentPayload): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  
  // === INTEGRACAO REAL COM API ===
  /*
  try {
    // 1. Validar com antifraude
    const antifraudResponse = await fetch("/api/payments/antifraud", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardToken: payload.cardToken,
        amount: payload.valorTotal,
        orderId: payload.numeroPedido,
      }),
    })
    
    if (!antifraudResponse.ok) {
      return { success: false, error: "Transacao bloqueada pelo sistema de seguranca" }
    }
    
    // 2. Processar pagamento BNDES
    const paymentResponse = await fetch("/api/payments/bndes", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    })
    
    const result = await paymentResponse.json()
    
    if (!paymentResponse.ok) {
      return { success: false, error: result.message || "Erro ao processar pagamento" }
    }
    
    return { success: true, transactionId: result.transactionId }
    
  } catch (error) {
    console.error("Erro ao processar pagamento:", error)
    return { success: false, error: "Erro de conexao com o servidor" }
  }
  */
  // === FIM INTEGRACAO REAL ===

  // === MOCK ===
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, transactionId: `TXN${Date.now()}` })
    }, 1000)
  })
  // === FIM MOCK ===
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export function PaymentCheckout({ order, onBack, onProceed }: PaymentCheckoutProps) {
  const [parcelasSelecionadas, setParcelasSelecionadas] = useState<number>(1)
  const [cardData, setCardData] = useState<CardData>({
    numero: "",
    nomeTitular: "",
    validade: "",
    cvv: "",
    cpfTitular: "",
  })
  const [cardErrors, setCardErrors] = useState<CardValidationErrors>({})
  const [formError, setFormError] = useState<string | null>(null)

  // Gerar todas as opcoes de parcelamento
  const opcoesParcelamento = useMemo(
    () => gerarOpcoesParcelamento(order.valorBase),
    [order.valorBase]
  )

  // Obter parcelamento selecionado
  const parcelamentoAtual = useMemo(
    () => opcoesParcelamento.find((op) => op.parcelas === parcelasSelecionadas) || opcoesParcelamento[0],
    [opcoesParcelamento, parcelasSelecionadas]
  )

  // Handler de mudanca nos dados do cartao
  const handleCardDataChange = useCallback((newCardData: CardData) => {
    setCardData(newCardData)
    // Limpar erro do campo que foi alterado
    setCardErrors((prev) => {
      const field = Object.keys(newCardData).find(
        (key) => newCardData[key as keyof CardData] !== cardData[key as keyof CardData]
      ) as keyof CardValidationErrors | undefined
      if (field) {
        return { ...prev, [field]: undefined }
      }
      return prev
    })
    setFormError(null)
  }, [cardData])

  // Validar formulario
  const validateForm = useCallback((): boolean => {
    const errors = validateCardData(cardData)
    setCardErrors(errors)
    return !hasValidationErrors(errors)
  }, [cardData])

  // Handler do botao de pagamento
  function handleProceed() {
    setFormError(null)
    
    if (!validateForm()) {
      setFormError("Preencha todos os campos do cartao corretamente")
      return
    }
    
    onProceed(parcelamentoAtual, cardData)
  }

  // Verificar se todos os campos estao preenchidos (para habilitar botao)
  const isFormFilled = useMemo(() => {
    return (
      cardData.numero.replace(/\D/g, "").length === 16 &&
      cardData.nomeTitular.trim().length >= 3 &&
      cardData.validade.length === 5 &&
      cardData.cvv.length === 3 &&
      cardData.cpfTitular.replace(/\D/g, "").length === 11
    )
  }, [cardData])

  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
      {/* Cabecalho com voltar */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          aria-label="Voltar para consulta"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
          <p className="text-muted-foreground">
            Pedido #{order.numeroPedido}
          </p>
        </div>
      </div>

      {/* Erro geral do formulario */}
      {formError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna esquerda: Resumo + Dados do Cartao */}
        <div className="lg:col-span-2 space-y-6">
          {/* Resumo do pedido */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-secondary" aria-hidden="true" />
                Resumo do Pedido
              </CardTitle>
              <CardDescription>
                Detalhes do pedido e itens inclusos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dados do cliente */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium text-foreground mb-2">Dados do Cliente</h3>
                <p className="text-sm text-muted-foreground">{order.cliente.nome}</p>
                <p className="text-sm text-muted-foreground">CNPJ: {order.cliente.cnpj}</p>
              </div>

              {/* Lista de itens */}
              <div>
                <h3 className="font-medium text-foreground mb-3">Itens do Pedido</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-medium">Produto</th>
                        <th className="text-center p-3 font-medium">Qtd</th>
                        <th className="text-right p-3 font-medium">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.itens.map((item) => (
                        <tr key={item.codigo} className="border-t">
                          <td className="p-3">
                            <div className="font-medium">{item.descricao}</div>
                            <div className="text-muted-foreground text-xs">
                              Cod: {item.codigo}
                            </div>
                          </td>
                          <td className="text-center p-3">{item.quantidade}</td>
                          <td className="text-right p-3 font-medium">
                            {formatCurrency(item.valorTotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Separator />

              {/* Valor base */}
              <div className="flex justify-between items-center text-lg">
                <span className="font-medium">Valor do Pedido</span>
                <span className="font-bold text-foreground">
                  {formatCurrency(order.valorBase)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Formulario de dados do cartao */}
          <CardInputForm
            cardData={cardData}
            onChange={handleCardDataChange}
            errors={cardErrors}
            onValidate={validateForm}
          />
        </div>

        {/* Coluna direita: Parcelamento e botao */}
        <div className="space-y-6">
          {/* Card de parcelamento */}
          <Card className="h-fit sticky top-4">
            <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" aria-hidden="true" />
                Cartao BNDES
              </CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Selecione o parcelamento
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Seletor de parcelas */}
              <div className="space-y-2">
                <Label htmlFor="parcelas">Numero de Parcelas</Label>
                <Select
                  value={parcelasSelecionadas.toString()}
                  onValueChange={(value) => setParcelasSelecionadas(Number(value))}
                >
                  <SelectTrigger id="parcelas">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {opcoesParcelamento.map((opcao) => (
                      <SelectItem 
                        key={opcao.parcelas} 
                        value={opcao.parcelas.toString()}
                      >
                        {opcao.parcelas}x de {formatCurrency(opcao.valorParcela)}
                        {opcao.taxaJuros > 0 && (
                          <span className="text-muted-foreground ml-1">
                            ({opcao.taxaJuros.toFixed(0)}% juros)
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Resumo financeiro */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Calculator className="h-4 w-4 text-secondary" aria-hidden="true" />
                  Resumo Financeiro
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Valor original</span>
                  <span>{formatCurrency(order.valorBase)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Juros ({parcelamentoAtual.taxaJuros.toFixed(0)}%)
                  </span>
                  <span className={cn(
                    parcelamentoAtual.valorJuros > 0 ? "text-amber-600" : "text-secondary"
                  )}>
                    {parcelamentoAtual.valorJuros > 0 ? "+" : ""}
                    {formatCurrency(parcelamentoAtual.valorJuros)}
                  </span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Valor Total</span>
                  <span className="text-primary">
                    {formatCurrency(parcelamentoAtual.valorTotal)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Parcelas</span>
                  <span className="font-medium">
                    {parcelamentoAtual.parcelas}x de {formatCurrency(parcelamentoAtual.valorParcela)}
                  </span>
                </div>
              </div>

              {/* Botao de pagamento */}
              <Button
                onClick={handleProceed}
                className={cn(
                  "w-full text-secondary-foreground",
                  isFormFilled 
                    ? "bg-secondary hover:bg-secondary/90" 
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
                size="lg"
                disabled={!isFormFilled}
              >
                <CreditCard className="h-4 w-4 mr-2" aria-hidden="true" />
                Iniciar Pagamento
              </Button>

              {!isFormFilled && (
                <p className="text-xs text-center text-muted-foreground">
                  Preencha todos os dados do cartao para continuar
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
