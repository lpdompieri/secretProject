export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { bndesFetch } from "../../_lib/bndes-fetch"

const BNDES_BASE =
  "https://apigw-h.bndes.gov.br/cbn-fornecedor/v1"

export async function PUT(req: Request) {
  try {
    // 🔥 EXTRAÇÃO MANUAL DO PEDIDO (à prova de bug)
    const url = new URL(req.url)
    const parts = url.pathname.split("/")
    const pedido = parts[parts.length - 1]

    if (!pedido) {
      return NextResponse.json(
        { error: "Número do pedido obrigatório" },
        { status: 400 }
      )
    }

    const body = await req.json()

    const bndesUrl = `${BNDES_BASE}/pedido/${pedido}`

    console.log("[BNDES] PUT:", bndesUrl)
    console.log("[BNDES] Payload:", body)

    const response = await bndesFetch(bndesUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const text = await response.text()

    if (!response.ok) {
      console.error("[BNDES] Erro:", text)
      return NextResponse.json(
        { error: "Erro ao finalizar pedido", body: text },
        { status: 502 }
      )
    }

    return new NextResponse(text || "OK", { status: 200 })
  } catch (err: any) {
    console.error("[BNDES] Erro interno:", err)
    return NextResponse.json(
      { error: "Erro interno", message: err.message },
      { status: 500 }
    )
  }
}
