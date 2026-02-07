export async function fetchBndesInstallments(
  token: string,
  valorTotal: number
) {
  const baseUrl = process.env.NEXT_PUBLIC_BNDES_BASE_URL

  if (!baseUrl) {
    throw new Error("BNDES_BASE_URL não configurada")
  }

  const url = `${baseUrl}/simulacao/financiamento?valor=${valorTotal}`

  console.log("[BNDES][SERVICE] GET:", url)
  console.log("[BNDES][SERVICE] Token:", token)

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })

  console.log("[BNDES][SERVICE] Status:", response.status)

  if (!response.ok) {
    const text = await response.text()
    console.error("[BNDES][SERVICE] Erro bruto:", text)
    throw new Error(`Erro BNDES ${response.status}`)
  }

  const data = await response.json()

  console.log("[BNDES][SERVICE] Body:", data)

  return data
}
