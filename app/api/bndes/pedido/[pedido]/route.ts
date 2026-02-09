export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { bndesFetch } from "../../_lib/bndes-fetch"

console.log("🔥🔥🔥 ROTA [pedido] CARREGADA 🔥🔥🔥")

const BNDES_PEDIDO_BASE =
  "https://apigw-h.bndes.gov.br/cbn-fornecedor/v1"

export async function PUT(
  req: Request,
  { params }: { params: { pedido: string } }
) {
  console.log("🔥 PARAMS RECEBIDOS:", params)

  try {
    const pedido = params.pedido

    if (!pedido) {
      console.error("[BNDES][PEDIDO] Pedido undefined")
      return NextResponse.json(
        { error: "Número do pedido obrigatório" },
        { status: 400 }
      )
    }

    const body = await req.json()

    const url = `${BNDES_PEDIDO_BASE}/pedido/${pedido}`

    console.log("[BNDES][PEDIDO] URL:", url)
    console.log("[BNDES][PEDIDO] Payload:", body)

    const response = await bndesFetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const text = await response.text()

    if (!response.ok) {
      console.error("[BNDES][PEDIDO] Erro BNDES:", text)
      return NextResponse.json(
        { error: "Erro ao finalizar pedido", body: text },
        { status: 502 }
      )
    }

    console.log("[BNDES][PEDIDO] Pedido finalizado com sucesso")

    return new NextResponse(text || "OK", { status: 200 })
  } catch (error: any) {
    console.error("[BNDES][PEDIDO] Erro interno:", error)

    return NextResponse.json(
      { error: "Erro interno", message: error.message },
      { status: 500 }
    )
  }
}
