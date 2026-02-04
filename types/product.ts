/**
 * =============================================================================
 * TIPOS E INTERFACES DE PRODUTO
 * =============================================================================
 * 
 * Este arquivo contem todas as definicoes de tipos relacionados a produtos.
 * Responsabilidade: Definir contratos de dados para tipagem estatica.
 * 
 * Estrutura:
 * - Product: Entidade principal do produto
 * - ProductFormData: Dados do formulario de cadastro
 * - ProductSearchResult: Resultado de consulta de produto
 * - ProductCSVUploadResult: Resultado de upload em lote
 * - ProcessingStep: Etapa de processamento visual
 * =============================================================================
 */

/**
 * Status do produto no BNDES
 */
export type ProductBndesStatus = "habilitado" | "nao_habilitado"

/**
 * Origem fiscal do produto
 */
export type ProductOrigemFiscal = "nacional" | "importado" | "mercosul"

/**
 * Entidade principal do produto
 */
export interface Product {
  codigo: string
  descricao: string
  ncm: string
  origemFiscal: string
  statusBndes: ProductBndesStatus
}

/**
 * Dados do formulario de cadastro manual
 */
export interface ProductFormData {
  codigo: string
  descricao: string
  ncm: string
  origemFiscal: ProductOrigemFiscal | ""
}

/**
 * Resultado da consulta de produto
 */
export interface ProductSearchResult {
  success: boolean
  product?: Product
  notFound?: boolean
  error?: string
}

/**
 * Resultado do upload de CSV
 */
export interface ProductCSVUploadResult {
  success: boolean
  totalProcessed: number
  totalSuccess: number
  totalErrors: number
  errors?: Array<{
    line: number
    message: string
  }>
}

/**
 * Etapa de processamento visual
 */
export interface ProcessingStep {
  label: string
  duration: number
  completed: boolean
  active: boolean
}

/**
 * Configuracao das etapas de processamento
 */
export type ProcessingStepConfig = Omit<ProcessingStep, "completed" | "active">
