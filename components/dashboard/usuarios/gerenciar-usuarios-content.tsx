"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, UserCircle, Mail, Building2, ShieldCheck, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"
import { findUserByCpf, type MockUser } from "@/mocks/users"

type UsuarioView = "search" | "details" | "register"

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

function getPerfilColor(perfil: string): "default" | "secondary" | "destructive" | "outline" {
  switch (perfil) {
    case "Master": return "destructive"
    case "Gerente": return "default"
    case "Vendedor": return "secondary"
    default: return "outline"
  }
}

export function GerenciarUsuariosContent() {
  const [cpfInput, setCpfInput] = useState("")
  const [view, setView] = useState<UsuarioView>("search")
  const [isLoading, setIsLoading] = useState(false)
  const [usuario, setUsuario] = useState<MockUser | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form de cadastro
  const [formData, setFormData] = useState({
    cpf: "",
    nome: "",
    email: "",
    empresa: "",
    perfil: "",
  })
  const [saveSuccess, setSaveSuccess] = useState(false)

  async function handleSearch() {
    const cleanCpf = cpfInput.replace(/\D/g, "")
    if (cleanCpf.length !== 11) {
      setError("CPF deve conter 11 digitos")
      return
    }

    setError(null)
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 800))

    const found = findUserByCpf(cleanCpf)
    setIsLoading(false)

    if (found) {
      setUsuario(found)
      setView("details")
    } else {
      setFormData({
        cpf: cpfInput,
        nome: "",
        email: "",
        empresa: "",
        perfil: "",
      })
      setView("register")
    }
  }

  function handleBack() {
    setView("search")
    setUsuario(null)
    setCpfInput("")
    setError(null)
    setSaveSuccess(false)
  }

  async function handleSave() {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setIsLoading(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  // Tela de busca
  if (view === "search") {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-foreground text-balance">Gerenciar Usuarios</h1>
          <p className="text-muted-foreground mt-1">Consulte um usuario pelo CPF</p>
        </header>

        <Card className="max-w-xl border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Search className="h-5 w-5 text-secondary" aria-hidden="true" />
              Consultar Usuario
            </CardTitle>
            <CardDescription>
              Informe o CPF para consultar os dados do usuario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-foreground font-medium">CPF</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={cpfInput}
                  onChange={(e) => {
                    setCpfInput(formatCpf(e.target.value))
                    setError(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch()
                  }}
                  className="h-11"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button
                onClick={handleSearch}
                disabled={isLoading || cpfInput.replace(/\D/g, "").length < 11}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Consultando...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" aria-hidden="true" />
                    Consultar Usuario
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Tela de detalhes do usuario
  if (view === "details" && usuario) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack} aria-label="Voltar">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <header>
            <h1 className="text-3xl font-bold text-foreground text-balance">Dados do Usuario</h1>
            <p className="text-muted-foreground mt-1">Informacoes cadastradas</p>
          </header>
        </div>

        <Card className="max-w-xl border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-secondary/10 flex items-center justify-center">
                <UserCircle className="h-8 w-8 text-secondary" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-foreground">{usuario.name}</CardTitle>
                <CardDescription>CPF: {formatCpf(usuario.cpf)}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Mail className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">E-mail</p>
                  <p className="text-sm text-foreground">{usuario.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Building2 className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Empresa</p>
                  <p className="text-sm text-foreground">{usuario.empresa || "(nenhuma)"}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <ShieldCheck className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Perfil</p>
                <Badge variant={getPerfilColor(usuario.perfil)} className="mt-1">
                  {usuario.perfil}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Tela de cadastro (CPF nao encontrado)
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack} aria-label="Voltar">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <header>
          <h1 className="text-3xl font-bold text-foreground text-balance">Cadastrar Usuario</h1>
          <p className="text-muted-foreground mt-1">CPF nao encontrado. Preencha os dados para cadastro.</p>
        </header>
      </div>

      <Card className="max-w-xl border-0 shadow-md">
        <CardContent className="pt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="reg-cpf" className="text-foreground font-medium">CPF</Label>
            <Input
              id="reg-cpf"
              value={formData.cpf}
              onChange={(e) => setFormData({ ...formData, cpf: formatCpf(e.target.value) })}
              className="h-11"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-nome" className="text-foreground font-medium">Nome Completo</Label>
            <Input
              id="reg-nome"
              placeholder="Nome do usuario"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="h-11"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-email" className="text-foreground font-medium">E-mail</Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="usuario@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-11"
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="reg-empresa" className="text-foreground font-medium">Empresa</Label>
              <Input
                id="reg-empresa"
                placeholder="Ex: ES001"
                value={formData.empresa}
                onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                className="h-11"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-perfil" className="text-foreground font-medium">Perfil</Label>
              <Input
                id="reg-perfil"
                placeholder="Ex: Vendedor"
                value={formData.perfil}
                onChange={(e) => setFormData({ ...formData, perfil: e.target.value })}
                className="h-11"
                disabled={isLoading}
              />
            </div>
          </div>

          {saveSuccess && (
            <div className="flex items-center gap-2 p-3 text-sm text-secondary bg-secondary/10 border border-secondary/20 rounded-lg">
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Usuario cadastrado com sucesso! (mock)</span>
            </div>
          )}

          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Salvando...
              </>
            ) : (
              "Salvar Usuario"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
