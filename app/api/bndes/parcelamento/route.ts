import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const valor = searchParams.get("valor")

  if (!valor) {
    return NextResponse.json(
      { error: "Valor obrigatorio" },
      { status: 400 }
    )
  }

  const token = "TOKEN_BNDES_TESTE" // depois real

  const response = await fetch(
    `https://apigw-h.bndes.gov.br/simulacao/financiamento?valor=${valor}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  )

  const data = await response.json()

  return NextResponse.json(data)
}
