import { NextResponse } from "next/server"
import { bndesFetch } from "../_lib/bndes-fetch"

export const runtime = "nodejs"

console.log("[ENV CHECK]", {
  TOKEN_URL: process.env.BNDES_TOKEN_URL,
  API_BASE: process.env.BNDES_API_BASE,
  CLIENT_ID: process.env.BNDES_CLIENT_ID ? "OK" : "MISSING",
  CLIENT_SECRET: process.env.BNDES_CLIENT_SECRET ? "OK" : "MISSING",
})

const BNDES_API_BASE =
  "https://apigw-h.bndes.gov.br/cbn-fornecedor/v1"

export async function GET(req: Request) {
  try {
    console.log("[PARCELAMENTO] route chamada")

    const { searchParams } = new URL(req.url)
    const valor = searchParams.get("valor")

    if (!valor) {
      return NextResponse.json(
        { error: "Valor obrigatório" },
        { status: 400 }
      )
    }

    console.log("[PARCELAMENTO] valor:", valor)

    const url = `${BNDES_API_BASE}/simulacao/financiamento?valor=${valor}`

    console.log("[PARCELAMENTO] URL BNDES:", url)

    const response = await bndesFetch(url)

    console.log("[PARCELAMENTO] status BNDES:", response.status)

    if (!response.ok) {
      const text = await response.text()
      console.error("[PARCELAMENTO] erro BNDES:", text)

      return NextResponse.json(
        { error: "Erro BNDES", body: text },
        { status: 502 }
      )
    }

    const data = await response.json()
    console.log("[PARCELAMENTO] sucesso")

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[PARCELAMENTO] erro interno:", error)

    return NextResponse.json(
      {
        error: "Erro interno",
        message: error?.message ?? "erro desconhecido",
      },
      { status: 500 }
    )
  }
}
