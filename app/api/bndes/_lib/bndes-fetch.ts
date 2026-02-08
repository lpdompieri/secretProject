// app/api/bndes/_lib/bndes-fetch.ts

type BndesFetchParams = {
  url: string
  tokenUrl: string
  clientId: string
  clientSecret: string
  retry?: boolean
}

import { getBndesToken } from "./bndes-auth"

export async function bndesFetch({
  url,
  tokenUrl,
  clientId,
  clientSecret,
  retry = true,
}: BndesFetchParams) {
  console.log("[BNDES-FETCH] URL:", url)

  const { token, cookie } = await getBndesToken({
    tokenUrl,
    clientId,
    clientSecret,
  })

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
  })

  console.log("[BNDES-FETCH] STATUS:", response.status)

  // token inválido / sessão expirada
  if (response.status === 401 && retry) {
    console.warn("[BNDES-FETCH] 401 recebido, limpando cache e retry")

    // limpa cache global
    ;(global as any).cachedAuth = null

    return bndesFetch({
      url,
      tokenUrl,
      clientId,
      clientSecret,
      retry: false,
    })
  }

  return response
}
