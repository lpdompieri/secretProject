export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { bndesFetch } from "../_lib/bndes-fetch"

const BNDES_BASE =
  "https://apigw-h.bndes.gov.br/cbn-fornecedor/v1"

export async function POST(req: Request) {
  try {
    const { pedido } = await req.json()

    if (!pedido) {
      return NextResponse.json(
        { error: "Número do pedido obrigatório" },
        { status: 400 }
      )
    }

    const url = `${BNDES_BASE}/pedido/${pedido}/captura/nfe`

    console.log("[BNDES] CAPTURA:", url)

    const response = await bndesFetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/xml",
      },
      body: "", // API exige body vazio
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: "Erro na captura", details: data },
        { status: 502 }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    console.error("Erro captura:", err)
    return NextResponse.json(
      { error: "Erro interno na captura" },
      { status: 500 }
    )
  }
}
