import { NextResponse } from "next/server"
import { bndesFetch } from "../_lib/bndes-fetch"

export const runtime = "nodejs"

const BNDES_API_BASE = "https://apigw-h.bndes.gov.br/cbn-fornecedor/v1"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const valor = searchParams.get("valor")

    if (!valor) {
      return NextResponse.json(
        { error: "Valor obrigatório" },
        { status: 400 }
      )
    }

    const url = `${BNDES_API_BASE}/simulacao/financiamento?valor=${valor}`

    console.log("[BNDES][ROUTE] URL:", url)

    const response = await bndesFetch(url)

    if (!response.ok) {
      const text = await response.text()
      console.error("[BNDES][ROUTE] Erro BNDES:", text)

      return NextResponse.json(
        { error: "Erro BNDES", body: text },
        { status: 502 }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[BNDES][ROUTE] Erro interno:", error)

    return NextResponse.json(
      { error: "Erro interno", message: error.message },
      { status: 500 }
    )
  }
}
