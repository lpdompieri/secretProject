import { NextResponse } from "next/server"

const BNDES_API_URL =
  "https://eshfg37ovylo7or35lk3sa5jwy0sutqg.lambda-url.sa-east-1.on.aws/"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sku = searchParams.get("sku")

    if (!sku) {
      return NextResponse.json(
        { success: false, error: "SKU não informado" },
        { status: 400 }
      )
    }

    const response = await fetch(`${BNDES_API_URL}?sku=${sku}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // sempre consulta em tempo real
    })

    if (!response.ok) {
      throw new Error("Erro ao consultar API BNDES")
    }

    const json = await response.json()

    /**
     * Esperado da Lambda:
     * {
     *   timestamp,
     *   processingTimeMs,
     *   data: { sku, eligible, ruleVersion }
     * }
     */
    return NextResponse.json({
      success: true,
      sku: json.data.sku,
      eligible: json.data.eligible,
      ruleVersion: json.data.ruleVersion,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erro inesperado ao consultar BNDES",
      },
      { status: 500 }
    )
  }
}
