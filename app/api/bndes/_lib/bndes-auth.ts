let cachedToken: string | null = null
let tokenExpiresAt: number | null = null

export async function getBndesToken(): Promise<string> {
  const now = Date.now()

  if (cachedToken && tokenExpiresAt && now < tokenExpiresAt) {
    console.log("[BNDES][AUTH] Usando token em cache")
    return cachedToken
  }

  console.log("[BNDES][AUTH] Gerando novo token")

  const response = await fetch(process.env.BNDES_TOKEN_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
const clientId = process.env.BNDES_CLIENT_ID
const clientSecret = process.env.BNDES_CLIENT_SECRET
const tokenUrl = process.env.BNDES_TOKEN_URL

if (!clientId || !clientSecret || !tokenUrl) {
  throw new Error("Variáveis de ambiente do BNDES não configuradas")
}

const basicAuth = Buffer.from(
  `${clientId}:${clientSecret}`
).toString("base64")

    },
    body: "grant_type=client_credentials",
  })

  if (!response.ok) {
    const text = await response.text()
    console.error("[BNDES][AUTH] Erro ao gerar token:", text)
    throw new Error("Erro ao gerar token BNDES")
  }

  const data = await response.json()

  cachedToken = data.access_token
  tokenExpiresAt = Date.now() + data.expires_in * 1000 - 60_000 // margem 1 min

  return cachedToken!
}
