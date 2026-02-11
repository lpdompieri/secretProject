/**
 * =============================================================================
 * TIPOS DO MODULO DE PAGAMENTO
 * =============================================================================
 *
 * Responsabilidade:
 * - Garantir tipagem forte
 * - Padronizar fluxo BNDES real (criar → finalizar → pré-captura → captura)
 * - Evitar duplicidade de interfaces
 * =============================================================================
 */

// =============================================================================
// STATUS
// =============================================================================

export type OrderPaymentStatus =
  | "available"
  | "invalid_products"
  | "invalid_customer"
  | "not_found"
  | "already_paid"

export type PaymentStatus =
  | "pending"
  | "processing"
  | "approved"
  | "rejected"
  | "cancelled"

// Etapas do modal de processamento BNDES
export type BndesPaymentStep =
  | "precapturing"
  | "capturing"
  | "success"
  | "error"

// =============================================================================
// PEDIDO
// =============================================================================

export interface OrderItem {
  codigo: string
  descricao: string
  quantidade: number
  valorUnitario: number
  valorTotal: number
}

export interface Order {
  numeroPedido: string
  cliente: {
    nome: string
    cnpj: string
  }
  dataPedido: string
  itens: OrderItem[]
  valorBase: number
  status: OrderPaymentStatus
}

export interface OrderConsultResult {
  success: boolean
  order?: Order
  error?: {
    type: OrderPaymentStatus
    message: string
  }
}

// =============================================================================
// PARCELAMENTO
// =============================================================================

export interface InstallmentOption {
  parcelas: number
  taxaJuros: number
  valorJuros: number
  valorTotal: number
  valorParcela: number
}

// =============================================================================
// CARTAO BNDES
// =============================================================================

/**
 * Dados sensiveis — nunca persistir.
 */
export interface CardData {
  numero: string
  nomeTitular: string
  validade: string // MM/AA
  cvv: string
  cpfTitular: string
}

export interface CardValidationErrors {
  numero?: string
  nomeTitular?: string
  validade?: string
  cvv?: string
  cpfTitular?: string
}

// =============================================================================
// RECIBO FINAL (FLUXO REAL BNDES)
// =============================================================================

/**
 * Este é o comprovante final após:
 * - Pré-captura
 * - Captura
 */
// -----------------------------
// MONTAGEM DO COMPROVANTE FINAL
// -----------------------------

const receiptFinal: PaymentReceipt = {
  numeroPedidoInterno: order.numeroPedido,
  numeroPedidoBndes: numeroPedidoBndes,

  valorOriginal: order.valorBase,
  juros: parcelamento.valorJuros,
  valorTotal: parcelamento.valorTotal,
  parcelas: parcelamento.parcelas,
  valorParcela: parcelamento.valorParcela,

  // PRÉ-CAPTURA
  numeroAutorizacao: precapturaResp.numeroAutorizacao ?? "",
  tid: precapturaResp.tid ?? "",

  // CAPTURA
  situacao: capturaResp.situacao ?? 0,
  descricao: capturaResp.descricao ?? "",
  dataHoraCaptura: capturaResp.dataHoraCaptura ?? "",
  cnpjAdquirente: capturaResp.cnpjAdquirente ?? "",
}


// =============================================================================
// RESULTADO PROCESSAMENTO
// =============================================================================

export interface PaymentProcessResult {
  success: boolean
  receipt?: PaymentReceipt
  error?: string
}

// =============================================================================
// REQUEST / RESPONSE API
// =============================================================================

export interface OrderConsultRequest {
  numeroPedido: string
}

export interface OrderConsultResponse {
  success: boolean
  data?: Order
  error?: {
    code: string
    message: string
  }
}

export interface PaymentProcessRequest {
  numeroPedido: string
  parcelas: number
  valorTotal: number
  codigoAutorizacao: string
}

export interface PaymentProcessResponse {
  success: boolean
  data?: PaymentReceipt
  error?: {
    code: string
    message: string
  }
}
