import { NextResponse } from "next/server"

const LAMBDA_PRESIGNED_URL =
  process.env.PRESIGNED_UPLOAD_LAMBDA_URL!

const BASIC_AUTH =
  process.env.PRESIGNED_UPLOAD_BASIC_AUTH!

export async function POST() {
  try {
    if (!LAMBDA_PRESIGNED_URL || !BASIC_AUTH) {
      console.error("ENV MISSING", {
        hasLambdaUrl: !!LAMBDA_PRESIGNED_URL,
        hasAuth: !!BASIC_AUTH,
      })

      return NextResponse.json(
        { error: "Configuração de ambiente inválida" },
        { status: 500 }
      )
    }

    const res = await fetch(LAMBDA_PRESIGNED_URL, {
      method: "GET",
      headers: {
        Authorization: BASIC_AUTH,
      },
      cache: "no-store",
    })

    if (!res.ok) {
      const text = await res.text()
      console.error("LAMBDA ERROR", res.status, text)

      return NextResponse.json(
        { error: "Erro ao gerar URL de upload" },
        { status: res.status }
      )
    }

    const data = await res.json()

    return NextResponse.json({
      uploadUrl: data.uploadUrl,
      key: data.key,
      expiresInSeconds: data.expiresInSeconds,
    })
  } catch (err) {
    console.error("PRESIGNED PROXY ERROR", err)

    return NextResponse.json(
      { error: "Erro interno ao gerar URL" },
      { status: 500 }
    )
  }
}
