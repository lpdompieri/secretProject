// app/api/bndes/_lib/bndes-fetch.ts
export const runtime = "nodejs"

import { getBndesToken } from "./bndes-auth"

export async function bndesFetch(
  url: string,
  options: RequestInit = {},
  retry = true
) {
  console.log("[BNDES-FETCH] URL:", url)

  const jsessionId = process.env.BNDES_JSESSIONID

  const token = await getBndesToken()

  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: token, // já vem "Bearer xxx"
  }

  if (jsessionId) {
    headers["Cookie"] = `JSESSIONID=${jsessionId}`
    console.warn("[BNDES-FETCH] usando JSESSIONID")
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  })

  console.log("[BNDES-FETCH] STATUS:", response.status)

  if (response.status === 401 && retry) {
    console.warn("[BNDES-FETCH] 401 — limpando cache e retry")
    ;(global as any).cachedToken = null
    return bndesFetch(url, options, false)
  }

  return response
}
