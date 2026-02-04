"use client"

import React from "react"

/**
 * =============================================================================
 * COMPONENTE: MODAL DE AUTORIZACAO DO GERENTE
 * =============================================================================
 * 
 * Responsabilidade: Coletar codigo de autorizacao do gerente para
 * prosseguir com o pagamento.
 * 
 * Regras de negocio:
 * - Codigo valido (mock): "9989"
 * - Codigo invalido exibe mensagem de erro
 * - Modal bloqueia interacao com a tela de fundo
 * =============================================================================
 */

import { useState, useEffect, useRef } from "react"
import { ShieldCheck, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { validarAutorizacaoGerente } from "@/services/payment-service"
import { cn } from "@/lib/utils"

interface ManagerAuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthorized: (codigo: string, managerName?: string) => void
}

export function ManagerAuthModal({ isOpen, onClose, onAuthorized }: ManagerAuthModalProps) {
  const [codigo, setCodigo] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Focar no input quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      setCodigo("")
      setError(null)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Fechar com Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  // Bloquear scroll do body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!codigo.trim()) {
      setError("Digite o codigo de autorizacao")
      return
    }

    setIsValidating(true)
    setError(null)

    const result = await validarAutorizacaoGerente(codigo.trim())

    setIsValidating(false)

    if (result.valid) {
      onAuthorized(codigo, result.managerName)
    } else {
      setError(result.error || "Codigo invalido")
      inputRef.current?.select()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm animate-in fade-in-0 duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={cn(
          "relative z-10 w-full max-w-md mx-4 bg-card rounded-xl shadow-2xl",
          "animate-in fade-in-0 zoom-in-95 duration-200"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <h2 id="auth-modal-title" className="text-xl font-semibold text-foreground">
              Autorizacao do Gerente
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Fechar modal"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Para prosseguir com o pagamento, informe o codigo de autorizacao do gerente.
          </p>

          <div className="space-y-2">
            <Label htmlFor="auth-code">Codigo de Autorizacao</Label>
            <Input
              ref={inputRef}
              id="auth-code"
              type="password"
              placeholder="Digite o codigo"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              disabled={isValidating}
              aria-describedby={error ? "auth-error" : undefined}
              className="text-center text-lg tracking-widest"
            />
          </div>

          {error && (
            <Alert
              id="auth-error"
              variant="destructive"
              className="animate-in fade-in-0 slide-in-from-top-1"
              role="alert"
            >
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Info de teste */}
          <p className="text-xs text-muted-foreground text-center">
            Codigo de teste: <code className="bg-muted px-1 rounded">9989</code>
          </p>

          {/* Botoes */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isValidating}
              className="flex-1 bg-transparent"
            >
              Voltar
            </Button>
            <Button
              type="submit"
              disabled={isValidating}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isValidating ? (
                <>
                  <span className="animate-spin mr-2">
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  </span>
                  Validando...
                </>
              ) : (
                "Continuar"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
