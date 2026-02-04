/**
 * =============================================================================
 * TIPOS E INTERFACES - PEDIDOS
 * =============================================================================
 * 
 * Responsabilidade: Definir a estrutura de dados para pedidos.
 * Garante tipagem forte e consistencia em toda a aplicacao.
 * =============================================================================
 */

// =============================================================================
// ENUMS E CONSTANTES
// =============================================================================

/**
 * Status possiveis de um pedido
 */
export type OrderStatus =
  | "EM_PROCESSO_PAGAMENTO"
  | "PAGO"
  | "FATURADO"
  | "CANCELADO"
  | "REJEICAO_PAGAMENTO"

/**
 * Labels amigaveis para exibicao dos status
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  EM_PROCESSO_PAGAMENTO: "Em Processo de Pagamento",
  PAGO: "Pago",
  FATURADO: "Faturado",
  CANCELADO: "Cancelado",
  REJEICAO_PAGAMENTO: "Rejeicao de Pagamento",
}

/**
 * Cores dos status para badges
 */
export const ORDER_STATUS_COLORS: Record<OrderStatus, { bg: string; text: string; border: string }> = {
  EM_PROCESSO_PAGAMENTO: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  PAGO: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
  FATURADO: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  CANCELADO: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
  REJEICAO_PAGAMENTO: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
}

// =============================================================================
// INTERFACES PRINCIPAIS
// =============================================================================

/**
 * Item de um pedido
 */
export interface OrderItem {
  id: string
  codigo: string
  descricao: string
  quantidade: number
  valorUnitario: number
  valorTotal: number
}

/**
 * Dados do cliente
 */
export interface CustomerData {
  nome: string
  cpfCnpj: string
  email: string
  telefone: string
  endereco: {
    logradouro: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    cep: string
  }
}

/**
 * Dados de pagamento do pedido
 */
export interface OrderPaymentData {
  formaPagamento: string
  parcelas: number
  valorParcela: number
  taxaJuros: number
  valorJuros: number
  valorTotal: number
  dataAprovacao?: string
  transacaoId?: string
  nsuHost?: string
  codigoAutorizacao?: string
}

/**
 * Estrutura completa de um pedido
 */
export interface Order {
  id: string
  numeroPedido: string
  dataEmissao: string
  loja: {
    nome: string
    cnpj: string
  }
  cliente: CustomerData
  itens: OrderItem[]
  subtotal: number
  desconto: number
  valorTotal: number
  status: OrderStatus
  pagamento?: OrderPaymentData
  notaFiscal?: {
    numero: string
    serie: string
    chaveAcesso: string
    dataEmissao: string
  }
}

/**
 * Comprovante de pagamento para exibicao
 */
export interface PaymentReceipt {
  numeroPedido: string
  data: string
  hora: string
  loja: string
  cnpjLoja: string
  valorOriginal: number
  parcelas: number
  taxaJuros: number
  valorJuros: number
  valorTotal: number
  valorParcela: number
  status: string
  transacaoId: string
  nsuHost: string
  codigoAutorizacao: string
  cartao: {
    bandeira: string
    finalCartao: string
  }
}

// =============================================================================
// INTERFACES PARA API
// =============================================================================

/**
 * Filtros para listagem de pedidos
 */
export interface OrderFilters {
  status?: OrderStatus
  dataInicio?: string
  dataFim?: string
  loja?: string
  search?: string
}

/**
 * Resposta da API de listagem de pedidos
 */
export interface OrderListResponse {
  success: boolean
  data: Order[]
  pagination?: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
  error?: string
}

/**
 * Resposta da API de detalhes do pedido
 */
export interface OrderDetailResponse {
  success: boolean
  data?: Order
  error?: string
}

/**
 * Request para envio de nota fiscal
 */
export interface SendInvoiceRequest {
  numeroPedido: string
  arquivo: File
}

/**
 * Resposta do envio de nota fiscal
 */
export interface SendInvoiceResponse {
  success: boolean
  message?: string
  error?: string
  notaFiscal?: {
    numero: string
    serie: string
    chaveAcesso: string
    dataEmissao: string
  }
}

/**
 * Request para reenvio de pagamento
 */
export interface ResendPaymentRequest {
  numeroPedido: string
  email?: string
}

/**
 * Resposta do reenvio de pagamento
 */
export interface ResendPaymentResponse {
  success: boolean
  message?: string
  error?: string
}
