import { useEffect, useState } from "react"
import { fetchBndesInstallments } from "@/services/payment/bndes/bndes.installments"
import { BndesInstallmentOption } from "@/services/payment/bndes/bndes.types"

export function useBndesInstallments(
  token: string,
  cnpj: string,
  valorTotal: number
) {
  const [installments, setInstallments] = useState<BndesInstallmentOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return

    setLoading(true)

    fetchBndesInstallments(token, { cnpj, valorTotal })
      .then((res) => setInstallments(res.parcelas))
      .catch((err) => {
        console.error(err)
        setError("Erro ao consultar parcelamento no BNDES")
      })
      .finally(() => setLoading(false))
  }, [token, cnpj, valorTotal])

  return { installments, loading, error }
}
