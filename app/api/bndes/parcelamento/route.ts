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

    // ⚠️ AJUSTE AQUI se necessario
    const BNDES_BASE_URL = "https://apigw-h.bndes.gov.br"

    const url = `${BNDES_BASE_URL}/simulacao/financiamento?valor=${valor}`

    console.log("[BNDES][API] Chamando BNDES:", url)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        // 🔐 Se o BNDES exigir token, descomente:
        // Authorization: `Bearer ${process.env.BNDES_TOKEN}`,
      },
    })

    console.log("[BNDES][API] Status BNDES:", response.status)

    const text = await response.text()
    console.log("[BNDES][API] Body bruto:", text)

    if (!response.ok) {
      return NextResponse.json(
        { error: "Erro BNDES", status: response.status, body: text },
        { status: 502 }
      )
    }

    const data = JSON.parse(text)

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[BNDES][API] ERRO FATAL:", error)
    return NextResponse.json(
      { error: "Erro interno", message: error?.message },
      { sta
