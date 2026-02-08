// app/api/bndes/_lib/bndes-auth.ts

type GetTokenParams = {
  tokenUrl: string
  clientId: string
  clientSecret: string
}

type CachedAuth = {
  token: string
  cookie?: string
  expiresAt: number
}

let cachedAuth: CachedAuth | null = null

export async function getBndesToken({
  tokenUrl,
  clientId,
  clientSecret,
}: GetTokenParams): Promise<{ token: string; cookie?: string }> {
  console.log("[BNDES-AUTH] obtendo token")

  // reutiliza token válido
  if (cachedAuth && Date.now() < cachedAuth.expiresAt) {
    console.log("[BNDES-AUTH] usando token em cache")
    return {
      token: cachedAuth.token,
      cookie: cachedAuth.cookie,
    }
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

  const setCookie = response.headers.get("set-cookie") ?? undefined

  cachedAuth = {
    token: data.access_token,
    cookie: setCookie,
    // margem de segurança de 60s
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  }

  console.log("[BNDES-AUTH] token obtido e cacheado")
  if (setCookie) {
    console.log("[BNDES-AUTH] cookie de sessão capturado")
  }

  return {
    token: cachedAuth.token,
    cookie: cachedAuth.cookie,
  }
}
