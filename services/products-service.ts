/**
 * =============================================================================
 * SERVICO DE PRODUTOS
 * =============================================================================
 * 
 * Este arquivo contem todas as funcoes de comunicacao com a API de produtos.
 * Responsabilidade: Encapsular chamadas HTTP e logica de negocio relacionada.
 * 
 * Estrutura:
 * - Dados mockados para simulacao
 * - Funcoes de simulacao (usadas enquanto backend nao esta pronto)
 * - Funcoes de API real (comentadas, prontas para uso)
 * 
 * IMPORTANTE: Para conectar ao backend real:
 * 1. Descomentar o bloco de codigo real dentro de cada funcao
 * 2. Remover ou comentar a simulacao correspondente
 * 3. Ajustar a URL base em /config/api.ts
 * =============================================================================
 */

import { API_CONFIG, buildApiUrl, getAuthHeaders } from "@/config/api"
import type {
  Product,
  ProductFormData,
  ProductSearchResult,
  ProductCSVUploadResult,
} from "@/types/product"

/**
 * =============================================================================
 * DADOS MOCKADOS PARA SIMULACAO
 * =============================================================================
 * 
 * Estes dados simulam respostas do backend durante o desenvolvimento.
 * Remova ou comente esta secao quando o backend estiver disponivel.
 */
const MOCK_PRODUCTS: Record<string, Product> = {
  "112233": {
    codigo: "112233",
    descricao: "Computador Desktop Empresarial i7 16GB",
    ncm: "8471.30.19",
    origemFiscal: "Nacional",
    statusBndes: "habilitado",
  },
  "223344": {
    codigo: "223344",
    descricao: "Monitor LED 27 polegadas Full HD",
    ncm: "8528.52.20",
    origemFiscal: "Importado",
    statusBndes: "nao_habilitado",
  },
  "334455": {
    codigo: "334455",
    descricao: "Impressora Multifuncional Laser",
    ncm: "8443.31.99",
    origemFiscal: "Nacional",
    statusBndes: "habilitado",
  },
}

/** Delay padrao para simular latencia de rede (ms) */
const MOCK_DELAY = 1000

/**
 * =============================================================================
 * FUNCOES DE SIMULACAO
 * =============================================================================
 * 
 * Estas funcoes simulam o comportamento do backend usando Promise + setTimeout.
 * Sao usadas enquanto o backend real nao esta disponivel.
 */

/**
 * Simula delay de rede
 */
function simulateNetworkDelay(ms: number = MOCK_DELAY): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Simula consulta de produto por codigo
 */
async function mockSearchProduct(codigo: string): Promise<ProductSearchResult> {
  await simulateNetworkDelay()

  const product = MOCK_PRODUCTS[codigo]

  if (product) {
    return { success: true, product }
  }

  return { success: true, notFound: true }
}

/**
 * Simula cadastro de produto manual
 */
async function mockRegisterProduct(data: ProductFormData): Promise<ProductSearchResult> {
  await simulateNetworkDelay(2000)

  // Simula validacao e retorno do produto cadastrado
  const newProduct: Product = {
    codigo: data.codigo,
    descricao: data.descricao,
    ncm: data.ncm,
    origemFiscal: data.origemFiscal || "Nacional",
    statusBndes: Math.random() > 0.3 ? "habilitado" : "nao_habilitado",
  }

  return { success: true, product: newProduct }
}

/**
 * Simula upload de CSV
 */
async function mockUploadCSV(_file: File): Promise<ProductCSVUploadResult> {
  await simulateNetworkDelay(3000)

  return {
    success: true,
    totalProcessed: 10,
    totalSuccess: 9,
    totalErrors: 1,
    errors: [{ line: 5, message: "NCM invalido" }],
  }
}

/**
 * =============================================================================
 * FUNCOES DE API REAL (EXPORTADAS)
 * =============================================================================
 * 
 * Estas sao as funcoes que os componentes utilizam.
 * Cada funcao contem:
 * - Codigo de simulacao ativo
 * - Codigo real comentado, pronto para ser ativado
 */

/**
 * Consulta produto por codigo
 * 
 * @param codigo - Codigo do produto a ser consultado
 * @param token - Token JWT para autenticacao (opcional)
 * @returns Resultado da consulta com produto ou indicacao de nao encontrado
 * 
 * Endpoint real: GET /api/products/:codigo
 */
