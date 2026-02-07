export interface BndesInstallmentRequest {
  cnpj: string
  valorTotal: number
}

export interface BndesInstallmentOption {
  numeroParcelas: number
  valorParcela: number
  taxaJuros: number
  valorTotal: number
}

export interface BndesInstallmentResponse {
  parcelas: BndesInstallmentOption[]
}
