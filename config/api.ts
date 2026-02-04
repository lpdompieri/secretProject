/**
 * =============================================================================
 * CONFIGURACAO CENTRALIZADA DA API
 * =============================================================================
 * 
 * Este arquivo centraliza todas as URLs e configuracoes da API REST.
 * Responsabilidade: Prover um unico ponto de configuracao para endpoints.
 * 
 * IMPORTANTE: Quando o backend estiver pronto, ajuste apenas este arquivo
 * para alterar as URLs de todos os servicos da aplicacao.
 * 
 * Exemplo de uso:
 *   import { API_CONFIG } from "@/config/api"
 *   fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.LIST}`)
 * =============================================================================
 */

/**
 * URL base da API
 * 
 * TODO: Alterar para a URL do backend de producao quando disponivel
 * Exemplos:
 * - Desenvolvimento local: "http://localhost:3001/api"
 * - Staging: "https://staging-api.seudominio.com.br/api"
 * - Producao: "https://api.seudominio.com.br/api"
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

/**
 * Timeout padrao para requisicoes (em milissegundos)
 */
export const API_TIMEOUT = 30000

/**
 * Configuracao completa da API
 */
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: API_TIMEOUT,

  /**
   * Endpoints organizados por dominio
   */
  ENDPOINTS: {
    /**
     * Endpoints de autenticacao
     */
    AUTH: {
      LOGIN: "/auth/login",
      LOGOUT: "/auth/logout",
      REFRESH: "/auth/refresh",
      ME: "/auth/me",
    },

    /**
     * Endpoints de produtos
     */
    PRODUCTS: {
      /** GET - Lista todos os produtos */
      LIST: "/products",
      /** GET - Busca produto por codigo: /products/:codigo */
      GET_BY_CODE: "/products",
      /** POST - Cadastra novo produto */
      CREATE: "/products",
      /** PUT - Atualiza produto: /products/:codigo */
      UPDATE: "/products",
      /** DELETE - Remove produto: /products/:codigo */
      DELETE: "/products",
      /** POST - Upload de CSV para cadastro em lote */
      UPLOAD_CSV: "/products/upload-csv",
    },

    /**
     * Endpoints do dashboard/cockpit
     */
    DASHBOARD: {
      /** GET - Dados do cockpit */
      STATS: "/dashboard/stats",
    },

    /**
     * Endpoints de usuarios
     */
    USERS: {
      LIST: "/users",
      GET_BY_ID: "/users",
      CREATE: "/users",
      UPDATE: "/users",
      DELETE: "/users",
    },

    /**
     * Endpoints de empresa
     */
    COMPANY: {
      GET: "/company",
      UPDATE: "/company",
    },

    /**
     * Endpoints de pedidos
     */
    ORDERS: {
      LIST: "/orders",
      GET_BY_ID: "/orders",
      CREATE: "/orders",
    },

    /**
     * Endpoints de pagamentos
     * 
     * Fluxo de pagamento:
     * 1. CONSULT_ORDER - Consulta pedido para verificar elegibilidade
     * 2. VALIDATE_AUTH - Valida codigo de autorizacao do gerente
     * 3. PROCESS - Processa o pagamento
     * 4. RECEIPT - Obtem comprovante em PDF
     */
    PAYMENTS: {
      /** GET - Lista todos os pagamentos */
      LIST: "/payments",
      /** GET - Busca pagamento por ID: /payments/:id */
      GET_BY_ID: "/payments",
      /** GET - Consulta pedido para pagamento: /payments/orders/:numeroPedido */
      CONSULT_ORDER: "/payments/orders",
      /** POST - Valida autorizacao do gerente */
      VALIDATE_AUTH: "/payments/validate-authorization",
      /** POST - Processa pagamento */
      PROCESS: "/payments/process",
      /** GET - Obtem comprovante PDF: /payments/:id/receipt */
      RECEIPT: "/payments",
    },
  },

  /**
   * Headers padrao para requisicoes JSON
   */
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
} as const

/**
 * Helper para construir URL completa do endpoint
 * 
 * @param endpoint - Caminho do endpoint (ex: API_CONFIG.ENDPOINTS.PRODUCTS.LIST)
 * @param params - Parametros opcionais para substituir na URL (ex: { codigo: "123" })
 * @returns URL completa
 * 
 * Exemplo:
 *   buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS.GET_BY_CODE, { id: "112233" })
 *   // Retorna: "/api/products/112233"
 */
export function buildApiUrl(endpoint: string, params?: Record<string, string>): string {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      // Adiciona o parametro como path parameter
      url = `${url}/${value}`
    })
  }

  return url
}

/**
 * Helper para obter headers com autenticacao
 * 
 * @param token - Token JWT do usuario
 * @returns Headers com Authorization
 */
export function getAuthHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = { ...API_CONFIG.DEFAULT_HEADERS }

  if (token) {
    ;(headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
  }

  return headers
}
