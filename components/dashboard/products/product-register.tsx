"use client"

import React, { useState, useRef } from "react"
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle2,
  Loader2,
  X,
  Package,
  FileSpreadsheet,
  Activity
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

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

/* ============================= */
/* MOCK KPIs (Enterprise Layer) */
/* ============================= */

const MOCK_KPI = {
  totalHoje: 18,
  manualHoje: 7,
  loteHoje: 11,
  taxaSucesso: 98.4,
}

/* ============================= */

export function ProductRegister({ onBack }: ProductRegisterProps) {
  const [mode, setMode] = useState<RegisterMode>("manual")
  const [step, setStep] = useState<RegisterStep>("form")
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([])

  const [codigo, setCodigo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [ncm, setNcm] = useState("")
  const [origemFiscal, setOrigemFiscal] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /* ============================= */
  /* PROCESSAMENTO */
  /* ============================= */

  async function processRegistration() {
    setStep("processing")

    const steps: ProcessingStep[] = [
      { label: "Validando dados", duration: 1500, completed: false, active: false },
      { label: "Persistindo na base", duration: 2000, completed: false, active: false },
      { label: "Validando habilitação BNDES", duration: 1500, completed: false, active: false },
    ]

    setProcessingSteps(steps)

    for (let i = 0; i < steps.length; i++) {
      setProcessingSteps((prev) =>
        prev.map((s, idx) => ({
          ...s,
          active: idx === i,
          completed: idx < i,
        }))
      )

      await new Promise((r) => setTimeout(r, steps[i].duration))

      setProcessingSteps((prev) =>
        prev.map((s, idx) => ({
          ...s,
          active: false,
          completed: idx <= i,
        }))
      )
    }

    setStep("success")
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (!codigo || !descricao || !ncm || !origemFiscal) {
      setFormError("Preencha todos os campos obrigatórios.")
      return
    }

    processRegistration()
  }

  function handleCsvSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFile) {
      setFormError("Selecione um arquivo CSV.")
      return
    }

    processRegistration()
  }

  /* ============================= */
  /* SUCCESS SCREEN */
  /* ============================= */

  if (step === "success") {
    return (
      <Card>
        <CardContent className="py-14 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold">Cadastro concluído</h2>
          <p className="text-muted-foreground mt-2 mb-8">
            Produto validado e integrado com sucesso.
          </p>

          <Button onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </CardContent>
      </Card>
    )
  }

  /* ============================= */
  /* PROCESSING SCREEN */
  /* ============================= */

  if (step === "processing") {
    return (
      <Card>
        <CardContent className="py-14 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-6 text-primary" />
          <h2 className="text-lg font-semibold mb-6">Processando cadastro</h2>

          <div className="max-w-md mx-auto space-y-3">
            {processingSteps.map((s, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border",
                  s.active && "border-primary bg-primary/5",
                  s.completed && "border-green-200 bg-green-50"
                )}
              >
                {s.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : s.active ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <div className="h-4 w-4 rounded-full border" />
                )}
                <span className="text-sm">{s.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  /* ============================= */
  /* MAIN ENTERPRISE LAYOUT */
  /* ============================= */

  return (
    <div className="space-y-8">

      {/* ============================= */}
      {/* HEADER + ACTION BAR */}
      {/* ============================= */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            Cadastro de Produtos
            <Badge variant="secondary">
              {mode === "manual" ? "Manual" : "Lote CSV"}
            </Badge>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gestão de produtos elegíveis ao financiamento BNDES
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <Button variant="outline">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Template CSV
          </Button>
        </div>
      </div>

      {/* ============================= */}
      {/* KPI SECTION */}
      {/* ============================= */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Hoje</p>
              <p className="text-xl font-bold">{MOCK_KPI.totalHoje}</p>
            </div>
            <Package className="h-6 w-6 text-primary" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Manual</p>
            <p className="text-xl font-bold">{MOCK_KPI.manualHoje}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Lote CSV</p>
            <p className="text-xl font-bold">{MOCK_KPI.loteHoje}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Taxa Sucesso</p>
              <p className="text-xl font-bold">
                {MOCK_KPI.taxaSucesso}%
              </p>
            </div>
            <Activity className="h-6 w-6 text-green-600" />
          </CardContent>
        </Card>
      </div>

      {/* ============================= */}
      {/* MODE SELECTOR (Enterprise Pattern) */}
      {/* ============================= */}

      <div className="flex gap-2 border-b pb-2">
        <Button
          variant={mode === "manual" ? "default" : "ghost"}
          onClick={() => setMode("manual")}
        >
          Cadastro Manual
        </Button>
        <Button
          variant={mode === "csv" ? "default" : "ghost"}
          onClick={() => setMode("csv")}
        >
          Upload CSV
        </Button>
      </div>

      {/* ============================= */}
      {/* FORM SECTION */}
      {/* ============================= */}

      {mode === "manual" ? (
        <Card>
          <CardHeader>
            <CardTitle>Cadastro Manual</CardTitle>
            <CardDescription>
              Informe os dados fiscais e comerciais do produto.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualSubmit} className="space-y-6">

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Código</Label>
                  <Input value={codigo} onChange={(e) => setCodigo(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>NCM</Label>
                  <Input value={ncm} onChange={(e) => setNcm(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Origem Fiscal</Label>
                <Select value={origemFiscal} onValueChange={setOrigemFiscal}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nacional">Nacional</SelectItem>
                    <SelectItem value="importado">Importado</SelectItem>
                    <SelectItem value="mercosul">Mercosul</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formError && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                  {formError}
                </div>
              )}

              <div className="flex justify-end">
                <Button type="submit">
                  Cadastrar Produto
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV</CardTitle>
            <CardDescription>
              Cadastro em lote com validação automática.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCsvSubmit} className="space-y-6">

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              />

              {!selectedFile ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-32 border-dashed"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Selecionar Arquivo CSV
                </Button>
              ) : (
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <span className="text-sm">{selectedFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={!selectedFile}>
                  Processar Lote
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
