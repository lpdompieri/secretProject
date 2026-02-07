export async function fetchBndesInstallments(
  _token: string, // mantido apenas para compatibilidade futura
  valorTotal: number
) {
  const url = `/api/bndes/parcelamento?valor=${valorTotal}`

  console.log("[BNDES][SERVICE] GET:", url)

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  })

  console.log("[BNDES][SERVICE] Status:", response.status)

  if (!response.ok) {
    const text = await response.text()
    console.error("[BNDES][SERVICE] Erro bruto:", text)
    throw new Error(`Erro ao consultar parcelamento`)
  }

  const data = await response.json()

  console.log("[BNDES][SERVICE] Body:", data)

  return data
}
