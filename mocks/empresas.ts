/**
 * =============================================================================
 * DADOS MOCKADOS - EMPRESAS
 * =============================================================================
 * Centraliza todos os dados de empresas e filiais para consulta por CNPJ.
 * Preparado para futura substituicao por chamadas API REST.
 * =============================================================================
 */

export interface Endereco {
  rua: string
  numero: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  complemento?: string
  referencia?: string
}

export interface Filial {
  cnpj: string
  razaoSocial: string
  nomeFantasia: string
  endereco: Endereco
  codigo: string
}

export interface MockEmpresa {
  cnpj: string
  razaoSocial: string
  nomeFantasia: string
  endereco: Endereco
  statusBndes: boolean
  codigo: string
  filiais: Filial[]
}

export function formatEndereco(endereco: Endereco): string {
  const parts = [
    `${endereco.rua}, ${endereco.numero}`,
    endereco.complemento,
    endereco.bairro,
    `${endereco.cidade} - ${endereco.estado}`,
    endereco.cep,
  ].filter(Boolean)
  return parts.join(", ")
}

export const MOCK_EMPRESAS: MockEmpresa[] = [
  {
    cnpj: "33013710000140",
    razaoSocial: "Consultoria Dompieri",
    nomeFantasia: "Venda de sistemas Dompieri",
    endereco: {
      rua: "Rua Oriental",
      numero: "1122",
      bairro: "Centro",
      cidade: "Sao Paulo",
      estado: "SP",
      cep: "04456-000",
    },
    statusBndes: true,
    codigo: "ES001",
    filiais: [
      {
        cnpj: "33013710000260",
        razaoSocial: "Consultoria Dompieri Rio Preto",
        nomeFantasia: "Venda de sistemas Dompieri Rio Preto",
        endereco: {
          rua: "Rua Brasilia",
          numero: "1122",
          bairro: "Centro",
          cidade: "Rio Preto",
          estado: "SP",
          cep: "12456-000",
        },
        codigo: "LJ002",
      },
      {
        cnpj: "33013710000360",
        razaoSocial: "Consultoria Dompieri Mirassol",
        nomeFantasia: "Venda de sistemas Dompieri Mirassol",
        endereco: {
          rua: "Rua Brasilia",
          numero: "234",
          bairro: "Centro",
          cidade: "Mirassol",
          estado: "SP",
          cep: "13456-000",
        },
        codigo: "LJ003",
      },
    ],
  },
  {
    cnpj: "44360616000149",
    razaoSocial: "Comercio Digital Dompieri Ltda",
    nomeFantasia: "Dompieri Digital",
    endereco: {
      rua: "Av. Paulista",
      numero: "900",
      bairro: "Bela Vista",
      cidade: "Sao Paulo",
      estado: "SP",
      cep: "01310-100",
    },
    statusBndes: true,
    codigo: "LJ001",
    filiais: [
      {
        cnpj: "44360616000230",
        razaoSocial: "Comercio Digital Dompieri Campinas",
        nomeFantasia: "Dompieri Digital Campinas",
        endereco: {
          rua: "Rua Barao de Jaguara",
          numero: "500",
          bairro: "Centro",
          cidade: "Campinas",
          estado: "SP",
          cep: "13015-001",
        },
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

/**
 * Retorna todas as lojas (empresa + filiais) flat
 */
export function getAllLojas(): { codigo: string; nome: string; empresaCodigo: string }[] {
  const lojas: { codigo: string; nome: string; empresaCodigo: string }[] = []
  for (const emp of MOCK_EMPRESAS) {
    lojas.push({ codigo: emp.codigo, nome: emp.nomeFantasia, empresaCodigo: emp.codigo })
    for (const filial of emp.filiais) {
      lojas.push({ codigo: filial.codigo, nome: filial.nomeFantasia, empresaCodigo: emp.codigo })
    }
  }
  return lojas
}
