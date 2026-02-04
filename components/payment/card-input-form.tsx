"use client"

import React from "react"

/**
 * =============================================================================
 * COMPONENTE: FORMULARIO DE DADOS DO CARTAO BNDES
 * =============================================================================
 * 
 * Responsabilidade: Captura dos dados do Cartao BNDES para pagamento.
 * Inclui mascaras de input, validacao e leitura por camera (mobile).
 * 
 * SEGURANCA:
 * - Dados sensiveis NUNCA sao persistidos
 * - Apenas estado local do React
 * - Preparado para tokenizacao futura (gateway de pagamento)
 * 
 * INTEGRACAO FUTURA:
 * - Tokenizacao via gateway (ex: Cielo, Stone, Rede)
 * - Sistema antifraude
 * - Autorizacao com o BNDES
 * =============================================================================
 */

import { useState, useCallback, useEffect } from "react"
import { CreditCard, Camera, User, Calendar, Lock, Award as IdCard, CheckCircle2, X, Smartphone } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { CardData, CardValidationErrors } from "@/types/payment"

interface CardInputFormProps {
  cardData: CardData
  onChange: (data: CardData) => void
  errors: CardValidationErrors
  onValidate: () => boolean
}

// =============================================================================
// FUNCOES DE MASCARA E FORMATACAO
// =============================================================================

/**
 * Aplica mascara de cartao de credito: 0000 0000 0000 0000
 */
function maskCardNumber(value: string): string {
  const numbers = value.replace(/\D/g, "").slice(0, 16)
  return numbers.replace(/(\d{4})(?=\d)/g, "$1 ").trim()
}

/**
 * Aplica mascara de validade: MM/AA
 */
function maskExpiry(value: string): string {
  const numbers = value.replace(/\D/g, "").slice(0, 4)
  if (numbers.length >= 2) {
    return `${numbers.slice(0, 2)}/${numbers.slice(2)}`
  }
  return numbers
}

/**
 * Aplica mascara de CVV: 000
 */
function maskCVV(value: string): string {
  return value.replace(/\D/g, "").slice(0, 3)
}

/**
 * Aplica mascara de CPF: 000.000.000-00
 */
function maskCPF(value: string): string {
  const numbers = value.replace(/\D/g, "").slice(0, 11)
  return numbers
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
}

/**
 * Remove formatacao e retorna apenas numeros
 */
