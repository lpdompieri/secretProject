import { NextResponse } from "next/server"
import { getBndesToken } from "../_lib/bndes-auth"

export const runtime = "nodejs"


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const valor = searchParams.get("valor")

    if (!valor) {
      return NextResponse.json(
        { error: "Valor obrigatório" },
        { status: 400 }
      )
    }

    const url = `${process.env.BNDES_API_BASE}/simulacao/financiamento?valor=${valor}`

    const response = await bndesFetch(url)

    if (!response.ok) {
      const text = await response.text()
      console.error("[BNDES] Erro:", text)
      return NextResponse.json(
        { error: "Erro BNDES", body: text },
        { status: 502 }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[BNDES] Erro interno:", error)
    return NextResponse.json(
      { error: "Erro interno", message: error.message },
      { status: 500 }
    )
  }
}
