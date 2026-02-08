import { getBndesToken } from "./bndes-auth"

export async function bndesFetch(
  url: string,
  options: RequestInit = {},
  retry = true
) {
  const token = await getBndesToken()

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })

  if (response.status === 401 && retry) {
    console.warn("[BNDES] Token expirado, refazendo token e retry")
    // força limpeza do cache
    ;(global as any).cachedToken = null
    return bndesFetch(url, options, false)
  }

  return response
}
