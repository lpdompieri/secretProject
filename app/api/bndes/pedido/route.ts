export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { bndesFetch } from "../_lib/bndes-fetch"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const apiBase = process.env.BNDES_API_BASE
    if (!apiBase) {
      throw new Error("BNDES_API_BASE não configurada")
    }

    const url = `${apiBase}/pedido`

    console.log("[BNDES][PEDIDO] Criando pedido:", body)

    const response = await bndesFetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error("[BNDES][PEDIDO] Erro:", text)

      return NextResponse.json(
        { error: "Erro ao criar pedido", body: text },
        { status: 502 }
      )
    }

    const data = await response.json()

    console.log("[BNDES][PEDIDO] Pedido criado:", data)

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[BNDES][PEDIDO] Erro interno:", error)

    return NextResponse.json(
      { error: "Erro interno", message: error.message },
      { status: 500 }
    )
  }
}