function unmask(value: string): string {
  return value.replace(/\D/g, "")
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export function CardInputForm({ cardData, onChange, errors, onValidate }: CardInputFormProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [showCameraModal, setShowCameraModal] = useState(false)
  const [cameraStep, setCameraStep] = useState<"scanning" | "success">("scanning")

  // Detectar se e mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Handlers de mudanca com mascara
  const handleCardNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCardNumber(e.target.value)
    onChange({ ...cardData, numero: masked })
  }, [cardData, onChange])

  const handleExpiryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskExpiry(e.target.value)
    onChange({ ...cardData, validade: masked })
  }, [cardData, onChange])

  const handleCVVChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCVV(e.target.value)
    onChange({ ...cardData, cvv: masked })
  }, [cardData, onChange])

  const handleCPFChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCPF(e.target.value)
    onChange({ ...cardData, cpfTitular: masked })
  }, [cardData, onChange])

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...cardData, nomeTitular: e.target.value.toUpperCase() })
  }, [cardData, onChange])

  // Simular leitura por camera
  const handleCameraRead = useCallback(() => {
    setShowCameraModal(true)
    setCameraStep("scanning")

    // Simular tempo de leitura (3 segundos)
    setTimeout(() => {
      setCameraStep("success")
      
      // Preencher dados mockados apos "leitura"
      setTimeout(() => {
        onChange({
          ...cardData,
          numero: "5432 1098 7654 3210",
          nomeTitular: "JOSE DA SILVA",
          validade: "12/28",
        })
        setShowCameraModal(false)
      }, 1500)
    }, 3000)
  }, [cardData, onChange])

  return (
    <>
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardTitle className="flex items-center gap-2 text-primary">
            <CreditCard className="h-5 w-5" aria-hidden="true" />
            Dados do Cartao BNDES
          </CardTitle>
          <CardDescription>
            Preencha os dados do cartao para realizar o pagamento
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Botao de leitura por camera - apenas mobile */}
          {isMobile && (
            <Button
              type="button"
              variant="outline"
              className="w-full border-secondary text-secondary hover:bg-secondary/10 gap-2 bg-transparent"
              onClick={handleCameraRead}
            >
              <Camera className="h-5 w-5" aria-hidden="true" />
              <span>Ler cartao com a camera</span>
            </Button>
          )}

          {/* Texto explicativo mobile */}
          {isMobile && (
            <p className="text-xs text-muted-foreground text-center -mt-2">
              Posicione seu cartao dentro da area indicada para leitura automatica
            </p>
          )}

          {/* Campo: Numero do cartao */}
          <div className="space-y-2">
            <Label htmlFor="card-number" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Numero do Cartao
            </Label>
            <Input
              id="card-number"
              type="text"
              inputMode="numeric"
              placeholder="0000 0000 0000 0000"
              value={cardData.numero}
              onChange={handleCardNumberChange}
              className={cn(
                "font-mono text-lg tracking-wider",
                errors.numero && "border-destructive focus-visible:ring-destructive"
              )}
              aria-invalid={!!errors.numero}
              aria-describedby={errors.numero ? "card-number-error" : undefined}
            />
            {errors.numero && (
              <p id="card-number-error" className="text-sm text-destructive" role="alert">
                {errors.numero}
              </p>
            )}
          </div>

          {/* Campo: Nome do titular */}
          <div className="space-y-2">
            <Label htmlFor="card-holder" className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Nome do Titular
            </Label>
            <Input
              id="card-holder"
              type="text"
              placeholder="NOME COMO NO CARTAO"
              value={cardData.nomeTitular}
              onChange={handleNameChange}
              className={cn(
                "uppercase",
                errors.nomeTitular && "border-destructive focus-visible:ring-destructive"
              )}
              aria-invalid={!!errors.nomeTitular}
              aria-describedby={errors.nomeTitular ? "card-holder-error" : undefined}
            />
            {errors.nomeTitular && (
              <p id="card-holder-error" className="text-sm text-destructive" role="alert">
                {errors.nomeTitular}
              </p>
            )}
          </div>

          {/* Linha: Validade + CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="card-expiry" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                Validade
              </Label>
              <Input
                id="card-expiry"
                type="text"
                inputMode="numeric"
                placeholder="MM/AA"
                value={cardData.validade}
                onChange={handleExpiryChange}
                className={cn(
                  "font-mono",
                  errors.validade && "border-destructive focus-visible:ring-destructive"
                )}
                aria-invalid={!!errors.validade}
                aria-describedby={errors.validade ? "card-expiry-error" : undefined}
              />
              {errors.validade && (
                <p id="card-expiry-error" className="text-sm text-destructive" role="alert">
                  {errors.validade}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="card-cvv" className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                CVV
              </Label>
              <Input
                id="card-cvv"
                type="password"
                inputMode="numeric"
                placeholder="000"
                value={cardData.cvv}
                onChange={handleCVVChange}
                maxLength={3}
                className={cn(
                  "font-mono",
                  errors.cvv && "border-destructive focus-visible:ring-destructive"
                )}
                aria-invalid={!!errors.cvv}
                aria-describedby={errors.cvv ? "card-cvv-error" : undefined}
              />
              {errors.cvv && (
                <p id="card-cvv-error" className="text-sm text-destructive" role="alert">
                  {errors.cvv}
                </p>
              )}
            </div>
          </div>

          {/* Campo: CPF do titular */}
          <div className="space-y-2">
            <Label htmlFor="card-cpf" className="flex items-center gap-2">
              <IdCard className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              CPF do Titular
            </Label>
            <Input
              id="card-cpf"
              type="text"
              inputMode="numeric"
              placeholder="000.000.000-00"
              value={cardData.cpfTitular}
              onChange={handleCPFChange}
              className={cn(
                "font-mono",
                errors.cpfTitular && "border-destructive focus-visible:ring-destructive"
              )}
              aria-invalid={!!errors.cpfTitular}
              aria-describedby={errors.cpfTitular ? "card-cpf-error" : undefined}
            />
            {errors.cpfTitular && (
              <p id="card-cpf-error" className="text-sm text-destructive" role="alert">
                {errors.cpfTitular}
              </p>
            )}
          </div>

          {/* Aviso de seguranca */}
          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
            <Lock className="h-4 w-4 mt-0.5 text-secondary flex-shrink-0" aria-hidden="true" />
            <span>
              Seus dados estao protegidos. As informacoes do cartao sao criptografadas e
              nao sao armazenadas em nossos servidores.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Modal de leitura por camera (mobile) */}
      {showCameraModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="camera-modal-title"
        >
          <div className="bg-card rounded-2xl w-full max-w-sm overflow-hidden">
            {/* Header do modal */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 id="camera-modal-title" className="font-semibold text-foreground flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-secondary" aria-hidden="true" />
                Leitura do Cartao
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCameraModal(false)}
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Conteudo do modal */}
            <div className="p-6">
              {cameraStep === "scanning" ? (
                <div className="space-y-6">
                  {/* Area de "camera" simulada */}
                  <div className="relative aspect-[1.6/1] bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl border-2 border-dashed border-secondary/50 flex items-center justify-center overflow-hidden">
                    {/* Animacao de scan */}
                    <div className="absolute inset-0 bg-gradient-to-b from-secondary/20 to-transparent animate-pulse" />
                    
                    {/* Moldura de cartao */}
                    <div className="w-[80%] h-[80%] border-2 border-secondary rounded-lg flex items-center justify-center">
                      <CreditCard className="h-12 w-12 text-secondary/50 animate-pulse" aria-hidden="true" />
                    </div>
                    
                    {/* Linhas de scan */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-secondary animate-[scan_2s_ease-in-out_infinite]" />
                  </div>

                  <div className="text-center space-y-2">
                    <p className="font-medium text-foreground">Escaneando cartao...</p>
                    <p className="text-sm text-muted-foreground">
                      Posicione o cartao dentro da area marcada
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 text-center">
                  {/* Sucesso */}
                  <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center">
                      <CheckCircle2 className="h-10 w-10 text-secondary animate-in zoom-in-50" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-foreground">Dados capturados com sucesso!</p>
                    <p className="text-sm text-muted-foreground">
                      Preenchendo formulario automaticamente...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSS para animacao de scan */}
      <style jsx global>{`
        @keyframes scan {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(calc(100% * 1.6 - 4px)); }
        }
      `}</style>
    </>
  )
}
