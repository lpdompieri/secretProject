/**
 * =============================================================================
 * DADOS MOCKADOS - PEDIDOS
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

const VENDEDORES = ["Carlos Silva", "Juliana Martins", "Rafael Souza"]
const GERENTES = ["Marcos Oliveira", "Fernanda Lima"]

const PRODUTOS = [
  { codigo: "PROD001", descricao: "Notebook Dell Inspiron 15", valorUnitario: 3500 },
  { codigo: "PROD002", descricao: "Monitor LG 27\" 4K", valorUnitario: 1800 },
  { codigo: "PROD003", descricao: "Teclado Mecânico Logitech", valorUnitario: 450 },
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

  for (let i = 0; i < 15; i++) {
    const status = STATUSES[Math.floor(rand() * STATUSES.length)]
    const vendedor = VENDEDORES[Math.floor(rand() * VENDEDORES.length)]
    const gerente = GERENTES[Math.floor(rand() * GERENTES.length)]

    const itens = PRODUTOS.map((prod, idx) => ({
      id: `${i}-${idx}`,
      codigo: prod.codigo,
      descricao: prod.descricao,
      quantidade: 1,
      valorUnitario: prod.valorUnitario,
      valorTotal: prod.valorUnitario,
    }))

    const subtotal = itens.reduce((a, b) => a + b.valorTotal, 0)

    const pedido: Order = {
      id: `ord-${i}`,
      numeroPedido: `${2024000 + i}`,
      numeroPedidoBndes: `BNDES-${900000 + i}`,
      dataEmissao: new Date().toISOString(),
      vendedor,
      gerenteAprovador: gerente,
      loja: {
        nome: "Dompieri Sistemas",
        cnpj: "12.345.678/0001-99",
        codigo: "LJ001",
        empresaCodigo: "EMP001",
      },
      cliente: {
        nome: "Empresa Cliente LTDA",
        cpfCnpj: "45.678.912/0001-10", // sempre PJ
        email: "financeiro@cliente.com",
        telefone: "(11) 99999-9999",
        endereco: {
          logradouro: "Av Paulista",
          numero: "1000",
          bairro: "Bela Vista",
          cidade: "São Paulo",
          estado: "SP",
          cep: "01310-100",
        },
      },
      itens,
      subtotal,
      desconto: 0,
      valorTotal: subtotal,
      status,
      pagamento: {
        formaPagamento: "Cartao BNDES",
        parcelas: 3,
        valorParcela: subtotal / 3,
        taxaJuros: 1.5,
        valorJuros: subtotal * 0.015,
        valorTotal: subtotal * 1.015,
        dataAprovacao: new Date().toISOString(),
        transacaoId: `TXN${100000 + i}`,
        nsuHost: `${200000 + i}`,
        codigoAutorizacao: `${300000 + i}`,
        cpfPagador: "123.456.789-00",
      },
    }

    pedidos.push(pedido)
  }

  return pedidos
}

let _cache: Order[] | null = null

export function getMockPedidos(): Order[] {
  if (!_cache) _cache = gerarPedidosMock()
  return _cache
}
