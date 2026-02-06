"use client"

import React, { useState, useRef } from "react"
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
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

/* ===============================
   CONFIG TEMPORÁRIA (DEV ONLY)
================================ */

async function getPresignedUrl() {
  const res = await fetch("/api/uploads/presigned", {
    method: "POST",
  })

  if (!res.ok) {
    throw new Error("Erro ao gerar URL de upload")
  }

  return res.json() as Promise<{
    uploadUrl: string
    key: string
    expiresInSeconds: number
  }>
}


/* ===============================
   TIPOS
================================ */

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

const PROCESSING_STEPS: Omit<
  ProcessingStep,
  "completed" | "active"
>[] = [
  { label: "Validando dados informados", duration: 1500 },
  { label: "Enviando arquivo para o S3", duration: 2000 },
  { label: "Registrando importação", duration: 1500 },
]

/* ===============================
   FUNÇÕES DE INTEGRAÇÃO
================================ */

async function getPresignedUrl() {
  const res = await fetch(PRESIGNED_API_URL, {
    method: "GET",
    headers: {
      Authorization: BASIC_AUTH,
    },
  })

  if (!res.ok) {
    throw new Error("Erro ao gerar URL de upload")
  }

  return res.json() as Promise<{
    uploadUrl: string
    key: string
    expiresInSeconds: number
  }>
}

async function uploadCsvToS3(uploadUrl: string, file: File) {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "text/csv",
    },
    body: file,
  })

  if (!res.ok) {
    throw new Error("Erro ao enviar CSV para o S3")
  }
}

/* ===============================
   COMPONENTE
================================ */

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

  /* ===============================
     PROCESSAMENTO
  ================================ */

  async function processRegistration() {
    setStep("processing")
    setFormError(null)

    const steps: ProcessingStep[] = PROCESSING_STEPS.map((s) => ({
      ...s,
      completed: false,
      active: false,
    }))
    setProcessingSteps(steps)

    try {
      if (mode === "csv" && selectedFile) {
        const { uploadUrl } = await getPresignedUrl()
        await uploadCsvToS3(uploadUrl, selectedFile)
      }

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
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Erro inesperado"
      )
      setStep("form")
    }
  }

  /* ===============================
     HANDLERS
  ================================ */

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!codigo || !descricao || !ncm || !origemFiscal) {
      setFormError("Preencha todos os campos")
      return
    }
    processRegistration()
  }

  function handleCsvSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFile) {
      setFormError("Selecione um arquivo CSV")
      return
    }
    processRegistration()
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !file.name.endsWith(".csv")) {
      setFormError("Arquivo inválido")
      return
    }
    setSelectedFile(file)
    setFormError(null)
  }

  function handleRemoveFile() {
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function handleBackToSearch() {
    setStep("form")
    onBack()
  }

  /* ===============================
     TELAS
  ================================ */

  if (step === "processing") {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center gap-6">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="w-full max-w-md space-y-3">
              {processingSteps.map((s, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg",
                    s.active && "bg-primary/10",
                    s.completed && "bg-green-50"
                  )}
                >
                  {s.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : s.active ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border" />
                  )}
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (step === "success") {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle2 className="h-14 w-14 text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Cadastro concluído
          </h2>
          <Button onClick={handleBackToSearch}>
            Voltar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-semibold">
          Cadastrar Produto
        </h2>
      </div>

      <div className="flex gap-2 border-b">
        <button
          onClick={() => setMode("manual")}
          className={cn(
            "px-4 py-2 border-b-2",
            mode === "manual"
              ? "border-primary"
              : "border-transparent"
          )}
        >
          Manual
        </button>
        <button
          onClick={() => setMode("csv")}
          className={cn(
            "px-4 py-2 border-b-2",
            mode === "csv"
              ? "border-primary"
              : "border-transparent"
          )}
        >
          CSV
        </button>
      </div>

      {mode === "manual" ? (
        <Card>
          <CardContent className="space-y-4">
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <Input placeholder="Código" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
              <Input placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
              <Input placeholder="NCM" value={ncm} onChange={(e) => setNcm(e.target.value)} />

              <Select value={origemFiscal} onValueChange={setOrigemFiscal}>
                <SelectTrigger>
                  <SelectValue placeholder="Origem Fiscal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nacional">Nacional</SelectItem>
                  <SelectItem value="importado">Importado</SelectItem>
                </SelectContent>
              </Select>

              {formError && <p className="text-red-600">{formError}</p>}
              <Button type="submit">Cadastrar</Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
            />

            {selectedFile && (
              <div className="flex items-center gap-2">
                <FileText />
                {selectedFile.name}
                <Button size="icon" variant="ghost" onClick={handleRemoveFile}>
                  <X />
                </Button>
              </div>
            )}

            {formError && <p className="text-red-600">{formError}</p>}
            <Button onClick={handleCsvSubmit}>Enviar CSV</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
