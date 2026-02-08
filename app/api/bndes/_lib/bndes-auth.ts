// app/api/bndes/_lib/bndes-auth.ts

console.log("[BNDES-AUTH] arquivo carregado")

export async function getBndesToken(): Promise<string> {
  const clientId = process.env.BNDES_CLIENT_ID
  const clientSecret = process.env.BNDES_CLIENT_SECRET
  const tokenUrl = process.env.BNDES_TOKEN_URL

  if (!clientId || !clientSecret || !tokenUrl) {
    throw new Error("Variáveis de ambiente do BNDES não configuradas")
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
    body: "grant_type=client_credentials",
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Erro ao obter token BNDES: ${text}`)
  }

  const data = await response.json()

  if (!data.access_token) {
    throw new Error("Token BNDES não retornado")
  }

  return data.access_token
}
