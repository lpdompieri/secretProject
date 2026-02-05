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
export async function checkBndesEligibility(
  sku: string
): Promise<ProductEligibilityResult> {
  try {
    const response = await fetch(`${BNDES_API_URL}?sku=${sku}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}`)
    }

    const json: BndesApiResponse = await response.json()

    return {
      success: true,
      sku: json.data.sku,
      eligible: json.data.eligible,
      ruleVersion: json.data.ruleVersion,
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao consultar elegibilidade BNDES",
    }
  }
}
