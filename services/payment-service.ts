/**
 * =============================================================================
 * SERVICO DE PAGAMENTOS
 * =============================================================================
 * 
 * Este arquivo contem todas as funcoes relacionadas ao modulo de pagamento.
 * Responsabilidade: Comunicacao com API e logica de negocios de pagamentos.
 * 
 * INTEGRACAO COM BACKEND:
 * Cada funcao contem um bloco comentado mostrando como fazer a chamada real
 * a API. Atualmente usa dados mockados com Promise + setTimeout para simular
 * latencia de rede.
 * 
 * Para conectar ao backend:
 * 1. Descomente o bloco "// === INTEGRACAO REAL COM API ==="
 * 2. Remova ou comente o bloco "// === MOCK (REMOVER EM PRODUCAO) ==="
 * 3. Configure as URLs em /config/api.ts
 * =============================================================================
 */

import { API_CONFIG, buildApiUrl, getAuthHeaders } from "@/config/api"
import type {
  Order,
  OrderConsultResult,
  InstallmentOption,
  ManagerAuthorizationResult,
  PaymentProcessResult,
  PaymentReceipt,
  PaymentProcessingStep,
} from "@/types/payment"

// =============================================================================
// CONSTANTES E CONFIGURACOES
// =============================================================================

/**
 * Taxa de juros por parcela adicional (5% por parcela)
 * 
 * Formula: juros = valorBase * (taxaPorParcela * (numeroParcelas - 1))
 * Exemplo para 12x: 10000 * (0.05 * 11) = 10000 * 0.55 = R$ 5.500 de juros
 */
export const TAXA_JUROS_POR_PARCELA = 0.05 // 5%

/**
 * Numero maximo de parcelas
 */
export const MAX_PARCELAS = 36

/**
 * Numero minimo de parcelas
 */
export const MIN_PARCELAS = 1

// =============================================================================
// FUNCOES DE CALCULO
// =============================================================================

/**
 * Calcula os juros para um determinado numero de parcelas
 * 
 * FORMULA:
 * - 1x: 0% de juros (sem acrescimo)
 * - 2x: 5% de juros
 * - 3x: 10% de juros
 * - Nx: (N-1) * 5% de juros
 * 
 * @param valorBase - Valor original do pedido
 * @param parcelas - Numero de parcelas (1 a 36)
 * @returns Objeto com todos os valores calculados
 */
export function calcularParcelamento(
  valorBase: number,
  parcelas: number
): InstallmentOption {
  // Validar numero de parcelas
  const parcelasValidas = Math.max(MIN_PARCELAS, Math.min(MAX_PARCELAS, parcelas))
  
  // Calcular taxa de juros: (parcelas - 1) * 5%
  // 1x = 0%, 2x = 5%, 3x = 10%, ..., 36x = 175%
  const taxaJuros = (parcelasValidas - 1) * TAXA_JUROS_POR_PARCELA * 100
  
  // Calcular valor dos juros
  const valorJuros = valorBase * (parcelasValidas - 1) * TAXA_JUROS_POR_PARCELA
  
  // Calcular valor total
  const valorTotal = valorBase + valorJuros
  
  // Calcular valor da parcela
  const valorParcela = valorTotal / parcelasValidas

  return {
    parcelas: parcelasValidas,
    taxaJuros,
    valorJuros,
    valorTotal,
    valorParcela,
  }
}

/**
 * Gera todas as opcoes de parcelamento disponiveis
 * 
 * @param valorBase - Valor original do pedido
 * @returns Array com todas as opcoes de 1x a 36x
 */
export function gerarOpcoesParcelamento(valorBase: number): InstallmentOption[] {
  const opcoes: InstallmentOption[] = []
  
  for (let i = MIN_PARCELAS; i <= MAX_PARCELAS; i++) {
    opcoes.push(calcularParcelamento(valorBase, i))
  }
  
  return opcoes
}

// =============================================================================
// SERVICOS DE API
// =============================================================================

/**
 * Consulta um pedido para pagamento
 * 
 * @param numeroPedido - Numero do pedido a consultar
 * @returns Resultado da consulta com dados do pedido ou erro
 * 
 * REGRAS DE NEGOCIO (MOCK):
 * - "123456": Pedido com produtos nao habilitados BNDES
 * - "234567": Cliente nao habilitado BNDES
 * - "345678": Pedido valido para pagamento
 * - Outros: Pedido nao encontrado
 */
