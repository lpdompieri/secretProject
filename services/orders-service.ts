/**
 * =============================================================================
 * SERVICO DE PEDIDOS
 * =============================================================================
 * 
 * Responsabilidade: Logica de negocios e comunicacao com backend para pedidos.
 * 
 * IMPORTANTE - INTEGRACAO COM BACKEND:
 * - Cada funcao possui dados MOCKADOS para desenvolvimento
 * - O codigo de integracao real esta COMENTADO
 * - Para conectar ao backend, descomente o bloco "INTEGRACAO REAL"
 * =============================================================================
 */

import { API_CONFIG, buildApiUrl, getAuthHeaders } from "@/config/api"
import type {
  Order,
  OrderStatus,
  OrderFilters,
  OrderListResponse,
  OrderDetailResponse,
  SendInvoiceResponse,
  ResendPaymentResponse,
  PaymentReceipt,
  OrderItem,
  CustomerData,
  OrderPaymentData,
} from "@/types/order"

// =============================================================================
// DADOS MOCKADOS
// =============================================================================

const LOJAS_VAREJO = [
  "Magazine Luiza",
  "Casas Bahia",
  "Ponto Frio",
  "Americanas",
  "Submarino",
  "Extra",
  "Carrefour",
  "Shoptime",
  "Fast Shop",
  "Ricardo Eletro",
]

const PRODUTOS_EXEMPLO: OrderItem[] = [
  { id: "1", codigo: "PROD001", descricao: "Notebook Dell Inspiron 15", quantidade: 1, valorUnitario: 3500, valorTotal: 3500 },
  { id: "2", codigo: "PROD002", descricao: "Monitor LG 27\" 4K", quantidade: 2, valorUnitario: 1800, valorTotal: 3600 },
  { id: "3", codigo: "PROD003", descricao: "Teclado Mecânico Logitech", quantidade: 1, valorUnitario: 450, valorTotal: 450 },
  { id: "4", codigo: "PROD004", descricao: "Mouse Gamer Razer", quantidade: 1, valorUnitario: 350, valorTotal: 350 },
  { id: "5", codigo: "PROD005", descricao: "Webcam Full HD", quantidade: 1, valorUnitario: 280, valorTotal: 280 },
  { id: "6", codigo: "PROD006", descricao: "Headset Bluetooth Sony", quantidade: 1, valorUnitario: 650, valorTotal: 650 },
  { id: "7", codigo: "PROD007", descricao: "SSD 1TB Samsung", quantidade: 2, valorUnitario: 520, valorTotal: 1040 },
  { id: "8", codigo: "PROD008", descricao: "Memoria RAM 16GB DDR4", quantidade: 2, valorUnitario: 320, valorTotal: 640 },
]

/**
 * Gera um cliente mockado
 */
function gerarClienteMock(): CustomerData {
  const nomes = ["João Silva", "Maria Santos", "Carlos Oliveira", "Ana Costa", "Pedro Souza"]
  const nome = nomes[Math.floor(Math.random() * nomes.length)]
  
  return {
    nome,
    cpfCnpj: `${Math.floor(Math.random() * 900 + 100)}.${Math.floor(Math.random() * 900 + 100)}.${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 90 + 10)}`,
    email: nome.toLowerCase().replace(" ", ".") + "@email.com",
    telefone: `(11) 9${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`,
    endereco: {
      logradouro: "Rua das Flores",
      numero: String(Math.floor(Math.random() * 1000 + 1)),
      bairro: "Centro",
      cidade: "São Paulo",
      estado: "SP",
      cep: "01310-100",
    },
  }
}

/**
 * Gera dados de pagamento mockados
 */
function gerarPagamentoMock(valorTotal: number, status: OrderStatus): OrderPaymentData | undefined {
  if (status === "EM_PROCESSO_PAGAMENTO" || status === "REJEICAO_PAGAMENTO") {
    return undefined
  }

  const parcelas = Math.floor(Math.random() * 12) + 1
  const taxaJuros = parcelas > 1 ? (parcelas - 1) * 5 : 0
  const valorJuros = valorTotal * (taxaJuros / 100)
  const valorComJuros = valorTotal + valorJuros

  return {
    formaPagamento: "Cartao BNDES",
    parcelas,
    valorParcela: valorComJuros / parcelas,
    taxaJuros,
    valorJuros,
    valorTotal: valorComJuros,
    dataAprovacao: new Date().toISOString(),
    transacaoId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
    nsuHost: `${Math.floor(Math.random() * 900000 + 100000)}`,
    codigoAutorizacao: `${Math.floor(Math.random() * 900000 + 100000)}`,
  }
}

/**
 * Gera lista de pedidos mockados
 */
