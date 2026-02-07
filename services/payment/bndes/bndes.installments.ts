export async function fetchBndesInstallments(
  token: string,
  payload: {
    cnpj: string
    valorTotal: number
  }
) {
  const url = `${process.env.NEXT_PUBLIC_BNDES_BASE_URL}/parcelamento`

  console.log("[BNDES][SERVICE] URL:", url)
  console.log("[BNDES][SERVICE] Token:", token)
  console.log("[BNDES][SERVICE] Payload:", payload)

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  console.log("[BNDES][SERVICE] Status:", response.status)

  const data = await response.json()

  console.log("[BNDES][SERVICE] Body:", data)

  if (!response.ok) {
    throw new Error(
      data?.message || `Erro HTTP ${response.status}`
    )
  }

  return data
}
