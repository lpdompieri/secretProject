"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, CheckCircle2, X, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

/* ===============================
   TIPOS
================================ */

type RegisterStep = "form" | "processing"

type DebugLog = {
  step: string
  status: "info" | "ok" | "error"
  message: string
}

/* ===============================
   INTEGRAÇÃO
================================ */

async function getPresignedUrl() {
  const res = await fetch("/api/uploads/presigned", { method: "POST" })

  return {
    ok: res.ok,
    status: res.status,
    body: await res.json(),
  }
}

async function uploadCsvToS3(uploadUrl: string, file: File) {
  return fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "text/csv" },
    body: file,
  })
}

/* ===============================
   COMPONENTE
================================ */

export function ProductRegister({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<RegisterStep>("form")
  const [file, setFile] = useState<File | null>(null)
  const [logs, setLogs] = useState<DebugLog[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  function log(step: string, status: DebugLog["status"], message: string) {
    setLogs((prev) => [...prev, { step, status, message }])
  }

  async function processCsv() {
    if (!file) return

    setLogs([])
    setStep("processing")

    try {
      log("START", "info", "Iniciando processo de envio")

      /* 1️⃣ Arquivo */
      log("FILE", "ok", `Arquivo selecionado: ${file.name} (${file.size} bytes)`)

      /* 2️⃣ Presigned */
      log("PRESIGNED", "info", "Chamando API /api/uploads/presigned")
      const presigned = await getPresignedUrl()

      if (!presigned.ok) {
        log("PRESIGNED", "error", `Erro HTTP ${presigned.status}`)
        throw new Error("Falha ao gerar presigned URL")
      }

      log("PRESIGNED", "ok", "Resposta recebida da API")

      const uploadUrl = presigned.body.uploadUrl
      if (!uploadUrl) {
        log("PRESIGNED", "error", "uploadUrl não veio no response")
        throw new Error("uploadUrl ausente")
      }

      log("PRESIGNED", "ok", "uploadUrl extraída com sucesso")

      /* 3️⃣ Upload */
      log("UPLOAD", "info", "Montando PUT para S3")
      const uploadRes = await uploadCsvToS3(uploadUrl, file)

      if (!uploadRes.ok) {
        log(
          "UPLOAD",
          "error",
          `Falha no PUT S3 – status ${uploadRes.status}`
        )
        throw new Error("Erro no upload S3")
      }

      log("UPLOAD", "ok", "Arquivo enviado com sucesso para o S3")

      /* 4️⃣ Final */
      log("DONE", "ok", "Fluxo finalizado sem erros")
      setStep("success")
    } catch (err) {
      log("ERROR", "error", String(err))
      setStep("form")
    }
  }

  /* ===============================
     UI
  ================================ */

  if (step === "processing") {
    return (
      <Card>
        <CardContent className="space-y-4 py-6">
          <div className="flex items-center gap-2">
            <Loader2 className="animate-spin" />
            <span>Processando…</span>
          </div>

          <div className="space-y-2 text-sm">
            {logs.map((l, i) => (
              <div
                key={i}
                className={cn(
                  "rounded p-2 border",
                  l.status === "ok" && "bg-green-50 border-green-200",
                  l.status === "error" && "bg-red-50 border-red-200",
                  l.status === "info" && "bg-slate-50"
                )}
              >
                <strong>{l.step}:</strong> {l.message}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (step === "success") {
    return (
      <Card>
        <CardContent className="py-10 text-center space-y-3">
          <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto" />
          <p className="font-semibold">Cadastro concluído</p>
          <Button onClick={onBack}>Voltar</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="space-y-4 py-6">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        {file && (
          <div className="flex items-center gap-2 text-sm">
            <FileText />
            {file.name}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setFile(null)
                if (fileInputRef.current) fileInputRef.current.value = ""
              }}
            >
              <X />
            </Button>
          </div>
        )}

        <Button onClick={processCsv} disabled={!file}>
          Enviar CSV
        </Button>
      </CardContent>
    </Card>
  )
}
