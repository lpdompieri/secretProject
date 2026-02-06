/**
 * =============================================================================
 * DADOS MOCKADOS - USUARIOS
 * =============================================================================
 * Centraliza todos os dados de usuarios para uso em login, consulta e gerenciamento.
 * Preparado para futura substituicao por chamadas API REST.
 * =============================================================================
 */

export interface MockUser {
  cpf: string
  email: string
  password: string
  name: string
  telefone: string
  empresa: string
  perfil: "Vendedor" | "Gerente" | "Financeiro" | "Master"
}

export const MOCK_USERS: MockUser[] = [
  {
    cpf: "37833710805",
    email: "lpdompieri@gmail.com",
    password: "q1w2e3r$",
    name: "Luis Dompieri",
    telefone: "(17) 99812-3456",
    empresa: "ES001",
    perfil: "Vendedor",
  },
  {
    cpf: "40928019802",
    email: "dhdompieri@gmail.com",
    password: "112233",
    name: "Danielle Dompieri",
    telefone: "(11) 98765-4321",
    empresa: "LJ001",
    perfil: "Gerente",
  },
  {
    cpf: "99999999999",
    email: "master@gmail.com",
    password: "master",
    name: "User Master",
    telefone: "(11) 90000-0000",
    empresa: "",
    perfil: "Master",
  },
]

/**
 * Busca usuario por email e senha (mock de autenticacao)
 */
export function findUserByCredentials(email: string, password: string): MockUser | null {
  return MOCK_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  ) || null
}

/**
 * Busca usuario por CPF (mock de consulta)
 */
export function findUserByCpf(cpf: string): MockUser | null {
  const cleanCpf = cpf.replace(/\D/g, "")
  return MOCK_USERS.find((u) => u.cpf === cleanCpf) || null
}