function gerarPedidosMock(): Order[] {
  const statuses: OrderStatus[] = [
    "EM_PROCESSO_PAGAMENTO",
    "PAGO",
    "FATURADO",
    "CANCELADO",
    "REJEICAO_PAGAMENTO",
  ]

  const pedidos: Order[] = []

  for (let i = 0; i < 15; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const loja = LOJAS_VAREJO[Math.floor(Math.random() * LOJAS_VAREJO.length)]
    
    // Selecionar 1-4 itens aleatorios
    const numItens = Math.floor(Math.random() * 4) + 1
    const itensShuffled = [...PRODUTOS_EXEMPLO].sort(() => Math.random() - 0.5)
    const itensPedido = itensShuffled.slice(0, numItens).map((item, idx) => ({
      ...item,
      id: `${i}-${idx}`,
      quantidade: Math.floor(Math.random() * 3) + 1,
    }))
    
    // Recalcular valores
    itensPedido.forEach(item => {
      item.valorTotal = item.quantidade * item.valorUnitario
    })
    
    const subtotal = itensPedido.reduce((acc, item) => acc + item.valorTotal, 0)
    const desconto = Math.random() > 0.7 ? Math.floor(subtotal * 0.05) : 0

    const pedido: Order = {
      id: `ord-${i + 1}`,
      numeroPedido: `${2024000 + i + 1}`,
      dataEmissao: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      loja: {
        nome: loja,
        cnpj: `${Math.floor(Math.random() * 90 + 10)}.${Math.floor(Math.random() * 900 + 100)}.${Math.floor(Math.random() * 900 + 100)}/0001-${Math.floor(Math.random() * 90 + 10)}`,
      },
      cliente: gerarClienteMock(),
      itens: itensPedido,
      subtotal,
      desconto,
      valorTotal: subtotal - desconto,
      status,
      pagamento: gerarPagamentoMock(subtotal - desconto, status),
    }

    // Adicionar NF para pedidos faturados
    if (status === "FATURADO") {
      pedido.notaFiscal = {
        numero: `${Math.floor(Math.random() * 90000 + 10000)}`,
        serie: "1",
        chaveAcesso: `35${Date.now()}${Math.floor(Math.random() * 1000000000)}`,
        dataEmissao: new Date().toISOString(),
      }
    }

    pedidos.push(pedido)
  }

  return pedidos
}

// Cache dos pedidos mockados
let pedidosMockados: Order[] | null = null

function getPedidosMock(): Order[] {
  if (!pedidosMockados) {
    pedidosMockados = gerarPedidosMock()
  }
  return pedidosMockados
}

// =============================================================================
// FUNCOES DE SERVICO
// =============================================================================

/**
 * Lista todos os pedidos
 * 
 * @param filters - Filtros opcionais
 * @returns Promise com lista de pedidos
 * 
 * INTEGRACAO: GET /api/orders
 */
export async function listarPedidos(filters?: OrderFilters): Promise<OrderListResponse> {
  // =========================================================================
  // INTEGRACAO REAL COM API (descomentar quando backend estiver pronto)
  // =========================================================================
  /*
  try {
    const queryParams = new URLSearchParams()
    
    if (filters?.status) queryParams.append("status", filters.status)
    if (filters?.dataInicio) queryParams.append("dataInicio", filters.dataInicio)
    if (filters?.dataFim) queryParams.append("dataFim", filters.dataFim)
    if (filters?.loja) queryParams.append("loja", filters.loja)
    if (filters?.search) queryParams.append("search", filters.search)
    
    const url = `${buildApiUrl(API_CONFIG.ENDPOINTS.ORDERS.LIST)}?${queryParams.toString()}`
    
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(localStorage.getItem("token") || undefined),
    })
    
    if (!response.ok) {
      throw new Error(`Erro ao listar pedidos: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error("[orders-service] Erro ao listar pedidos:", error)
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
  */

  // =========================================================================
  // DADOS MOCKADOS (remover quando integrar com backend)
  // =========================================================================
  return new Promise((resolve) => {
    setTimeout(() => {
      let pedidos = getPedidosMock()

      // Aplicar filtros
      if (filters?.status) {
        pedidos = pedidos.filter(p => p.status === filters.status)
      }
      if (filters?.search) {
        const search = filters.search.toLowerCase()
        pedidos = pedidos.filter(p => 
          p.numeroPedido.includes(search) ||
          p.loja.nome.toLowerCase().includes(search)
        )
      }

      resolve({
        success: true,
        data: pedidos,
      })
    }, 800) // Simula latencia de rede
  })
}

/**
 * Busca detalhes de um pedido
 * 
 * @param numeroPedido - Numero do pedido
 * @returns Promise com detalhes do pedido
 * 
 * INTEGRACAO: GET /api/orders/:numeroPedido
 */
export async function buscarPedido(numeroPedido: string): Promise<OrderDetailResponse> {
  // =========================================================================
  // INTEGRACAO REAL COM API (descomentar quando backend estiver pronto)
  // =========================================================================
  /*
  try {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.ORDERS.GET_BY_ID, { id: numeroPedido })
    
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(localStorage.getItem("token") || undefined),
    })
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar pedido: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error("[orders-service] Erro ao buscar pedido:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
  */

  // =========================================================================
  // DADOS MOCKADOS (remover quando integrar com backend)
  // =========================================================================
  return new Promise((resolve) => {
    setTimeout(() => {
      const pedidos = getPedidosMock()
      const pedido = pedidos.find(p => p.numeroPedido === numeroPedido)

      if (pedido) {
        resolve({ success: true, data: pedido })
      } else {
        resolve({ success: false, error: "Pedido não encontrado" })
      }
    }, 500)
  })
}

