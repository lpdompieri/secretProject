/**
 * =============================================================================
 * DADOS MOCKADOS - EMPRESAS
 * =============================================================================
 * Centraliza todos os dados de empresas e filiais para consulta por CNPJ.
 * Preparado para futura substituicao por chamadas API REST.
 * =============================================================================
 */

export interface Filial {
  cnpj: string
  razaoSocial: string
  nomeFantasia: string
  endereco: string
  codigo: string
}

export interface MockEmpresa {
  cnpj: string
  razaoSocial: string
  nomeFantasia: string
  endereco: string
  statusBndes: string
  codigo: string
  filiais: Filial[]
}

export const MOCK_EMPRESAS: MockEmpresa[] = [
  {
    cnpj: "33013710000140",
    razaoSocial: "Consultoria Dompieri",
    nomeFantasia: "Venda de sistemas Dompieri",
    endereco: "Rua Oriental, 1122, Centro, Sao Paulo - SP - 04456-000",
    statusBndes: "Habilitada no BNDES",
    codigo: "ES001",
    filiais: [
      {
        cnpj: "33013710000260",
        razaoSocial: "Consultoria Dompieri Rio Preto",
        nomeFantasia: "Venda de sistemas Dompieri Rio Preto",
        endereco: "Rua Brasilia, 1122, Centro, Rio Preto - SP - 12456-000",
        codigo: "LJ002",
      },
      {
        cnpj: "33013710000360",
        razaoSocial: "Consultoria Dompieri Mirassol",
        nomeFantasia: "Venda de sistemas Dompieri Mirassol",
        endereco: "Rua Brasilia, 234, Centro, Mirassol - SP - 13456-000",
        codigo: "LJ003",
      },
    ],
  },
  {
    cnpj: "44360616000149",
    razaoSocial: "Comercio Digital Dompieri Ltda",
    nomeFantasia: "Dompieri Digital",
    endereco: "Av. Paulista, 900, Bela Vista, Sao Paulo - SP - 01310-100",
    statusBndes: "Habilitada no BNDES",
    codigo: "LJ001",
    filiais: [
      {
        cnpj: "44360616000230",
        razaoSocial: "Comercio Digital Dompieri Campinas",
        nomeFantasia: "Dompieri Digital Campinas",
        endereco: "Rua Barao de Jaguara, 500, Centro, Campinas - SP - 13015-001",
        codigo: "LJ004",
      },
    ],
  },
]

/**
 * Busca empresa por CNPJ
 */
export function findEmpresaByCnpj(cnpj: string): MockEmpresa | null {
  const cleanCnpj = cnpj.replace(/\D/g, "")
  return MOCK_EMPRESAS.find((e) => e.cnpj === cleanCnpj) || null
}

/**
 * Retorna lista simplificada de todas as empresas (para o select do Master)
 */
export function getAllEmpresas(): { codigo: string; nome: string }[] {
  return MOCK_EMPRESAS.map((e) => ({
    codigo: e.codigo,
    nome: e.nomeFantasia,
  }))
}
