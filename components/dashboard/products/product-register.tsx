"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
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
  FileText,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

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

interface PresignedDebug {
  attempted: boolean
  success: boolean
  uploadUrl?: string
  error?: string
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
   INTEGRAÇÃO
================================ */

async function getPresignedUrl() {
  const res = await fetch("/api/uploads/presigned", {
    method: "POST",
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || "Erro ao gerar URL de upload")
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

  const [presignedDebug, setPresignedDebug] =
    useState<PresignedDebug | null>(null)

  /* ===============================
     PROCESSAMENTO
  ================================ */

  async function processRegistration() {
    setStep("processing")
    setFormError(null)
    setPresignedDebug(null)

    const steps: ProcessingStep[] = PROCESSING_STEPS.map((s) => ({
      ...s,
      completed: false,
      active: false,
    }))
    setProcessingSteps(steps)

    try {
      if (mode === "csv" && selectedFile) {
        setPresignedDebug({ attempted: true, success: false })

        const presigned = await getPresignedUrl()

        setPresignedDebug({
          attempted: true,
          success: true,
          uploadUrl: presigned.uploadUrl,
        })

        await uploadCsvToS3(presigned.uploadUrl, selectedFile)
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
      setFormError(err instanceof Error ? err.message : "Erro inesperado")

      setPresignedDebug((prev) =>
        prev
          ? { ...prev, success: false, error: String(err) }
          : prev
      )

      setStep("form")
    }
  }

  /* ===============================
     HANDLERS
  ================================ */

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

  /* ===============================
     TELAS
  ================================ */

  if (step === "processing") {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" />
          Processando…
        </CardContent>
      </Card>
    )
  }

  if (step === "success") {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
          Cadastro concluído
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

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
              <Button
                size="icon"
                variant="ghost"
                onClick={handleRemoveFile}
              >
                <X />
              </Button>
            </div>
          )}

          {formError && (
            <p className="text-red-600 font-medium">{formError}</p>
          )}

          {presignedDebug && (
            <div className="rounded border p-3 text-sm bg-slate-50">
              <p>
                <strong>Presigned URL:</strong>{" "}
                {presignedDebug.success ? "GERADA ✅" : "NÃO GERADA ❌"}
              </p>

              {presignedDebug.uploadUrl && (
                <p className="break-all text-xs mt-1">
                  {presignedDebug.uploadUrl}
                </p>
              )}

              {presignedDebug.error && (
                <p className="text-red-600 mt-1">
                  {presignedDebug.error}
                </p>
              )}
            </div>
          )}

          <Button onClick={handleCsvSubmit}>
            Enviar CSV
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
