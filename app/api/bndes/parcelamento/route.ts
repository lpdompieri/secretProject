export const runtime = "nodejs"

import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    console.log("[BNDES][ENV CHECK]", {
      API_BASE: process.env.BNDES_API_BASE,
      TOKEN_URL: process.env.BNDES_TOKEN_URL,
      CLIENT_ID: process.env.BNDES_CLIENT_ID ? "OK" : "MISSING",
      CLIENT_SECRET: process.env.BNDES_CLIENT_SECRET ? "OK" : "MISSING",
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("[BNDES] ERRO:", error)
    return NextResponse.json(
      { error: "Erro interno", message: error.message },
      { status: 500 }
    )
  }
}
