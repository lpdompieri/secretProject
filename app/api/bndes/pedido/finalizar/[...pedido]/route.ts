export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { bndesFetch } from "../../../_lib/bndes-fetch"

const BNDES_BASE =
  "https://apigw-h.bndes.gov.br/cbn-fornecedor/v1"

export async function PUT(
  req: Request,
  { params }: { params: { pedido: string } }
) {
  console.log("🔥 PARAMS RECEBIDOS:", params)

  const pedido = params.pedido
  if (!pedido) {
    return NextResponse.json(
      { error: "Número do pedido obrigatório" },
      { status: 400 }
    )
  }

  const body = await req.json()

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
}
