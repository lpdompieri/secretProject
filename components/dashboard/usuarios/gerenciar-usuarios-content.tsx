"use client"

import { useMemo, useState } from "react"
import {
  Search,
  UserCircle,
  Mail,
  Building2,
  ShieldCheck,
  Phone,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  Pencil,
  Plus,
  Users,
  Shield,
  UserCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { MOCK_USERS, type MockUser } from "@/mocks/users"
import { MOCK_PERFIS } from "@/mocks/perfis"
import { useAuth } from "@/contexts/auth-context"
import { useEmpresa } from "@/contexts/empresa-context"

type UsuarioView = "dashboard" | "search" | "details" | "register"

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(
    6,
    9
  )}-${digits.slice(9)}`
}

function getPerfilVariant(
  perfil: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (perfil) {
    case "Master":
      return "destructive"
    case "Gerente":
      return "default"
    case "Vendedor":
      return "secondary"
    default:
      return "outline"
  }
}

export function GerenciarUsuariosContent() {
  const { isMaster } = useAuth()
  const { empresas } = useEmpresa()

  const [view, setView] = useState<UsuarioView>("dashboard")
  const [cpfInput, setCpfInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [usuario, setUsuario] = useState<MockUser | null>(null)
  const [searchFilter, setSearchFilter] = useState("")

  const [localUsers, setLocalUsers] = useState<MockUser[]>([...MOCK_USERS])

  // ================= KPI =================

  const totalUsers = localUsers.length
  const totalMasters = localUsers.filter(u => u.perfil === "Master").length
  const totalGerentes = localUsers.filter(u => u.perfil === "Gerente").length
  const totalVendedores = localUsers.filter(u => u.perfil === "Vendedor").length

  // ================= FILTER =================

  const filteredUsers = useMemo(() => {
    return localUsers.filter((u) =>
      u.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      u.email.toLowerCase().includes(searchFilter.toLowerCase())
    )
  }, [searchFilter, localUsers])

  // ================= SEARCH CPF =================

  async function handleSearchCpf() {
    const cleanCpf = cpfInput.replace(/\D/g, "")
    if (cleanCpf.length !== 11) return

    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 600))

    const found = localUsers.find(u => u.cpf === cleanCpf) || null
    setIsLoading(false)

    if (found) {
      setUsuario(found)
      setView("details")
    } else {
      setView("register")
    }
  }

  function handleBack() {
    setView("dashboard")
    setUsuario(null)
    setCpfInput("")
  }

  // ================= DASHBOARD =================

  if (view === "dashboard") {
    return (
      <div className="space-y-8">

        {/* HEADER + ACTION BAR */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
            <p className="text-muted-foreground">
              Controle de acessos, perfis e permissões
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="h-10 w-full sm:w-64"
            />
            <Button
              onClick={() => setView("search")}
              className="h-10"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </div>
              <Users className="h-6 w-6 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Masters</p>
                <p className="text-2xl font-bold">{totalMasters}</p>
              </div>
              <Shield className="h-6 w-6 text-destructive" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gerentes</p>
                <p className="text-2xl font-bold">{totalGerentes}</p>
              </div>
              <UserCheck className="h-6 w-6 text-primary" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vendedores</p>
                <p className="text-2xl font-bold">{totalVendedores}</p>
              </div>
              <UserCircle className="h-6 w-6 text-secondary" />
            </CardContent>
          </Card>
        </div>

        {/* LISTA */}
        <Card>
          <CardHeader>
            <CardTitle>Usuários Cadastrados</CardTitle>
            <CardDescription>
              Lista completa com status e perfil
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">

            {filteredUsers.map((u) => (
              <div
                key={u.cpf}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-xl hover:bg-muted/40 transition"
              >
                <div>
                  <p className="font-semibold">{u.name}</p>
                  <p className="text-sm text-muted-foreground">{u.email}</p>
                </div>

                <div className="flex items-center gap-3 mt-3 sm:mt-0">
                  <Badge variant={getPerfilVariant(u.perfil)}>
                    {u.perfil}
                  </Badge>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setUsuario(u)
                      setView("details")
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Gerenciar
                  </Button>
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum usuário encontrado
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    )
  }

  // ================= DETAILS =================

  if (view === "details" && usuario) {
    return (
      <div className="space-y-6 max-w-2xl">

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Detalhes do Usuário</h1>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">

            <div className="flex items-center gap-4">
              <UserCircle className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="font-semibold">{usuario.name}</p>
                <p className="text-sm text-muted-foreground">
                  CPF: {formatCpf(usuario.cpf)}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Info label="Email" value={usuario.email} icon={<Mail className="h-4 w-4" />} />
              <Info label="Telefone" value={usuario.telefone} icon={<Phone className="h-4 w-4" />} />
              <Info label="Empresa" value={usuario.empresa} icon={<Building2 className="h-4 w-4" />} />
              <div>
                <p className="text-xs text-muted-foreground">Perfil</p>
                <Badge variant={getPerfilVariant(usuario.perfil)}>
                  {usuario.perfil}
                </Badge>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    )
  }

  // ================= SEARCH CPF =================

  return (
    <div className="space-y-6 max-w-xl">
      <Button variant="ghost" onClick={handleBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Buscar por CPF</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="000.000.000-00"
            value={cpfInput}
            onChange={(e) => setCpfInput(formatCpf(e.target.value))}
          />
          <Button
            onClick={handleSearchCpf}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function Info({ label, value, icon }: any) {
  return (
    <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-lg">
      {icon}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value || "—"}</p>
      </div>
    </div>
  )
}