export async function consultarPedidoParaPagamento(
  numeroPedido: string
): Promise<OrderConsultResult> {
  
  // === INTEGRACAO REAL COM API ===
  // Descomente este bloco quando o backend estiver pronto
  /*
  try {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.ORDERS.GET_BY_ID, { id: numeroPedido })
    
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(token), // Obter token do contexto de auth
    })

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        error: {
          type: errorData.code || "not_found",
          message: errorData.message || "Erro ao consultar pedido",
        },
      }
    }

    const data = await response.json()
    return {
      success: true,
      order: data,
    }
  } catch (error) {
    console.error("Erro ao consultar pedido:", error)
    return {
      success: false,
      error: {
        type: "not_found",
        message: "Erro de conexao com o servidor",
      },
    }
  }
  */
  // === FIM INTEGRACAO REAL ===

  // === MOCK (REMOVER EM PRODUCAO) ===
  return new Promise((resolve) => {
    setTimeout(() => {
      // Pedido com produtos nao habilitados
      if (numeroPedido === "123456") {
        resolve({
          success: false,
          error: {
            type: "invalid_products",
            message: "Pedido contem itens que nao podem ser pagos com o Cartao BNDES. Favor trocar por produtos similares que estejam habilitados no BNDES.",
          },
        })
        return
      }

      // Cliente nao habilitado
      if (numeroPedido === "234567") {
        resolve({
          success: false,
          error: {
            type: "invalid_customer",
            message: "Cliente nao habilitado para compras com cartao BNDES. Favor entrar em contato com o Banco.",
          },
        })
        return
      }

      // Pedido valido
      if (numeroPedido === "345678") {
        resolve({
          success: true,
          order: {
            numeroPedido: "345678",
            cliente: {
              nome: "Empresa Exemplo LTDA",
              cnpj: "12.345.678/0001-90",
            },
            dataPedido: new Date().toISOString(),
            itens: [
              {
                codigo: "PROD001",
                descricao: "Equipamento Industrial A",
                quantidade: 2,
                valorUnitario: 3500,
                valorTotal: 7000,
              },
              {
                codigo: "PROD002",
                descricao: "Pecas de Reposicao B",
                quantidade: 5,
                valorUnitario: 600,
                valorTotal: 3000,
              },
            ],
            valorBase: 10000,
            status: "available",
          },
        })
        return
      }

      // Pedido nao encontrado
      resolve({
        success: false,
        error: {
          type: "not_found",
          message: "Pedido nao encontrado ou nao disponivel para pagamento.",
        },
      })
    }, 1500) // Simula latencia de rede
  })
  // === FIM MOCK ===
}

/**
 * Valida codigo de autorizacao do gerente
 * 
 * @param codigo - Codigo de autorizacao informado
 * @returns Resultado da validacao
 * 
 * REGRA DE NEGOCIO (MOCK):
 * - Codigo valido: "9989"
 */
export async function validarAutorizacaoGerente(
  codigo: string
): Promise<ManagerAuthorizationResult> {
  
  // === INTEGRACAO REAL COM API ===
  // Descomente este bloco quando o backend estiver pronto
  /*
  try {
    const url = `${API_CONFIG.BASE_URL}/auth/manager-authorization`
    
    const response = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ codigo }),
    })

    if (!response.ok) {
      return {
        valid: false,
        error: "Codigo invalido",
      }
    }

    const data = await response.json()
    return {
      valid: true,
      managerName: data.managerName,
    }
  } catch (error) {
    console.error("Erro ao validar autorizacao:", error)
    return {
      valid: false,
      error: "Erro de conexao com o servidor",
    }
  }
  */
  // === FIM INTEGRACAO REAL ===

  // === MOCK (REMOVER EM PRODUCAO) ===
  return new Promise((resolve) => {
    setTimeout(() => {
      if (codigo === "9989") {
        resolve({
          valid: true,
          managerName: "Carlos Silva",
        })
      } else {
        resolve({
          valid: false,
          error: "Codigo invalido",
        })
      }
    }, 800)
  })
  // === FIM MOCK ===
}

/**
 * Processa o pagamento do pedido
 * 
 * @param numeroPedido - Numero do pedido
 * @param parcelamento - Opcao de parcelamento selecionada
 * @param codigoAutorizacao - Codigo de autorizacao do gerente
 * @param onStepChange - Callback para atualizar etapa do processamento
 * @returns Resultado do processamento com comprovante
 */