export async function searchProduct(
  codigo: string,
  token?: string
): Promise<ProductSearchResult> {
  /**
   * ===========================================================================
   * SIMULACAO - Remover/comentar quando backend estiver pronto
   * ===========================================================================
   */
  return mockSearchProduct(codigo)

  /**
   * ===========================================================================
   * CODIGO REAL - Descomentar quando backend estiver pronto
   * ===========================================================================
   * 
   * try {
   *   const url = buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS.GET_BY_CODE, { codigo })
   *   
   *   const response = await fetch(url, {
   *     method: "GET",
   *     headers: getAuthHeaders(token),
   *   })
   * 
   *   // Produto nao encontrado
   *   if (response.status === 404) {
   *     return { success: true, notFound: true }
   *   }
   * 
   *   // Erro na requisicao
   *   if (!response.ok) {
   *     const errorData = await response.json().catch(() => ({}))
   *     throw new Error(errorData.message || "Erro ao consultar produto")
   *   }
   * 
   *   // Sucesso
   *   const product: Product = await response.json()
   *   return { success: true, product }
   * 
   * } catch (error) {
   *   const message = error instanceof Error ? error.message : "Erro desconhecido"
   *   return { success: false, error: message }
   * }
   */
}

/**
 * Cadastra novo produto manualmente
 * 
 * @param data - Dados do formulario de cadastro
 * @param token - Token JWT para autenticacao (opcional)
 * @returns Resultado do cadastro com produto criado
 * 
 * Endpoint real: POST /api/products
 * Body: { codigo, descricao, ncm, origemFiscal }
 */
export async function registerProduct(
  data: ProductFormData,
  token?: string
): Promise<ProductSearchResult> {
  /**
   * ===========================================================================
   * SIMULACAO - Remover/comentar quando backend estiver pronto
   * ===========================================================================
   */
  return mockRegisterProduct(data)

  /**
   * ===========================================================================
   * CODIGO REAL - Descomentar quando backend estiver pronto
   * ===========================================================================
   * 
   * try {
   *   const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.CREATE}`
   *   
   *   const response = await fetch(url, {
   *     method: "POST",
   *     headers: getAuthHeaders(token),
   *     body: JSON.stringify(data),
   *   })
   * 
   *   if (!response.ok) {
   *     const errorData = await response.json().catch(() => ({}))
   *     throw new Error(errorData.message || "Erro ao cadastrar produto")
   *   }
   * 
   *   const product: Product = await response.json()
   *   return { success: true, product }
   * 
   * } catch (error) {
   *   const message = error instanceof Error ? error.message : "Erro desconhecido"
   *   return { success: false, error: message }
   * }
   */
}

/**
 * Faz upload de arquivo CSV para cadastro em lote
 * 
 * @param file - Arquivo CSV selecionado
 * @param token - Token JWT para autenticacao (opcional)
 * @returns Resultado do processamento do CSV
 * 
 * Endpoint real: POST /api/products/upload-csv
 * Body: FormData com campo "file"
 */
export async function uploadProductsCSV(
  file: File,
  token?: string
): Promise<ProductCSVUploadResult> {
  /**
   * ===========================================================================
   * SIMULACAO - Remover/comentar quando backend estiver pronto
   * ===========================================================================
   */
  return mockUploadCSV(file)

  /**
   * ===========================================================================
   * CODIGO REAL - Descomentar quando backend estiver pronto
   * ===========================================================================
   * 
   * try {
   *   const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.UPLOAD_CSV}`
   *   
   *   const formData = new FormData()
   *   formData.append("file", file)
   * 
   *   // Nota: Nao definir Content-Type para FormData, o browser faz automaticamente
   *   const headers: HeadersInit = {}
   *   if (token) {
   *     headers["Authorization"] = `Bearer ${token}`
   *   }
   * 
   *   const response = await fetch(url, {
   *     method: "POST",
   *     headers,
   *     body: formData,
   *   })
   * 
   *   if (!response.ok) {
   *     const errorData = await response.json().catch(() => ({}))
   *     throw new Error(errorData.message || "Erro ao processar arquivo CSV")
   *   }
   * 
   *   return await response.json()
   * 
   * } catch (error) {
   *   const message = error instanceof Error ? error.message : "Erro desconhecido"
   *   return {
   *     success: false,
   *     totalProcessed: 0,
   *     totalSuccess: 0,
   *     totalErrors: 1,
   *     errors: [{ line: 0, message }],
   *   }
   * }
   */
}

/**
 * Lista todos os produtos
 * 
 * @param token - Token JWT para autenticacao (opcional)
 * @returns Lista de produtos
 * 
 * Endpoint real: GET /api/products
 */
export async function listProducts(token?: string): Promise<Product[]> {
  /**
   * ===========================================================================
   * SIMULACAO - Remover/comentar quando backend estiver pronto
   * ===========================================================================
   */
  await simulateNetworkDelay()
  return Object.values(MOCK_PRODUCTS)

  /**
   * ===========================================================================
   * CODIGO REAL - Descomentar quando backend estiver pronto
   * ===========================================================================
   * 
   * try {
   *   const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.LIST}`
   *   
   *   const response = await fetch(url, {
   *     method: "GET",
   *     headers: getAuthHeaders(token),
   *   })
   * 
   *   if (!response.ok) {
   *     throw new Error("Erro ao listar produtos")
   *   }
   * 
   *   return await response.json()
   * 
   * } catch (error) {
   *   console.error("Erro ao listar produtos:", error)
   *   return []
   * }
   */
}
