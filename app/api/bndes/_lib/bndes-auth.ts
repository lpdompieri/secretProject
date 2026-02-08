// app/api/bndes/_lib/bndes-auth.ts
export const runtime = "nodejs"

let cachedToken: {
  token: string
  expiresAt: number
} | null = null

export async function getBndesToken(): Promise<string> {
  console.log("[BNDES-AUTH] obtendo token")

  const clientId = process.env.BNDES_CLIENT_ID
  const clientSecret = process.env.BNDES_CLIENT_SECRET
  const tokenUrl = process.env.BNDES_TOKEN_URL

  if (!clientId || !clientSecret || !tokenUrl) {
    throw new Error("Variáveis de ambiente do BNDES não configuradas")
  }

  // cache simples (1h)
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    console.log("[BNDES-AUTH] token reutilizado do cache")
    return cachedToken.token
  }

  const basicAuth = Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString("base64")

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=cbnpagamento_vendas",
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Erro ao obter token BNDES: ${text}`)
  }

  const data = await response.json()

  if (!data.access_token || !data.token_type) {
    throw new Error("Token BNDES inválido")
  }

  const fullToken = `${data.token_type} ${data.access_token}`

  cachedToken = {
    token: fullToken,
    expiresAt: Date.now() + data.expires_in * 1000 - 60000,
  }

  console.log("[BNDES-AUTH] token gerado com sucesso")

  return fullToken
}
