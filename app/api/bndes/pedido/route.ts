export const runtime = "nodejs"

import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const bndesResp = await fetch(
      "https://apigw-h.bndes.gov.br/cbn-fornecedor/v1/pedido",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.BNDES_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    )

    const text = await bndesResp.text()

    console.log("[BNDES] Pedido criado:", text)

    if (!bndesResp.ok || !text) {
      return NextResponse.json(
        { error: "Pedido não retornado pelo BNDES" },
        { status: 500 }
      )
    }

    // ⚠️ DEVOLVE O TEXTO PURO PARA O FRONT (ISSO É O SEGREDO 💥)
    return new NextResponse(text, {
      status: 201,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  } catch (error: any) {
    console.error("[BNDES] Erro interno:", error)

    return NextResponse.json(
      { error: "Erro interno", message: error.message },
      { status: 500 }
    )
  }
}
