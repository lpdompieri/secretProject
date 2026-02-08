// app/api/bndes/_lib/bndes-fetch.ts
export const runtime = "nodejs"

import { getBndesToken } from "./bndes-auth"

console.log("[BNDES-FETCH] arquivo carregado")

export async function bndesFetch(
  url: string,
  options: RequestInit = {},
  retry = true
) {
  console.log("[BNDES-FETCH] chamada iniciada")
  console.log("[BNDES-FETCH] URL:", url)

  const jsessionId = process.env.BNDES_JSESSIONID

  console.log("[BNDES-FETCH][ENV CHECK]", {
    BNDES_CLIENT_ID: !!process.env.BNDES_CLIENT_ID,
    BNDES_CLIENT_SECRET: !!process.env.BNDES_CLIENT_SECRET,
    BNDES_TOKEN_URL: !!process.env.BNDES_TOKEN_URL,
    BNDES_API_BASE: !!process.env.BNDES_API_BASE,
    BNDES_JSESSIONID: jsessionId ? "OK" : "MISSING",
  })

  let token: string

  try {
    console.log("[BNDES-FETCH] obtendo token...")
    token = await getBndesToken()
    console.log("[BNDES-FETCH] token obtido com sucesso")
  } catch (err) {
    console.error("[BNDES-FETCH] erro ao obter token", err)
    throw err
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  }

  // ⚠️ GAMBIA CONTROLADA (necessária para o Apigee do BNDES)
  if (jsessionId) {
    headers["Cookie"] = `JSESSIONID=${jsessionId}`
    console.warn("[BNDES-FETCH] ⚠️ usando JSESSIONID no header")
  }

  let response: Response

  try {
    response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    })
  } catch (err) {
    console.error("[BNDES-FETCH] erro no fetch", err)
    throw err
  }

  console.log("[BNDES-FETCH] HTTP STATUS:", response.status)

  if (response.status === 401 && retry) {
    console.warn("[BNDES-FETCH] 401 recebido — retry com novo token")
    ;(global as any).cachedToken = null
    return bndesFetch(url, options, false)
  }

  return response
}
