/**
 * =============================================================================
 * DADOS MOCKADOS - PERFIS E PERMISSOES
 * =============================================================================
 * Centraliza perfis de usuario e suas permissoes.
 * Preparado para futura substituicao por chamadas API REST.
 * =============================================================================
 */

export interface Permissao {
  id: string
  label: string
  descricao: string
}

export interface MockPerfil {
  nome: string
  descricao: string
  permissoes: string[] // ids das permissoes ativas
}

export const PERMISSOES: Permissao[] = [
  {
    id: "PEDIDO_VISUALIZAR",
    label: "Visualizar Pedidos",
    descricao: "Permite visualizar pedidos existentes",
  },
  {
    id: "PEDIDO_CRIAR",
    label: "Criar Pedidos",
    descricao: "Permite criar novos pedidos",
  },
  {
    id: "PEDIDO_APROVAR",
    label: "Aprovar Pedidos",
    descricao: "Permite aprovar pedidos pendentes",
  },
  {
    id: "PAGAMENTO_BNDES_EXECUTAR",
    label: "Executar Pagamento BNDES",
    descricao: "Permite executar pagamentos via Cartao BNDES",
  },
  {
    id: "NOTA_FISCAL_GERENCIAR",
    label: "Gerenciar Notas Fiscais",
    descricao: "Permite criar e gerenciar notas fiscais",
  },
]

export const MOCK_PERFIS: MockPerfil[] = [
  {
    nome: "Vendedor",
    descricao: "Perfil para vendedores da loja",
    permissoes: ["PEDIDO_VISUALIZAR", "PEDIDO_CRIAR"],
  },
  {
    nome: "Gerente",
    descricao: "Perfil para gerentes com acesso a aprovacao",
    permissoes: [
      "PEDIDO_VISUALIZAR",
      "PEDIDO_CRIAR",
      "PEDIDO_APROVAR",
      "PAGAMENTO_BNDES_EXECUTAR",
    ],
  },
  {
    nome: "Financeiro",
    descricao: "Perfil para equipe financeira",
    permissoes: [
      "PEDIDO_VISUALIZAR",
      "PAGAMENTO_BNDES_EXECUTAR",
      "NOTA_FISCAL_GERENCIAR",
    ],
  },
  {
    nome: "Master",
    descricao: "Perfil com acesso total ao sistema",
    permissoes: [
      "PEDIDO_VISUALIZAR",
      "PEDIDO_CRIAR",
      "PEDIDO_APROVAR",
      "PAGAMENTO_BNDES_EXECUTAR",
      "NOTA_FISCAL_GERENCIAR",
    ],
  },
]
