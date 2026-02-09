export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { bndesFetch } from "../_lib/bndes-fetch"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    console.log("[BNDES][PEDIDO] Body recebido:", body)

    const apiBase = process.env.BNDES_API_BASE
    if (!apiBase) {
      throw new Error("BNDES_API_BASE não configurada")
    }

    const url = `${apiBase}/pedido`

    console.log("[BNDES][PEDIDO] Chamando:", url)

    // ✅ MESMA FUNÇÃO DA SIMULAÇÃO
    const response = await bndesFetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const text = await response.text()

    console.log("[BNDES][PEDIDO] Status:", response.status)
    console.log("[BNDES][PEDIDO] Body bruto:", text)

    if (!response.ok || !text) {
      return NextResponse.json(
        {
          error: "Pedido não retornado pelo BNDES",
          status: response.status,
          body: text,
        },
        { status: 502 }
      )
    }

    // 🔥 BNDES retorna SÓ O NÚMERO (texto puro)
    return new NextResponse(text.trim(), {
      status: 201,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  } catch (error: any) {
    console.error("[BNDES][PEDIDO] Erro interno:", error)

    return NextResponse.json(
      {
        error: "Erro interno",
        message: error.message,
      },
      { status: 500 }
    )
  }
}
