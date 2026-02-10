export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { bndesFetch } from "../../_lib/bndes-fetch"

const BNDES_BASE =
  "https://apigw-h.bndes.gov.br/cbn-fornecedor/v1"

console.log("Cheguei na linha que começa a function do PUT, dentro de app/api/bndes/pedido/[pedido]/route.ts")

export async function PUT(
  req: Request,
  { params }: { params: { pedido: string } }
) {
  try {
    console.log("🔥 PARAMS RECEBIDOS:", params)

    const pedido = params.pedido

    if (!pedido) {
      return NextResponse.json(
        { error: "Número do pedido obrigatório" },
        { status: 400 }
        console.log("Perdi o numero do pedido dentro de de app/api/bndes/pedido/[pedido]/route.ts")

      )
    }

    const body = await req.json()

    const url = `${BNDES_BASE}/pedido/${pedido}`

    console.log("[BNDES] PUT:", url)
    console.log("[BNDES] Payload:", body)

    const response = await bndesFetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error("[BNDES] Erro:", text)

      return NextResponse.json(
        { error: "Erro ao finalizar pedido", body: text },
        { status: 502 }
      )
    }

    const text = await response.text()

    return new NextResponse(text || "OK", { status: 200 })
  } catch (err: any) {
    console.error("[BNDES] Erro interno:", err)

    return NextResponse.json(
      { error: "Erro interno", message: err.message },
      { status: 500 }
    )
  }
}
