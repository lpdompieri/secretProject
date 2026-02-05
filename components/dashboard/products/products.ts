export interface BndesEligibilityResponse {
  success: boolean
  eligible?: boolean
  ruleVersion?: string
  error?: string
}

export async function checkBndesEligibility(
  sku: string
): Promise<BndesEligibilityResponse> {
  try {
    /**
     * MOCK TEMPORÁRIO
     * depois isso vira fetch para /api/products/check-eligibility
     */

    await new Promise((resolve) => setTimeout(resolve, 500))

    // Simulação simples por SKU
    if (sku === "112233") {
      return {
        success: true,
        eligible: true,
        ruleVersion: "2026.02",
      }
    }

    return {
      success: true,
      eligible: false,
      ruleVersion: "2026.02",
    }
  } catch (error) {
    return {
      success: false,
      error: "Erro ao consultar elegibilidade BNDES",
    }
  }
}
