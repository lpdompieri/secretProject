"use client"

import React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Upload, FileText, CheckCircle2, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"

// Constante para URL da API - ajuste conforme seu backend
const API_URL = "/api/products"

interface ProductRegisterProps {
  onBack: () => void
}

type RegisterMode = "manual" | "csv"
type RegisterStep = "form" | "processing" | "success"

interface ProcessingStep {
  label: string
  duration: number
  completed: boolean
  active: boolean
}

const PROCESSING_STEPS: Omit<ProcessingStep, "completed" | "active">[] = [
  { label: "Validando dados informados", duration: 2000 },
  { label: "Salvando dados na base de dados", duration: 3000 },
  { label: "Verificando se o produto esta habilitado no BNDES", duration: 2000 },
]

export function ProductRegister({ onBack }: ProductRegisterProps) {
  const [mode, setMode] = useState<RegisterMode>("manual")
  const [step, setStep] = useState<RegisterStep>("form")
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([])
  
  // Estados do formulario manual
  const [codigo, setCodigo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [ncm, setNcm] = useState("")
  const [origemFiscal, setOrigemFiscal] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  // Estados do upload CSV
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Funcao para processar o cadastro com etapas
  async function processRegistration() {
    setStep("processing")
    
    const steps: ProcessingStep[] = PROCESSING_STEPS.map((s) => ({
      ...s,
      completed: false,
      active: false,
    }))
    
    setProcessingSteps(steps)

    // TODO: Descomentar quando o backend estiver pronto
    /*
    try {
      const payload = mode === "manual" 
        ? { codigo, descricao, ncm, origemFiscal }
        : new FormData().append("file", selectedFile!)

      const response = await fetch(API_URL, {
        method: "POST",
        headers: mode === "manual" ? {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}`,
        } : undefined,
        body: mode === "manual" ? JSON.stringify(payload) : payload,
      })

      if (!response.ok) {
        throw new Error("Erro ao cadastrar produto")
      }

      setStep("success")
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erro ao cadastrar")
      setStep("form")
    }
    */

    // Simulacao das etapas de processamento
    for (let i = 0; i < steps.length; i++) {
      // Marcar etapa atual como ativa
      setProcessingSteps((prev) =>
        prev.map((s, idx) => ({
          ...s,
          active: idx === i,
          completed: idx < i,
        }))
      )

      // Aguardar duracao da etapa
      await new Promise((resolve) => setTimeout(resolve, steps[i].duration))

      // Marcar etapa como concluida
      setProcessingSteps((prev) =>
        prev.map((s, idx) => ({
          ...s,
          active: false,
          completed: idx <= i,
        }))
      )
    }

    // Finalizar com sucesso
    setStep("success")
  }

  // Validar e submeter formulario manual
  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (!codigo.trim() || !descricao.trim() || !ncm.trim() || !origemFiscal) {
      setFormError("Por favor, preencha todos os campos")
      return
    }

    processRegistration()
  }

  // Submeter upload CSV
  function handleCsvSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (!selectedFile) {
      setFormError("Por favor, selecione um arquivo CSV")
      return
    }

    processRegistration()
  }

  // Selecionar arquivo
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.endsWith(".csv")) {
        setFormError("Por favor, selecione um arquivo CSV")
        return
      }
      setSelectedFile(file)
      setFormError(null)
    }
  }

  // Remover arquivo selecionado
  function handleRemoveFile() {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Voltar para consulta
  function handleBackToSearch() {
    setCodigo("")
    setDescricao("")
    setNcm("")
    setOrigemFiscal("")
    setSelectedFile(null)
    setStep("form")
    onBack()
  }

  // Tela de processamento
  if (step === "processing") {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Loader2 
              className="h-16 w-16 text-primary animate-spin mb-8" 
              aria-hidden="true" 
            />
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Processando cadastro...
            </h2>
            
            <div className="w-full max-w-md space-y-4">
              {processingSteps.map((procStep, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-all duration-300",
                    procStep.active && "bg-primary/10",
                    procStep.completed && "bg-green-50 dark:bg-green-950/30"
                  )}
                >
                  {procStep.completed ? (
                    <CheckCircle2 
                      className="h-5 w-5 text-green-600 shrink-0" 
                      aria-hidden="true" 
                    />
                  ) : procStep.active ? (
                    <Loader2 
                      className="h-5 w-5 text-primary animate-spin shrink-0" 
                      aria-hidden="true" 
                    />
                  ) : (
                    <div 
                      className="h-5 w-5 rounded-full border-2 border-muted shrink-0" 
                      aria-hidden="true" 
                    />
                  )}
                  <span
                    className={cn(
                      "text-sm",
                      procStep.active && "font-medium text-primary",
                      procStep.completed && "text-green-700 dark:text-green-300",
                      !procStep.active && !procStep.completed && "text-muted-foreground"
                    )}
                  >
                    {procStep.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Tela de sucesso
  if (step === "success") {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
              <CheckCircle2 
                className="h-10 w-10 text-green-600 dark:text-green-400" 
                aria-hidden="true" 
              />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Cadastro concluido com sucesso!
            </h2>
            <p className="text-muted-foreground mb-8">
              O produto foi cadastrado e verificado na base do BNDES
            </p>
            <Button onClick={handleBackToSearch} className="bg-primary hover:bg-primary/90">
              <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
              Voltar para Consulta
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Formulario de cadastro
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          aria-label="Voltar para consulta"
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Cadastrar Produto</h2>
          <p className="text-sm text-muted-foreground">
            Escolha o metodo de cadastro abaixo
          </p>
        </div>
      </div>

      {/* Abas de modo */}
      <div className="flex gap-2 border-b border-border">
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
            mode === "manual"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Cadastro Manual
        </button>
        <button
          type="button"
          onClick={() => setMode("csv")}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
            mode === "csv"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Upload de CSV
        </button>
      </div>

      {/* Conteudo baseado no modo */}
      {mode === "manual" ? (
        <Card>
          <CardHeader>
            <CardTitle>Cadastro Manual</CardTitle>
            <CardDescription>
              Preencha os dados do produto abaixo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Codigo do Produto</Label>
                  <Input
                    id="codigo"
                    type="text"
                    placeholder="Ex: 112233"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ncm">NCM</Label>
                  <Input
                    id="ncm"
                    type="text"
                    placeholder="Ex: 8471.30.19"
                    value={ncm}
                    onChange={(e) => setNcm(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descricao</Label>
                <Input
                  id="descricao"
                  type="text"
                  placeholder="Descricao completa do produto"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="origemFiscal">Origem Fiscal</Label>
                <Select value={origemFiscal} onValueChange={setOrigemFiscal}>
                  <SelectTrigger id="origemFiscal">
                    <SelectValue placeholder="Selecione a origem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nacional">Nacional</SelectItem>
                    <SelectItem value="importado">Importado</SelectItem>
                    <SelectItem value="mercosul">Mercosul</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg"
                >
                  <span>{formError}</span>
                </div>
              )}

              <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                Cadastrar Produto
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Upload de Arquivo CSV</CardTitle>
            <CardDescription>
              Selecione um arquivo CSV com os produtos para cadastro em lote
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCsvSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csvFile">Arquivo CSV</Label>
                <div className="flex flex-col gap-3">
                  <input
                    ref={fileInputRef}
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="sr-only"
                  />
                  
                  {!selectedFile ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg",
                        "border-border hover:border-primary/50 hover:bg-muted/50 transition-colors",
                        "cursor-pointer"
                      )}
                    >
                      <Upload className="h-10 w-10 text-muted-foreground mb-3" aria-hidden="true" />
                      <p className="text-sm font-medium text-foreground">
                        Clique para selecionar um arquivo
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Apenas arquivos .csv
                      </p>
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                      <FileText className="h-8 w-8 text-primary shrink-0" aria-hidden="true" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleRemoveFile}
                        aria-label="Remover arquivo"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg"
                >
                  <span>{formError}</span>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={!selectedFile}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90"
              >
                Cadastrar Produtos
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
