export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { bndesFetch } from "../_lib/bndes-fetch"

export async function GET(req: Request) {
  try {
    console.log("🔥 ROUTE PARCELAMENTO CARREGADO 🔥")

    const { searchParams } = new URL(req.url)
    const valor = searchParams.get("valor")

    if (!valor) {
      return NextResponse.json(
        { error: "Valor obrigatório" },
        { status: 400 }
      )
    }

    const {
      BNDES_API_BASE,
      BNDES_TOKEN_URL,
      BNDES_CLIENT_ID,
      BNDES_CLIENT_SECRET,
    } = process.env

    console.log("[ENV CHECK ROUTE]", {
      BNDES_API_BASE,
      BNDES_TOKEN_URL,
      BNDES_CLIENT_ID: !!BNDES_CLIENT_ID,
      BNDES_CLIENT_SECRET: !!BNDES_CLIENT_SECRET,
    })

    if (
      !BNDES_API_BASE ||
      !BNDES_TOKEN_URL ||
      !BNDES_CLIENT_ID ||
      !BNDES_CLIENT_SECRET
    ) {
      throw new Error("Variáveis de ambiente do BNDES não configuradas")
    }

    const url = `${BNDES_API_BASE}/simulacao/financiamento?valor=${valor}`

    const response = await bndesFetch({
      url,
      tokenUrl: BNDES_TOKEN_URL,
      clientId: BNDES_CLIENT_ID,
      clientSecret: BNDES_CLIENT_SECRET,
    })

    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json(
        { error: "Erro BNDES", body: text },
        { status: 502 }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[BNDES] Erro interno:", error)

    return NextResponse.json(
      { error: "Erro interno", message: error.message },
      { status: 500 }
    )
  }
}
