/**
 * =============================================================================
 * TIPOS DO MODULO DE PAGAMENTO
 * =============================================================================
 * 
 * Este arquivo define todas as interfaces e tipos relacionados ao modulo de
 * pagamento. Responsabilidade: Tipagem forte para garantir consistencia de dados.
 * 
 * Estrutura:
 * - Interfaces de dados (Order, Payment, Receipt)
 * - Tipos de status e erros
 * - Interfaces de request/response para API
 * =============================================================================
 */

/**
 * Status possiveis de um pedido para pagamento
 */
export type OrderPaymentStatus = 
  | "available"           // Disponivel para pagamento
  | "invalid_products"    // Contem produtos nao habilitados BNDES
  | "invalid_customer"    // Cliente nao habilitado BNDES
  | "not_found"           // Pedido nao encontrado
  | "already_paid"        // Ja foi pago

/**
 * Status do pagamento
 */
export type PaymentStatus = 
  | "pending"    // Aguardando processamento
  | "processing" // Em processamento
  | "approved"   // Aprovado
  | "rejected"   // Rejeitado
  | "cancelled"  // Cancelado

/**
 * Etapas do processamento de pagamento
 */
export type PaymentProcessingStep = 
  | "initiating"    // Iniciando transacao
  | "processing"    // Efetuando pagamento
  | "generating"    // Gerando comprovante

/**
 * Interface para item do pedido
 */
export interface OrderItem {
  codigo: string
  descricao: string
  quantidade: number
  valorUnitario: number
  valorTotal: number
}

/**
 * Interface para dados do pedido consultado
 */
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

/**
 * Interface para resultado da consulta de pedido
 */
export interface OrderConsultResult {
  success: boolean
  order?: Order
  error?: {
    type: OrderPaymentStatus
    message: string
  }
}

/**
 * Interface para opcao de parcelamento
 */
export interface InstallmentOption {
  parcelas: number
  taxaJuros: number      // Percentual de juros (ex: 5 = 5%)
  valorJuros: number     // Valor absoluto dos juros
  valorTotal: number     // Valor base + juros
  valorParcela: number   // Valor de cada parcela
}

/**
 * Interface para dados do checkout
 */
export interface CheckoutData {
  pedido: Order
  parcelamentoSelecionado: InstallmentOption | null
}

/**
 * Interface para comprovante de pagamento
 */
export interface PaymentReceipt {
  numeroTransacao: string
  numeroPedido: string
  data: string
  hora: string
  valorOriginal: number
  juros: number
  valorTotal: number
  parcelas: number
  valorParcela: number
  status: PaymentStatus
  cliente: {
    nome: string
    cnpj: string
  }
  autorizacao: {
    codigo: string
    gerente?: string
  }
}

/**
 * Interface para validacao de autorizacao do gerente
 */
export interface ManagerAuthorizationResult {
  valid: boolean
  managerName?: string
  error?: string
}

/**
 * Interface para resultado do processamento de pagamento
 */
export interface PaymentProcessResult {
  success: boolean
  receipt?: PaymentReceipt
  error?: string
}

// =============================================================================
// INTERFACES PARA DADOS DO CARTAO BNDES
// =============================================================================

/**
 * Dados do Cartao BNDES para pagamento
 * IMPORTANTE: Dados sensiveis - nunca persistir, apenas estado local
 */
export interface CardData {
  /** Numero do cartao (16 digitos) */
  numero: string
  /** Nome do titular como impresso no cartao */
  nomeTitular: string
  /** Validade no formato MM/AA */
  validade: string
  /** Codigo de seguranca (3 digitos) */
  cvv: string
  /** CPF do titular (11 digitos) */
  cpfTitular: string
}

/**
 * Erros de validacao do cartao
 */
export interface CardValidationErrors {
  numero?: string
  nomeTitular?: string
  validade?: string
  cvv?: string
  cpfTitular?: string
}

/**
 * Resultado da tokenizacao do cartao
 * INTEGRACAO: Este token sera enviado ao gateway de pagamento
 */
export interface CardTokenResult {
  success: boolean
  token?: string
  error?: string
}

/**
 * Payload para processamento de pagamento com cartao
 */
export interface PaymentPayload {
  /** Token do cartao (gerado pela tokenizacao) */
  cardToken: string
  /** Numero do pedido */
  numeroPedido: string
  /** Quantidade de parcelas */
  parcelas: number
  /** Valor total com juros */
  valorTotal: number
  /** Codigo de autorizacao do gerente */
  codigoAutorizacao: string
}

// =============================================================================
// INTERFACES PARA API (REQUEST/RESPONSE)
// =============================================================================

/**
 * Request para consulta de pedido
 */
export interface OrderConsultRequest {
  numeroPedido: string
}

/**
 * Response da consulta de pedido
 */
export interface OrderConsultResponse {
  success: boolean
  data?: Order
  error?: {
    code: string
    message: string
  }
}

/**
 * Request para processamento de pagamento
 */
export interface PaymentProcessRequest {
  numeroPedido: string
  parcelas: number
  valorTotal: number
  codigoAutorizacao: string
}

/**
 * Response do processamento de pagamento
 */
export interface PaymentProcessResponse {
  success: boolean
  data?: PaymentReceipt
  error?: {
    code: string
    message: string
  }
}
