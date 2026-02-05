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
 * TIPOS AUXILIARES
 * =============================================================================
 */

export type ProductEligibilityResult = {
  success: boolean
  sku?: string
  eligible?: boolean
  ruleVersion?: string
  error?: string
}

/**
 * =============================================================================
 * DADOS MOCKADOS PARA SIMULACAO
 * =============================================================================
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
 */

function simulateNetworkDelay(ms: number = MOCK_DELAY): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function mockSearchProduct(codigo: string): Promise<ProductSearchResult> {
  await simulateNetworkDelay()

  const product = MOCK_PRODUCTS[codigo]

  if (product) {
    return { success: true, product }
  }

  return { success: true, notFound: true }
}

async function mockRegisterProduct(
  data: ProductFormData
): Promise<ProductSearchResult> {
  await simulateNetworkDelay(2000)

  const newProduct: Product = {
    codigo: data.codigo,
    descricao: data.descricao,
    ncm: data.ncm,
    origemFiscal: data.origemFiscal || "Nacional",
    statusBndes: Math.random() > 0.3 ? "habilitado" : "nao_habilitado",
  }

  return { success: true, product: newProduct }
}

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
 * Simula consulta de elegibilidade BNDES
 */
async function mockCheckBndesEligibility(
  sku: string
): Promise<ProductEligibilityResult> {
  await simulateNetworkDelay(800)

  return {
    success: true,
    sku,
    eligible: Math.random() > 0.3,
    ruleVersion: "2026.02",
  }
}

/**
 * =============================================================================
 * FUNCOES DE API REAL (EXPORTADAS)
 * =============================================================================
 */

export async function searchProduct(
  codigo: string,
  token?: string
): Promise<ProductSearchResult> {
  return mockSearchProduct(codigo)

  /*
  try {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS.GET_BY_CODE, { codigo })

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(token),
    })

    if (response.status === 404) {
      return { success: true, notFound: true }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || "Erro ao consultar produto")
    }

    const product: Product = await response.json()
    return { success: true, product }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido"
    return { success: false, error: message }
  }
  */
}

/**
 * Consulta elegibilidade do produto para pagamento via BNDES
 *
 * Endpoint real: GET /api/products/eligibility?sku=XXXX
 */
export async function checkBndesEligibility(
  sku: string
): Promise<ProductEligibilityResult> {
  return mockCheckBndesEligibility(sku)

  /*
  try {
    const url = `${API_CONFIG.BASE_URL}/products/eligibility?sku=${sku}`

    const response = await fetch(url, {
      method: "GET",
    })

    if (!response.ok) {
      throw new Error("Erro ao consultar elegibilidade BNDES")
    }

    const json = await response.json()

    return {
      success: true,
      sku: json.data.sku,
      eligible: json.data.eligible,
      ruleVersion: json.data.ruleVersion,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido"
    return { success: false, error: message }
  }
  */
}

export async function registerProduct(
  data: ProductFormData,
  token?: string
): Promise<ProductSearchResult> {
  return mockRegisterProduct(data)

  /*
  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.CREATE}`

    const response = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || "Erro ao cadastrar produto")
    }

    const product: Product = await response.json()
    return { success: true, product }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido"
    return { success: false, error: message }
  }
  */
}

export async function uploadProductsCSV(
  file: File,
  token?: string
): Promise<ProductCSVUploadResult> {
  return mockUploadCSV(file)

  /*
  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.UPLOAD_CSV}`

    const formData = new FormData()
    formData.append("file", file)

    const headers: HeadersInit = {}
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || "Erro ao processar arquivo CSV")
    }

    return await response.json()
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido"
    return {
      success: false,
      totalProcessed: 0,
      totalSuccess: 0,
      totalErrors: 1,
      errors: [{ line: 0, message }],
    }
  }
  */
}

export async function listProducts(token?: string): Promise<Product[]> {
  await simulateNetworkDelay()
  return Object.values(MOCK_PRODUCTS)

  /*
  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.LIST}`

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(token),
    })

    if (!response.ok) {
      throw new Error("Erro ao listar produtos")
    }

    return await response.json()
  } catch (error) {
    console.error("Erro ao listar produtos:", error)
    return []
  }
  */
}
