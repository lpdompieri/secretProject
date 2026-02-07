import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const valor = searchParams.get("valor")

    console.log("[BNDES][API] Requisicao recebida. Valor:", valor)

    if (!valor) {
      return NextResponse.json(
        { error: "Parametro valor obrigatorio" },
        { status: 400 }
      )
    }

    // ⚠️ Endpoint correto do BNDES (conforme Postman)
    const BNDES_BASE_URL =
      "https://apigw-h.bndes.gov.br/cbn-fornecedor/v1"

    const url = `${BNDES_BASE_URL}/simulacao/financiamento?valor=${valor}`

    console.log("[BNDES][API] Chamando BNDES:", url)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        // Authorization: `Bearer ${process.env.BNDES_TOKEN}`, // se exigir
      },
    })

    console.log("[BNDES][API] Status BNDES:", response.status)

    const text = await response.text()
    console.log("[BNDES][API] Body bruto:", text)

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Erro BNDES",
          status: response.status,
          body: text,
        },
        { status: 502 }
      )
    }

    const data = JSON.parse(text)

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[BNDES][API] ERRO FATAL:", error)

    return NextResponse.json(
      {
        error: "Erro interno",
        message: error?.message ?? "Erro desconhecido",
      },
      { status: 500 }
    )
  }
}
