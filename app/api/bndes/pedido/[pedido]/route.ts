export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { bndesFetch } from "../../_lib/bndes-fetch"

export async function PUT(
  req: Request,
  { params }: { params: { pedido: string } }
) {
  try {
    const body = await req.json()
    const { pedido } = params

    const apiBase = process.env.BNDES_API_BASE
    if (!apiBase) {
      throw new Error("BNDES_API_BASE não configurada")
    }

    // ✅ URL EXATAMENTE IGUAL AO POSTMAN
    const url = `${apiBase}/pedido/${pedido}`

    console.log("[BNDES][PEDIDO] Finalizando pedido:", pedido)
    console.log("[BNDES][PEDIDO] URL:", url)
    console.log("[BNDES][PEDIDO] Payload:", body)

    // ✅ MESMA SOLUÇÃO DO PARCELAMENTO
    const response = await bndesFetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const text = await response.text()

    console.log("[BNDES][PEDIDO] Status:", response.status)
    console.log("[BNDES][PEDIDO] Body bruto:", text)

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Erro ao finalizar pedido",
          body: text,
        },
        { status: 502 }
      )
    }

    // 🔥 BNDES pode responder vazio ou texto
    return NextResponse.json({
      success: true,
      pedido,
      response: text || null,
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
