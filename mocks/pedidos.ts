/**
 * =============================================================================
 * DADOS MOCKADOS - PEDIDOS
 * =============================================================================
 * Centraliza pedidos fake vinculados a empresas/lojas existentes.
 * Usado para filtrar pedidos por empresa e loja selecionadas no header.
 * =============================================================================
 */

import type { Order, OrderStatus } from "@/types/order"

const STATUSES: OrderStatus[] = [
  "EM_PROCESSO_PAGAMENTO",
  "PAGO",
  "FATURADO",
  "CANCELADO",
  "REJEICAO_PAGAMENTO",
]

const CLIENTES = [
  "Joao Silva",
  "Maria Santos",
  "Carlos Oliveira",
  "Ana Costa",
  "Pedro Souza",
  "Fernanda Lima",
  "Ricardo Alves",
]

const PRODUTOS = [
  { codigo: "PROD001", descricao: "Notebook Dell Inspiron 15", valorUnitario: 3500 },
  { codigo: "PROD002", descricao: "Monitor LG 27\" 4K", valorUnitario: 1800 },
  { codigo: "PROD003", descricao: "Teclado Mecanico Logitech", valorUnitario: 450 },
  { codigo: "PROD004", descricao: "Mouse Gamer Razer", valorUnitario: 350 },
  { codigo: "PROD005", descricao: "Webcam Full HD", valorUnitario: 280 },
  { codigo: "PROD006", descricao: "Headset Bluetooth Sony", valorUnitario: 650 },
  { codigo: "PROD007", descricao: "SSD 1TB Samsung", valorUnitario: 520 },
  { codigo: "PROD008", descricao: "Memoria RAM 16GB DDR4", valorUnitario: 320 },
]

// Lojas vinculadas as empresas mockadas
const LOJAS = [
  { codigo: "ES001", nome: "Venda de sistemas Dompieri", empresaCodigo: "ES001" },
  { codigo: "LJ002", nome: "Dompieri Rio Preto", empresaCodigo: "ES001" },
  { codigo: "LJ003", nome: "Dompieri Mirassol", empresaCodigo: "ES001" },
  { codigo: "LJ001", nome: "Dompieri Digital", empresaCodigo: "LJ001" },
  { codigo: "LJ004", nome: "Dompieri Digital Campinas", empresaCodigo: "LJ001" },
]

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function gerarPedidosMock(): Order[] {
  const rand = seededRandom(42)
  const pedidos: Order[] = []

  for (let i = 0; i < 30; i++) {
    const loja = LOJAS[Math.floor(rand() * LOJAS.length)]
    const status = STATUSES[Math.floor(rand() * STATUSES.length)]
    const clienteNome = CLIENTES[Math.floor(rand() * CLIENTES.length)]
    const numItens = Math.floor(rand() * 3) + 1
    const itens = Array.from({ length: numItens }, (_, idx) => {
      const prod = PRODUTOS[Math.floor(rand() * PRODUTOS.length)]
      const qty = Math.floor(rand() * 3) + 1
      return {
        id: `${i}-${idx}`,
        codigo: prod.codigo,
        descricao: prod.descricao,
        quantidade: qty,
        valorUnitario: prod.valorUnitario,
        valorTotal: qty * prod.valorUnitario,
      }
    })

    const subtotal = itens.reduce((a, b) => a + b.valorTotal, 0)
    const desconto = rand() > 0.7 ? Math.floor(subtotal * 0.05) : 0
    const valorTotal = subtotal - desconto
    const diasAtras = Math.floor(rand() * 30)
    const dataEmissao = new Date(Date.now() - diasAtras * 86400000).toISOString()

    const hasPagamento = status === "PAGO" || status === "FATURADO" || status === "CANCELADO"
    const parcelas = Math.floor(rand() * 12) + 1
    const taxa = parcelas > 1 ? (parcelas - 1) * 0.5 : 0
    const valorJuros = valorTotal * (taxa / 100)

    const pedido: Order = {
      id: `ord-${i + 1}`,
      numeroPedido: `${2024000 + i + 1}`,
      dataEmissao,
      loja: {
        nome: loja.nome,
        cnpj: `00.000.000/0001-${String(i + 10).padStart(2, "0")}`,
        codigo: loja.codigo,
        empresaCodigo: loja.empresaCodigo,
      },
      cliente: {
        nome: clienteNome,
        cpfCnpj: `${String(Math.floor(rand() * 900 + 100))}.${String(Math.floor(rand() * 900 + 100))}.${String(Math.floor(rand() * 900 + 100))}-${String(Math.floor(rand() * 90 + 10))}`,
        email: clienteNome.toLowerCase().replace(" ", ".") + "@email.com",
        telefone: `(11) 9${Math.floor(rand() * 9000 + 1000)}-${Math.floor(rand() * 9000 + 1000)}`,
        endereco: {
          logradouro: "Rua das Flores",
          numero: String(Math.floor(rand() * 1000 + 1)),
          bairro: "Centro",
          cidade: "Sao Paulo",
          estado: "SP",
          cep: "01310-100",
        },
      },
      itens,
      subtotal,
      desconto,
      valorTotal,
      status,
      pagamento: hasPagamento ? {
        formaPagamento: "Cartao BNDES",
        parcelas,
        valorParcela: (valorTotal + valorJuros) / parcelas,
        taxaJuros: taxa,
        valorJuros,
        valorTotal: valorTotal + valorJuros,
        dataAprovacao: dataEmissao,
        transacaoId: `TXN${1000000 + i}`,
        nsuHost: String(100000 + i),
        codigoAutorizacao: String(200000 + i),
      } : undefined,
      notaFiscal: status === "FATURADO" ? {
        numero: String(10000 + i),
        serie: "1",
        chaveAcesso: `35${Date.now()}${i}`,
        dataEmissao,
      } : undefined,
    }

    pedidos.push(pedido)
  }

  return pedidos
}

let _cache: Order[] | null = null

export function getMockPedidos(): Order[] {
  if (!_cache) {
    _cache = gerarPedidosMock()
  }
  return _cache
}

/**
 * Filtra pedidos por empresa e loja
 * empresaCodigo = "" ou "TODAS" -> retorna todos
 */
export function filtrarPedidos(
  empresaCodigo: string,
  lojaCodigo?: string
): Order[] {
  let pedidos = getMockPedidos()
  if (empresaCodigo && empresaCodigo !== "TODAS") {
    pedidos = pedidos.filter((p) => p.loja.empresaCodigo === empresaCodigo)
  }
  if (lojaCodigo) {
    pedidos = pedidos.filter((p) => p.loja.codigo === lojaCodigo)
  }
  return pedidos
}
