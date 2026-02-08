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

    const url = `${apiBase}/pedido/${pedido}`

    console.log("[BNDES][PEDIDO] Finalizando pedido:", pedido)

    const response = await bndesFetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error("[BNDES][PEDIDO] Erro ao finalizar:", text)

      return NextResponse.json(
        { error: "Erro ao finalizar pedido", body: text },
        { status: 502 }
      )
    }

    const data = await response.json()

    console.log("[BNDES][PEDIDO] Pedido finalizado com sucesso")

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[BNDES][PEDIDO] Erro interno:", error)

    return NextResponse.json(
      { error: "Erro interno", message: error.message },
      { status: 500 }
    )
  }
}
