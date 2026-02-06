import { NextResponse } from "next/server"

const LAMBDA_PRESIGNED_URL =
  process.env.PRESIGNED_UPLOAD_LAMBDA_URL!

const BASIC_AUTH =
  process.env.PRESIGNED_UPLOAD_BASIC_AUTH!

export async function POST() {
  try {
    /* ===============================
       1️⃣ VALIDAR ENV
    ================================ */
    if (!LAMBDA_PRESIGNED_URL || !BASIC_AUTH) {
      console.error("❌ ENV MISSING", {
        hasLambdaUrl: !!LAMBDA_PRESIGNED_URL,
        hasAuth: !!BASIC_AUTH,
      })

      return NextResponse.json(
        { error: "Configuração de ambiente inválida" },
        { status: 500 }
      )
    }

    console.log("1️⃣ Chamando Lambda para gerar presigned URL")

    /* ===============================
       2️⃣ CHAMAR LAMBDA
    ================================ */
    const res = await fetch(LAMBDA_PRESIGNED_URL, {
      method: "GET",
      headers: {
        Authorization: BASIC_AUTH,
      },
      cache: "no-store",
    })

    if (!res.ok) {
      const text = await res.text()

      console.error("❌ LAMBDA ERROR", {
        status: res.status,
        body: text,
      })

      return NextResponse.json(
        { error: "Erro ao gerar URL de upload" },
        { status: res.status }
      )
    }

    /* ===============================
       3️⃣ PARSE RESPONSE
    ================================ */
    const data = await res.json()

    console.log("2️⃣ Presigned URL gerada com sucesso", {
      key: data.key,
      expiresInSeconds: data.expiresInSeconds,
    })

    /* ===============================
       4️⃣ RETORNAR PARA O FRONT
    ================================ */
    return NextResponse.json({
      uploadUrl: data.uploadUrl,
      key: data.key,
      expiresInSeconds: data.expiresInSeconds,
    })
  } catch (err) {
    console.error("❌ PRESIGNED PROXY ERROR", err)

    return NextResponse.json(
      { error: "Erro interno ao gerar URL" },
      { status: 500 }
    )
  }
}