export async function processarPagamento(
  numeroPedido: string,
  parcelamento: InstallmentOption,
  codigoAutorizacao: string,
  onStepChange?: (step: PaymentProcessingStep) => void
): Promise<PaymentProcessResult> {
  
  // === INTEGRACAO REAL COM API ===
  // Descomente este bloco quando o backend estiver pronto
  /*
  try {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.PAYMENTS.PROCESS)
    
    onStepChange?.("initiating")
    
    const response = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify({
        numeroPedido,
        parcelas: parcelamento.parcelas,
        valorTotal: parcelamento.valorTotal,
        codigoAutorizacao,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        error: errorData.message || "Erro ao processar pagamento",
      }
    }

    const data = await response.json()
    return {
      success: true,
      receipt: data,
    }
  } catch (error) {
    console.error("Erro ao processar pagamento:", error)
    return {
      success: false,
      error: "Erro de conexao com o servidor",
    }
  }
  */
  // === FIM INTEGRACAO REAL ===

  // === MOCK (REMOVER EM PRODUCAO) ===
  return new Promise((resolve) => {
    // Etapa 1: Iniciando transacao (2 segundos)
    onStepChange?.("initiating")
    
    setTimeout(() => {
      // Etapa 2: Efetuando pagamento (3 segundos)
      onStepChange?.("processing")
      
      setTimeout(() => {
        // Etapa 3: Gerando comprovante (2 segundos)
        onStepChange?.("generating")
        
        setTimeout(() => {
          const now = new Date()
          const receipt: PaymentReceipt = {
            numeroTransacao: `TXN${Date.now()}`,
            numeroPedido,
            data: now.toLocaleDateString("pt-BR"),
            hora: now.toLocaleTimeString("pt-BR"),
            valorOriginal: parcelamento.valorTotal - parcelamento.valorJuros,
            juros: parcelamento.valorJuros,
            valorTotal: parcelamento.valorTotal,
            parcelas: parcelamento.parcelas,
            valorParcela: parcelamento.valorParcela,
            status: "approved",
            cliente: {
              nome: "Empresa Exemplo LTDA",
              cnpj: "12.345.678/0001-90",
            },
            autorizacao: {
              codigo: codigoAutorizacao,
              gerente: "Carlos Silva",
            },
          }
          
          resolve({
            success: true,
            receipt,
          })
        }, 2000) // Etapa 3
      }, 3000) // Etapa 2
    }, 2000) // Etapa 1
  })
  // === FIM MOCK ===
}

/**
 * Gera PDF do comprovante de pagamento (mock)
 * 
 * @param receipt - Dados do comprovante
 */
export function downloadComprovante(receipt: PaymentReceipt): void {
  // === INTEGRACAO REAL COM API ===
  // Descomente este bloco quando o backend estiver pronto
  /*
  const url = `${API_CONFIG.BASE_URL}/payments/${receipt.numeroTransacao}/receipt`
  window.open(url, "_blank")
  */
  // === FIM INTEGRACAO REAL ===

  // === MOCK (REMOVER EM PRODUCAO) ===
  // Simula download criando um arquivo de texto
  const content = `
COMPROVANTE DE PAGAMENTO - CARTAO BNDES
========================================

Transacao: ${receipt.numeroTransacao}
Data: ${receipt.data} ${receipt.hora}

DADOS DO PEDIDO
---------------
Numero do Pedido: ${receipt.numeroPedido}
Cliente: ${receipt.cliente.nome}
CNPJ: ${receipt.cliente.cnpj}

VALORES
-------
Valor Original: R$ ${receipt.valorOriginal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
Juros: R$ ${receipt.juros.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
Valor Total: R$ ${receipt.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}

PARCELAMENTO
------------
Parcelas: ${receipt.parcelas}x
Valor da Parcela: R$ ${receipt.valorParcela.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}

STATUS: ${receipt.status === "approved" ? "APROVADO" : "PENDENTE"}

Autorizacao: ${receipt.autorizacao.codigo}
Gerente: ${receipt.autorizacao.gerente || "N/A"}

========================================
Este comprovante e um documento oficial.
  `.trim()

  const blob = new Blob([content], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `comprovante-${receipt.numeroTransacao}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  // === FIM MOCK ===
}
