export const runtime = "nodejs"

import { NextResponse } from "next/server"

const BNDES_BASE_URL =
  "https://apigw-h.bndes.gov.br/cbn-fornecedor/v1/pedido"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    console.log("[BNDES][PEDIDO] Body recebido:", body)

    const bndesResp = await fetch(BNDES_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.BNDES_TOKEN}`,
        "Content-Type": "application/json",

        // 🔥 SEM ISSO O BNDES FICA MALUCO
        Cookie: process.env.BNDES_JSESSIONID || "",
      },
      body: JSON.stringify(body),
    })

    const text = await bndesResp.text()

    console.log("[BNDES][PEDIDO] Status:", bndesResp.status)
    console.log(
      "[BNDES][PEDIDO] Headers:",
      Object.fromEntries(bndesResp.headers.entries())
    )
    console.log("[BNDES][PEDIDO] Body bruto:", text)

    if (!bndesResp.ok || !text) {
      return NextResponse.json(
        {
          error: "Pedido não retornado pelo BNDES",
          status: bndesResp.status,
          body: text,
        },
        { status: 500 }
      )
    }

    // ✅ DEVOLVE TEXTO PURO (NÚMERO DO PEDIDO)
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
