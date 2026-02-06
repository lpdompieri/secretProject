"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, UserCircle, Mail, Building2, ShieldCheck, Phone, Loader2, ArrowLeft, CheckCircle2, Pencil } from "lucide-react"
import { MOCK_USERS, findUserByCpf, type MockUser } from "@/mocks/users"
import { MOCK_PERFIS } from "@/mocks/perfis"
import { useAuth } from "@/contexts/auth-context"
import { useEmpresa } from "@/contexts/empresa-context"

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
  const { isMaster } = useAuth()
  const { empresas } = useEmpresa()

  const [cpfInput, setCpfInput] = useState("")
  const [view, setView] = useState<UsuarioView>("search")
  const [isLoading, setIsLoading] = useState(false)
  const [usuario, setUsuario] = useState<MockUser | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Usuarios em memoria para edicao
  const [localUsers, setLocalUsers] = useState<MockUser[]>([...MOCK_USERS])

  // Modo de edicao
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    telefone: "",
    empresa: "",
    perfil: "",
  })

  // Form de cadastro
  const [formData, setFormData] = useState({
    cpf: "",
    nome: "",
    email: "",
    telefone: "",
    empresa: "",
    perfil: "",
  })
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Empresas disponiveis: Master ve todas, usuario comum ve apenas a sua
  const empresasDisponiveis = isMaster
    ? empresas
    : empresas.filter((e) => e.codigo === usuario?.empresa)

  async function handleSearch() {
    const cleanCpf = cpfInput.replace(/\D/g, "")
    if (cleanCpf.length !== 11) {
      setError("CPF deve conter 11 digitos")
      return
    }
    setError(null)
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800))

    const found = localUsers.find((u) => u.cpf === cleanCpf) || null
    setIsLoading(false)

    if (found) {
      setUsuario(found)
      setIsEditing(false)
      setView("details")
    } else {
      setFormData({
        cpf: cpfInput,
        nome: "",
        email: "",
        telefone: "",
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
    setIsEditing(false)
  }

  function startEdit() {
    if (!usuario) return
    setEditData({
      name: usuario.name,
      email: usuario.email,
      telefone: usuario.telefone,
      empresa: usuario.empresa,
      perfil: usuario.perfil,
    })
    setIsEditing(true)
  }

  async function handleSaveEdit() {
    if (!usuario) return
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Atualizar no array local
    const updated: MockUser = {
      ...usuario,
      name: editData.name,
      email: editData.email,
      telefone: editData.telefone,
      empresa: editData.empresa,
      perfil: editData.perfil as MockUser["perfil"],
    }

    setLocalUsers((prev) => prev.map((u) => (u.cpf === usuario.cpf ? updated : u)))
    setUsuario(updated)
    setIsEditing(false)
    setIsLoading(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  async function handleSaveNew() {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800))

    const newUser: MockUser = {
      cpf: formData.cpf.replace(/\D/g, ""),
      name: formData.nome,
      email: formData.email,
      telefone: formData.telefone,
      password: "123456",
      empresa: formData.empresa,
      perfil: (formData.perfil as MockUser["perfil"]) || "Vendedor",
    }

    setLocalUsers((prev) => [...prev, newUser])
    setIsLoading(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  // ========== SEARCH VIEW ==========
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
            <CardDescription>Informe o CPF para consultar os dados do usuario</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-foreground font-medium">CPF</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={cpfInput}
                  onChange={(e) => { setCpfInput(formatCpf(e.target.value)); setError(null) }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSearch() }}
                  className="h-11"
                  disabled={isLoading}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                onClick={handleSearch}
                disabled={isLoading || cpfInput.replace(/\D/g, "").length < 11}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />Consultando...</>
                ) : (
                  <><Search className="mr-2 h-4 w-4" aria-hidden="true" />Consultar Usuario</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ========== DETAILS VIEW ==========
  if (view === "details" && usuario) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack} aria-label="Voltar">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <header className="flex-1">
            <h1 className="text-3xl font-bold text-foreground text-balance">Dados do Usuario</h1>
            <p className="text-muted-foreground mt-1">
              {isEditing ? "Editando informacoes" : "Informacoes cadastradas"}
            </p>
          </header>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={startEdit}>
              <Pencil className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Editar
            </Button>
          )}
        </div>

        <Card className="max-w-xl border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-secondary/10 flex items-center justify-center">
                <UserCircle className="h-8 w-8 text-secondary" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-foreground">
                  {isEditing ? editData.name : usuario.name}
                </CardTitle>
                <CardDescription>CPF: {formatCpf(usuario.cpf)}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              // ===== MODO EDICAO =====
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-foreground font-medium">Nome Completo</Label>
                  <Input id="edit-name" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="h-10" disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email" className="text-foreground font-medium">E-mail</Label>
                  <Input id="edit-email" type="email" value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} className="h-10" disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-telefone" className="text-foreground font-medium">Telefone</Label>
                  <Input id="edit-telefone" value={editData.telefone} onChange={(e) => setEditData({ ...editData, telefone: e.target.value })} placeholder="(00) 00000-0000" className="h-10" disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-empresa" className="text-foreground font-medium">Empresa</Label>
                  <Select value={editData.empresa} onValueChange={(v) => setEditData({ ...editData, empresa: v })}>
                    <SelectTrigger id="edit-empresa" className="h-10"><SelectValue placeholder="Selecionar empresa" /></SelectTrigger>
                    <SelectContent>
                      {(isMaster ? empresas : empresasDisponiveis).map((emp) => (
                        <SelectItem key={emp.codigo} value={emp.codigo}>
                          {emp.codigo} - {emp.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-perfil" className="text-foreground font-medium">Perfil</Label>
                  <Select value={editData.perfil} onValueChange={(v) => setEditData({ ...editData, perfil: v })}>
                    <SelectTrigger id="edit-perfil" className="h-10"><SelectValue placeholder="Selecionar perfil" /></SelectTrigger>
                    <SelectContent>
                      {MOCK_PERFIS.map((p) => (
                        <SelectItem key={p.nome} value={p.nome}>{p.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {saveSuccess && (
                  <div className="flex items-center gap-2 p-3 text-sm text-secondary bg-secondary/10 border border-secondary/20 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Usuario atualizado com sucesso! (mock)</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading} className="flex-1 h-10">
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveEdit} disabled={isLoading} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground">
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />Salvando...</>
                    ) : "Salvar Alteracoes"}
                  </Button>
                </div>
              </div>
            ) : (
              // ===== MODO VISUALIZACAO =====
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Mail className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">E-mail</p>
                      <p className="text-sm text-foreground">{usuario.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Phone className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Telefone</p>
                      <p className="text-sm text-foreground">{usuario.telefone || "(nao informado)"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Building2 className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Empresa</p>
                      <p className="text-sm text-foreground">{usuario.empresa || "(nenhuma)"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <ShieldCheck className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Perfil</p>
                      <Badge variant={getPerfilColor(usuario.perfil)} className="mt-1">{usuario.perfil}</Badge>
                    </div>
                  </div>
                </div>

                {saveSuccess && (
                  <div className="flex items-center gap-2 p-3 text-sm text-secondary bg-secondary/10 border border-secondary/20 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Usuario atualizado com sucesso! (mock)</span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // ========== REGISTER VIEW ==========
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
            <Input id="reg-cpf" value={formData.cpf} onChange={(e) => setFormData({ ...formData, cpf: formatCpf(e.target.value) })} className="h-11" disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-nome" className="text-foreground font-medium">Nome Completo</Label>
            <Input id="reg-nome" placeholder="Nome do usuario" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} className="h-11" disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-email" className="text-foreground font-medium">E-mail</Label>
            <Input id="reg-email" type="email" placeholder="usuario@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="h-11" disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-telefone" className="text-foreground font-medium">Telefone</Label>
            <Input id="reg-telefone" placeholder="(00) 00000-0000" value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} className="h-11" disabled={isLoading} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="reg-empresa" className="text-foreground font-medium">Empresa</Label>
              <Select value={formData.empresa} onValueChange={(v) => setFormData({ ...formData, empresa: v })}>
                <SelectTrigger id="reg-empresa" className="h-11"><SelectValue placeholder="Selecionar empresa" /></SelectTrigger>
                <SelectContent>
                  {(isMaster ? empresas : empresasDisponiveis).map((emp) => (
                    <SelectItem key={emp.codigo} value={emp.codigo}>
                      {emp.codigo} - {emp.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-perfil" className="text-foreground font-medium">Perfil</Label>
              <Select value={formData.perfil} onValueChange={(v) => setFormData({ ...formData, perfil: v })}>
                <SelectTrigger id="reg-perfil" className="h-11"><SelectValue placeholder="Selecionar perfil" /></SelectTrigger>
                <SelectContent>
                  {MOCK_PERFIS.map((p) => (
                    <SelectItem key={p.nome} value={p.nome}>{p.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {saveSuccess && (
            <div className="flex items-center gap-2 p-3 text-sm text-secondary bg-secondary/10 border border-secondary/20 rounded-lg">
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Usuario cadastrado com sucesso! (mock)</span>
            </div>
          )}

          <Button onClick={handleSaveNew} disabled={isLoading} className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground">
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />Salvando...</>
            ) : "Salvar Usuario"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
