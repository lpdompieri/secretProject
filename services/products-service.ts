"use client"

export type ProductEligibilityResult = {
  success: boolean
  sku?: string
  eligible?: boolean
  ruleVersion?: string
  error?: string
}

const BNDES_API_URL =
  "https://eshfg37ovylo7or35lk3sa5jwy0sutqg.lambda-url.sa-east-1.on.aws/"

interface BndesApiResponse {
  timestamp: string
  processingTimeMs: number
  data: {
    sku: string
    eligible: boolean
    ruleVersion: string
  }
}

/**
 * Consulta REAL de elegibilidade BNDES
 */
export async function checkBndesEligibility(sku: string) {
  try {
    const response = await fetch(`/api/bndes/eligibility?sku=${sku}`, {
      method: "GET",
    })

    if (!response.ok) {
      throw new Error("Erro ao consultar elegibilidade BNDES")
    }

    return await response.json()
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido"
    return { success: false, error: message }
  }
}
