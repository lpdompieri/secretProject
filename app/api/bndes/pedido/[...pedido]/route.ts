export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { bndesFetch } from "../../_lib/bndes-fetch"

const BNDES_BASE =
  "https://apigw-h.bndes.gov.br/cbn-fornecedor/v1"

export async function PUT(
  req: Request,
  { params }: { params: { pedido: string[] } }
) {
  try {
    const body = await req.json()

    const pedido = params?.pedido?.[0]

    console.log("[BNDES][PUT] Pedido recebido:", pedido)

    if (!pedido) {
      return NextResponse.json(
        { error: "Número do pedido obrigatório" },
        { status: 400 }
      )
    }

    const url = `${BNDES_BASE}/pedido/${pedido}`

    const response = await bndesFetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json(
        { error: "Erro ao finalizar pedido", body: text },
        { status: 502 }
      )
    }

    const text = await response.text()
    return new NextResponse(text || "OK", { status: 200 })
  } catch (err: any) {
    return NextResponse.json(
      { error: "Erro interno", message: err.message },
      { status: 500 }
    )
  }
}
