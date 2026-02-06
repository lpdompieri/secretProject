"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, Building2, MapPin, CheckCircle2, Loader2, ArrowLeft } from "lucide-react"
import { findEmpresaByCnpj, type MockEmpresa } from "@/mocks/empresas"

type EmpresaView = "search" | "details" | "register"

function formatCnpj(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14)
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
}

export function EmpresaContent() {
  const [cnpjInput, setCnpjInput] = useState("")
  const [view, setView] = useState<EmpresaView>("search")
  const [isLoading, setIsLoading] = useState(false)
  const [empresa, setEmpresa] = useState<MockEmpresa | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form de cadastro
  const [formData, setFormData] = useState({
    cnpj: "",
    razaoSocial: "",
    nomeFantasia: "",
    endereco: "",
    statusBndes: "",
    codigo: "",
  })
  const [saveSuccess, setSaveSuccess] = useState(false)

  async function handleSearch() {
    const cleanCnpj = cnpjInput.replace(/\D/g, "")
    if (cleanCnpj.length !== 14) {
      setError("CNPJ deve conter 14 digitos")
      return
    }

    setError(null)
    setIsLoading(true)

    // Simulacao de delay da API
    await new Promise((resolve) => setTimeout(resolve, 800))

    const found = findEmpresaByCnpj(cleanCnpj)
    setIsLoading(false)

    if (found) {
      setEmpresa(found)
      setView("details")
    } else {
      setFormData({
        cnpj: cnpjInput,
        razaoSocial: "",
        nomeFantasia: "",
        endereco: "",
        statusBndes: "",
        codigo: "",
      })
      setView("register")
    }
  }

  function handleBack() {
    setView("search")
    setEmpresa(null)
    setCnpjInput("")
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
          <h1 className="text-3xl font-bold text-foreground text-balance">Empresa</h1>
          <p className="text-muted-foreground mt-1">Consulte uma empresa pelo CNPJ</p>
        </header>

        <Card className="max-w-xl border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Search className="h-5 w-5 text-secondary" aria-hidden="true" />
              Consultar CNPJ
            </CardTitle>
            <CardDescription>
              Informe o CNPJ para consultar os dados da empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cnpj" className="text-foreground font-medium">CNPJ</Label>
                <Input
                  id="cnpj"
                  placeholder="00.000.000/0000-00"
                  value={cnpjInput}
                  onChange={(e) => {
                    setCnpjInput(formatCnpj(e.target.value))
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
                disabled={isLoading || cnpjInput.replace(/\D/g, "").length < 14}
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
                    Consultar CNPJ
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Tela de detalhes da empresa
  if (view === "details" && empresa) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack} aria-label="Voltar">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <header>
            <h1 className="text-3xl font-bold text-foreground text-balance">Dados da Empresa</h1>
            <p className="text-muted-foreground mt-1">Informacoes cadastradas</p>
          </header>
        </div>

        {/* Card principal da empresa */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-secondary" aria-hidden="true" />
                </div>
                <div>
                  <CardTitle className="text-foreground">{empresa.razaoSocial}</CardTitle>
                  <CardDescription>{empresa.nomeFantasia}</CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                <CheckCircle2 className="h-3 w-3 mr-1" aria-hidden="true" />
                {empresa.statusBndes}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">CNPJ</p>
                <p className="text-foreground font-mono">{formatCnpj(empresa.cnpj)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Codigo da Empresa</p>
                <p className="text-foreground font-semibold">{empresa.codigo}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Endereco</p>
              <p className="text-foreground flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                {empresa.endereco}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Filiais */}
        {empresa.filiais.length > 0 && (
          <div className="space-y-4">
            <Separator />
            <h2 className="text-xl font-semibold text-foreground">
              Filiais Vinculadas ({empresa.filiais.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {empresa.filiais.map((filial) => (
                <Card key={filial.cnpj} className="border shadow-sm">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground text-sm">{filial.razaoSocial}</h3>
                      <Badge variant="outline" className="text-xs">{filial.codigo}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{filial.nomeFantasia}</p>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">CNPJ</p>
                      <p className="text-sm text-foreground font-mono">{formatCnpj(filial.cnpj)}</p>
                    </div>
                    <p className="text-sm text-foreground flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                      {filial.endereco}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Tela de cadastro (CNPJ nao encontrado)
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack} aria-label="Voltar">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <header>
          <h1 className="text-3xl font-bold text-foreground text-balance">Cadastrar Empresa</h1>
          <p className="text-muted-foreground mt-1">CNPJ nao encontrado. Preencha os dados para cadastro.</p>
        </header>
      </div>

      <Card className="max-w-2xl border-0 shadow-md">
        <CardContent className="pt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="reg-cnpj" className="text-foreground font-medium">CNPJ</Label>
              <Input
                id="reg-cnpj"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: formatCnpj(e.target.value) })}
                className="h-11"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-codigo" className="text-foreground font-medium">Codigo da Empresa</Label>
              <Input
                id="reg-codigo"
                placeholder="Ex: LJ005"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                className="h-11"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-razao" className="text-foreground font-medium">Razao Social</Label>
            <Input
              id="reg-razao"
              placeholder="Razao social da empresa"
              value={formData.razaoSocial}
              onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
              className="h-11"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-fantasia" className="text-foreground font-medium">Nome Fantasia</Label>
            <Input
              id="reg-fantasia"
              placeholder="Nome fantasia da empresa"
              value={formData.nomeFantasia}
              onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })}
              className="h-11"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-endereco" className="text-foreground font-medium">Endereco</Label>
            <Input
              id="reg-endereco"
              placeholder="Endereco completo"
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              className="h-11"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-status" className="text-foreground font-medium">Status BNDES</Label>
            <Input
              id="reg-status"
              placeholder="Ex: Habilitada no BNDES"
              value={formData.statusBndes}
              onChange={(e) => setFormData({ ...formData, statusBndes: e.target.value })}
              className="h-11"
              disabled={isLoading}
            />
          </div>

          {saveSuccess && (
            <div className="flex items-center gap-2 p-3 text-sm text-secondary bg-secondary/10 border border-secondary/20 rounded-lg">
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Empresa cadastrada com sucesso! (mock)</span>
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
              "Salvar Empresa"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
