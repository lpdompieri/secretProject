const BNDES_BASE_URL = process.env.NEXT_PUBLIC_BNDES_BASE_URL!

export async function bndesFetch<T>(
  endpoint: string,
  token: string,
  body: unknown
): Promise<T> {
  const response = await fetch(`${BNDES_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.json()
    throw error
  }

  return response.json()
}
