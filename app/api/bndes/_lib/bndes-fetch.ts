type BndesFetchParams = {
  url: string
  tokenUrl: string
  clientId: string
  clientSecret: string
}

import { getBndesToken } from "./bndes-auth"

export async function bndesFetch({
  url,
  tokenUrl,
  clientId,
  clientSecret,
}: BndesFetchParams) {
  console.log("[BNDES-FETCH] URL:", url)

  const token = await getBndesToken({
    tokenUrl,
    clientId,
    clientSecret,
  })

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })

  console.log("[BNDES-FETCH] STATUS:", response.status)
  return response
}
