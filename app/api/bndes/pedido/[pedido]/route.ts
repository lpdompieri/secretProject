export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { bndesFetch } from "../../_lib/bndes-fetch"

const BNDES_PEDIDO_BASE =
  "https://apigw-h.bndes.gov.br/cbn-fornecedor/v1"

export async function PUT(
  req: Request,
  { params }: { params: { pedido: string } }
) {
  try {
    const body = await req.json()
    const { pedido } = params

    if (!pedido) {
      return NextResponse.json(
        { error: "Número do pedido obrigatório" },
        { status: 400 }
      )
    }

    const url = `${BNDES_PEDIDO_BASE}/pedido/${pedido}`

    console.log("[BNDES][PEDIDO] Finalizando pedido:", url)
    console.log("[BNDES][PEDIDO] Payload:", body)

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

    // ⚠️ essa API normalmente não retorna body útil
    const text = await response.text()

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
