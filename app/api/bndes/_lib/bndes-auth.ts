type GetTokenParams = {
  tokenUrl: string
  clientId: string
  clientSecret: string
}

export async function getBndesToken({
  tokenUrl,
  clientId,
  clientSecret,
}: GetTokenParams): Promise<string> {
  console.log("[BNDES-AUTH] obtendo token")

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
