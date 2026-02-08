// app/api/bndes/_lib/bndes-fetch.ts

console.log("[BNDES-FETCH] arquivo carregado")

import { getBndesToken } from "./bndes-auth"

export async function bndesFetch(
  url: string,
  options: RequestInit = {},
  retry = true
) {
  console.log("[BNDES-FETCH] chamada iniciada")
  console.log("[BNDES-FETCH] URL:", url)

  console.log("[BNDES-FETCH][ENV CHECK]", {
    BNDES_CLIENT_ID: process.env.BNDES_CLIENT_ID,
    BNDES_CLIENT_SECRET: process.env.BNDES_CLIENT_SECRET ? "***" : undefined,
    BNDES_TOKEN_URL: process.env.BNDES_TOKEN_URL,
    BNDES_API_BASE: process.env.BNDES_API_BASE,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
  })

  let token: string

  try {
    console.log("[BNDES-FETCH] buscando token...")
    token = await getBndesToken()
    console.log("[BNDES-FETCH] token obtido OK")
  } catch (err: any) {
    console.error("[BNDES-FETCH] ERRO AO OBTER TOKEN")
    console.error(err)
    throw err
  }

  let response: Response

  try {
    response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
  } catch (err: any) {
    console.error("[BNDES-FETCH] ERRO NO FETCH")
    console.error(err)
    throw err
  }

  console.log("[BNDES-FETCH] HTTP STATUS:", response.status)

  if (response.status === 401 && retry) {
    console.warn("[BNDES-FETCH] 401 recebido — token inválido/expirado")
    console.warn("[BNDES-FETCH] limpando cache e refazendo chamada")

    ;(global as any).cachedToken = null

    return bndesFetch(url, options, false)
  }

  return response
}
