"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, CheckCircle2, X, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

/* ===============================
   TIPOS
================================ */

type RegisterStep = "form" | "processing" | "success"

type DebugLog = {
  step: string
  status: "info" | "ok" | "error"
  message: string
}

/* ===============================
   INTEGRAÇÃO
================================ */

async function getPresignedUrl() {
  const res = await fetch("/api/uploads/presigned", {
    method: "POST",
    cache: "no-store",
  })

  let body: any = null
  try {
    body = await res.json()
  } catch {
    body = null
  }

  return {
    ok: res.ok,
    status: res.status,
    body,
  }
}

async function uploadCsvToS3(uploadUrl: string, file: File) {
  return fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "text/csv",
    },
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
      /* ===============================
         1️⃣ ARQUIVO
      ================================ */
      log("START", "info", "Iniciando fluxo de upload")
      log(
        "FILE",
        "ok",
        `Arquivo selecionado: ${file.name} (${file.size} bytes)`
      )

      /* ===============================
         2️⃣ PRESIGNED URL
      ================================ */
      log("PRESIGNED", "info", "Chamando /api/uploads/presigned")
      const presigned = await getPresignedUrl()

      if (!presigned.ok) {
        log(
          "PRESIGNED",
          "error",
          `Erro HTTP ${presigned.status} ao gerar presigned`
        )
        throw new Error("Falha ao gerar presigned URL")
      }

      if (!presigned.body?.uploadUrl) {
        log(
          "PRESIGNED",
          "error",
          "Resposta não contém uploadUrl"
        )
        throw new Error("uploadUrl ausente no response")
      }

      log("PRESIGNED", "ok", "Presigned URL gerada com sucesso")
      log(
        "PRESIGNED",
        "info",
        `Key gerada: ${presigned.body.key ?? "não informada"}`
      )

      /* ===============================
         3️⃣ UPLOAD S3
      ================================ */
      log("UPLOAD", "info", "Enviando arquivo para o S3 (PUT)")
      const uploadRes = await uploadCsvToS3(
        presigned.body.uploadUrl,
        file
      )

      if (!uploadRes.ok) {
        log(
          "UPLOAD",
          "error",
          `S3 retornou status ${uploadRes.status}`
        )
        throw new Error("Erro no upload para o S3")
      }

      log("UPLOAD", "ok", "Upload concluído com sucesso no S3")

      /* ===============================
         4️⃣ FINAL
      ================================ */
      log("DONE", "ok", "Fluxo finalizado sem erros")
      setStep("success")
    } catch (err) {
      log(
        "ERROR",
        "error",
        err instanceof Error ? err.message : String(err)
      )
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

          {/* botão para NÃO sair da tela */}
          <Button
            variant="outline"
            onClick={() => setStep("form")}
          >
            Voltar (manter logs)
          </Button>
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
                if (fileInputRef.current) {
                  fileInputRef.current.value = ""
                }
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
