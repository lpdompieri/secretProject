export const runtime = "nodejs"

console.log("🔥 ROUTE PARCELAMENTO CARREGADO 🔥")
console.log("ENV CHECK:", {
  BNDES_API_BASE: process.env.BNDES_API_BASE,
  BNDES_TOKEN_URL: process.env.BNDES_TOKEN_URL,
  BNDES_CLIENT_ID: process.env.BNDES_CLIENT_ID ? "OK" : "MISSING",
})

import { NextResponse } from "next/server"
import { bndesFetch } from "../_lib/bndes-fetch"

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

    const apiBase = process.env.BNDES_API_BASE

    if (!apiBase) {
      throw new Error("BNDES_API_BASE não configurada")
    }

    const url = `${apiBase}/simulacao/financiamento?valor=${valor}`

    console.log("[BNDES] Chamando:", url)

    const response = await bndesFetch(url)

    if (!response.ok) {
      const text = await response.text()
      console.error("[BNDES] Erro BNDES:", text)

      return NextResponse.json(
        { error: "Erro BNDES", body: text },
        { status: 502 }
      )
    }

    const data = await response.json()

    console.log("[BNDES] Payload OK")

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[BNDES] Erro interno:", error)

    return NextResponse.json(
      { error: "Erro interno", message: error.message },
      { status: 500 }
    )
  }
}
