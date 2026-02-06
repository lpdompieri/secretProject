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

const PRESIGNED_API_URL =
  "https://q7cxwlgged6pphwts77jil53ai0aoywg.lambda-url.sa-east-1.on.aws/"

const BASIC_AUTH =
  "Basic bHBkb21waWVyaUBnbWFpbC5jb206Y292aXp6aQ=="

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
        // 1. Gera URL
        const { uploadUrl } = await getPresignedUrl()

        // 2. Upload CSV
        await uploadCsvToS3(uploadUrl, selectedFile)
      }

      // Simulação visual das etapas
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
    if (!file?.name.endsWith(".csv")) {
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
     TELAS (mantidas)
  ================================ */

  // ⬇️ (a partir daqui, seu JSX permanece igual)