/**
 * Reenvia dados do pagamento por email
 * 
 * @param numeroPedido - Numero do pedido
 * @returns Promise com resultado do reenvio
 * 
 * INTEGRACAO: POST /api/orders/:numeroPedido/resend-payment
 */
export async function reenviarPagamento(numeroPedido: string): Promise<ResendPaymentResponse> {
  // =========================================================================
  // INTEGRACAO REAL COM API (descomentar quando backend estiver pronto)
  // =========================================================================
  /*
  try {
    const url = `${buildApiUrl(API_CONFIG.ENDPOINTS.ORDERS.GET_BY_ID, { id: numeroPedido })}/resend-payment`
    
    const response = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(localStorage.getItem("token") || undefined),
    })
    
    if (!response.ok) {
      throw new Error(`Erro ao reenviar pagamento: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error("[orders-service] Erro ao reenviar pagamento:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
  */

  // =========================================================================
  // DADOS MOCKADOS (remover quando integrar com backend)
  // =========================================================================
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: "Dados do pagamento reenviados com sucesso",
      })
    }, 1500)
  })
}

/**
 * Envia nota fiscal para um pedido
 * 
 * @param numeroPedido - Numero do pedido
 * @param arquivo - Arquivo XML da NF
 * @returns Promise com resultado do envio
 * 
 * INTEGRACAO: POST /api/orders/:numeroPedido/invoice (multipart/form-data)
 */
export async function enviarNotaFiscal(
  numeroPedido: string,
  arquivo: File
): Promise<SendInvoiceResponse> {
  // =========================================================================
  // INTEGRACAO REAL COM API (descomentar quando backend estiver pronto)
  // =========================================================================
  /*
  try {
    const url = `${buildApiUrl(API_CONFIG.ENDPOINTS.ORDERS.GET_BY_ID, { id: numeroPedido })}/invoice`
    
    const formData = new FormData()
    formData.append("arquivo", arquivo)
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        // Nao definir Content-Type - o browser define automaticamente com boundary
      },
      body: formData,
    })
    
    if (!response.ok) {
      throw new Error(`Erro ao enviar nota fiscal: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error("[orders-service] Erro ao enviar nota fiscal:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
  */

  // =========================================================================
  // DADOS MOCKADOS (remover quando integrar com backend)
  // =========================================================================
  return new Promise((resolve) => {
    setTimeout(() => {
      // Atualiza o pedido mockado para faturado
      const pedidos = getPedidosMock()
      const pedido = pedidos.find(p => p.numeroPedido === numeroPedido)
      
      if (pedido) {
        pedido.status = "FATURADO"
        pedido.notaFiscal = {
          numero: `${Math.floor(Math.random() * 90000 + 10000)}`,
          serie: "1",
          chaveAcesso: `35${Date.now()}${Math.floor(Math.random() * 1000000000)}`,
          dataEmissao: new Date().toISOString(),
        }
      }

      resolve({
        success: true,
        message: "Nota fiscal enviada com sucesso",
        notaFiscal: pedido?.notaFiscal,
      })
    }, 2000)
  })
}

/**
 * Gera comprovante de pagamento
 * 
 * @param pedido - Pedido com dados de pagamento
 * @returns Comprovante formatado
 */
export function gerarComprovante(pedido: Order): PaymentReceipt | null {
  if (!pedido.pagamento) {
    return null
  }

  const dataAprovacao = pedido.pagamento.dataAprovacao 
    ? new Date(pedido.pagamento.dataAprovacao)
    : new Date()

  return {
    numeroPedido: pedido.numeroPedido,
    data: dataAprovacao.toLocaleDateString("pt-BR"),
    hora: dataAprovacao.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    loja: pedido.loja.nome,
    cnpjLoja: pedido.loja.cnpj,
    valorOriginal: pedido.valorTotal,
    parcelas: pedido.pagamento.parcelas,
    taxaJuros: pedido.pagamento.taxaJuros,
    valorJuros: pedido.pagamento.valorJuros,
    valorTotal: pedido.pagamento.valorTotal,
    valorParcela: pedido.pagamento.valorParcela,
    status: pedido.status === "PAGO" ? "Aprovado" : pedido.status === "FATURADO" ? "Faturado" : "Cancelado",
    transacaoId: pedido.pagamento.transacaoId || "",
    nsuHost: pedido.pagamento.nsuHost || "",
    codigoAutorizacao: pedido.pagamento.codigoAutorizacao || "",
    cartao: {
      bandeira: "BNDES",
      finalCartao: "****",
    },
  }
}
