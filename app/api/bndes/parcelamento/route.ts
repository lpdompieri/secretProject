export async function GET(req: Request) {
  console.log("[PARCELAMENTO] route chamado")
  console.log("[PARCELAMENTO][ENV CHECK]", {
    BNDES_CLIENT_ID: process.env.BNDES_CLIENT_ID,
    BNDES_TOKEN_URL: process.env.BNDES_TOKEN_URL,
    BNDES_API_BASE: process.env.BNDES_API_BASE,
  })
  
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
