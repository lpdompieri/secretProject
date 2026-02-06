"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Building2, MapPin, CheckCircle2, XCircle, Loader2, ArrowLeft, Plus, Trash2 } from "lucide-react"
import { findEmpresaByCnpj, formatEndereco, type MockEmpresa, type Endereco } from "@/mocks/empresas"

type EmpresaView = "search" | "details" | "register"

function formatCnpj(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14)
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
}

const EMPTY_ENDERECO: Endereco = {
  rua: "",
  numero: "",
  bairro: "",
  cidade: "",
  estado: "",
  cep: "",
  complemento: "",
  referencia: "",
}

interface FilialForm {
  codigo: string
  cnpj: string
  razaoSocial: string
  nomeFantasia: string
  endereco: Endereco
}

const EMPTY_FILIAL: FilialForm = {
  codigo: "",
  cnpj: "",
  razaoSocial: "",
  nomeFantasia: "",
  endereco: { ...EMPTY_ENDERECO },
}

function EnderecoFields({
  endereco,
  onChange,
  disabled,
  prefix,
}: {
  endereco: Endereco
  onChange: (e: Endereco) => void
  disabled?: boolean
  prefix: string
}) {
  const update = (field: keyof Endereco, value: string) => {
    onChange({ ...endereco, [field]: value })
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor={`${prefix}-rua`} className="text-foreground text-xs font-medium">Rua</Label>
        <Input id={`${prefix}-rua`} placeholder="Rua / Avenida" value={endereco.rua} onChange={(e) => update("rua", e.target.value)} disabled={disabled} className="h-9" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${prefix}-numero`} className="text-foreground text-xs font-medium">Numero</Label>
        <Input id={`${prefix}-numero`} placeholder="123" value={endereco.numero} onChange={(e) => update("numero", e.target.value)} disabled={disabled} className="h-9" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${prefix}-complemento`} className="text-foreground text-xs font-medium">Complemento</Label>
        <Input id={`${prefix}-complemento`} placeholder="Sala 10" value={endereco.complemento || ""} onChange={(e) => update("complemento", e.target.value)} disabled={disabled} className="h-9" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${prefix}-bairro`} className="text-foreground text-xs font-medium">Bairro</Label>
        <Input id={`${prefix}-bairro`} placeholder="Centro" value={endereco.bairro} onChange={(e) => update("bairro", e.target.value)} disabled={disabled} className="h-9" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${prefix}-cidade`} className="text-foreground text-xs font-medium">Cidade</Label>
        <Input id={`${prefix}-cidade`} placeholder="Sao Paulo" value={endereco.cidade} onChange={(e) => update("cidade", e.target.value)} disabled={disabled} className="h-9" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${prefix}-estado`} className="text-foreground text-xs font-medium">Estado</Label>
        <Input id={`${prefix}-estado`} placeholder="SP" value={endereco.estado} onChange={(e) => update("estado", e.target.value)} disabled={disabled} className="h-9" maxLength={2} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${prefix}-cep`} className="text-foreground text-xs font-medium">CEP</Label>
        <Input id={`${prefix}-cep`} placeholder="00000-000" value={endereco.cep} onChange={(e) => update("cep", e.target.value)} disabled={disabled} className="h-9" />
      </div>
      <div className="space-y-1.5 sm:col-span-2 lg:col-span-4">
        <Label htmlFor={`${prefix}-referencia`} className="text-foreground text-xs font-medium">Referencia</Label>
        <Input id={`${prefix}-referencia`} placeholder="Proximo ao..." value={endereco.referencia || ""} onChange={(e) => update("referencia", e.target.value)} disabled={disabled} className="h-9" />
      </div>
    </div>
  )
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
    codigo: "",
    statusBndes: true,
    endereco: { ...EMPTY_ENDERECO },
  })
  const [filiais, setFiliais] = useState<FilialForm[]>([])
  const [saveSuccess, setSaveSuccess] = useState(false)

  async function handleSearch() {
    const cleanCnpj = cnpjInput.replace(/\D/g, "")
    if (cleanCnpj.length !== 14) {
      setError("CNPJ deve conter 14 digitos")
      return
    }
    setError(null)
    setIsLoading(true)
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
        codigo: "",
        statusBndes: true,
        endereco: { ...EMPTY_ENDERECO },
      })
      setFiliais([])
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

  function addFilial() {
    setFiliais((prev) => [...prev, { ...EMPTY_FILIAL, endereco: { ...EMPTY_ENDERECO } }])
  }

  function removeFilial(index: number) {
    setFiliais((prev) => prev.filter((_, i) => i !== index))
  }

  function updateFilial(index: number, field: keyof FilialForm, value: string | Endereco) {
    setFiliais((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [field]: value } : f))
    )
  }

  async function handleSave() {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setIsLoading(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  // ========== SEARCH VIEW ==========
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
            <CardDescription>Informe o CNPJ para consultar os dados da empresa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cnpj" className="text-foreground font-medium">CNPJ</Label>
                <Input
                  id="cnpj"
                  placeholder="00.000.000/0000-00"
                  value={cnpjInput}
                  onChange={(e) => { setCnpjInput(formatCnpj(e.target.value)); setError(null) }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSearch() }}
                  className="h-11"
                  disabled={isLoading}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                onClick={handleSearch}
                disabled={isLoading || cnpjInput.replace(/\D/g, "").length < 14}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />Consultando...</>
                ) : (
                  <><Search className="mr-2 h-4 w-4" aria-hidden="true" />Consultar CNPJ</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ========== DETAILS VIEW ==========
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

        {/* Card principal */}
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
              {empresa.statusBndes ? (
                <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                  <CheckCircle2 className="h-3 w-3 mr-1" aria-hidden="true" />
                  BNDES Ativo
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  <XCircle className="h-3 w-3 mr-1" aria-hidden="true" />
                  BNDES Inativo
                </Badge>
              )}
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
                {formatEndereco(empresa.endereco)}
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
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Codigo</TableHead>
                      <TableHead className="font-semibold">CNPJ</TableHead>
                      <TableHead className="font-semibold">Razao Social</TableHead>
                      <TableHead className="font-semibold">Nome Fantasia</TableHead>
                      <TableHead className="font-semibold">Endereco</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {empresa.filiais.map((filial) => (
                      <TableRow key={filial.cnpj}>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">{filial.codigo}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{formatCnpj(filial.cnpj)}</TableCell>
                        <TableCell className="font-medium">{filial.razaoSocial}</TableCell>
                        <TableCell className="text-muted-foreground">{filial.nomeFantasia}</TableCell>
                        <TableCell className="text-sm max-w-xs">
                          <span className="flex items-start gap-1.5">
                            <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                            {formatEndereco(filial.endereco)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        )}
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
          <h1 className="text-3xl font-bold text-foreground text-balance">Cadastrar Empresa</h1>
          <p className="text-muted-foreground mt-1">CNPJ nao encontrado. Preencha os dados para cadastro.</p>
        </header>
      </div>

      {/* Dados principais */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-foreground text-lg">Dados da Empresa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="reg-cnpj" className="text-foreground font-medium">CNPJ</Label>
              <Input id="reg-cnpj" value={formData.cnpj} onChange={(e) => setFormData({ ...formData, cnpj: formatCnpj(e.target.value) })} className="h-10" disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-codigo" className="text-foreground font-medium">Codigo da Empresa</Label>
              <Input id="reg-codigo" placeholder="Ex: LJ005" value={formData.codigo} onChange={(e) => setFormData({ ...formData, codigo: e.target.value })} className="h-10" disabled={isLoading} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-razao" className="text-foreground font-medium">Razao Social</Label>
            <Input id="reg-razao" placeholder="Razao social da empresa" value={formData.razaoSocial} onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })} className="h-10" disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-fantasia" className="text-foreground font-medium">Nome Fantasia</Label>
            <Input id="reg-fantasia" placeholder="Nome fantasia" value={formData.nomeFantasia} onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })} className="h-10" disabled={isLoading} />
          </div>

          {/* Status BNDES toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div>
              <p className="font-medium text-foreground">Status BNDES</p>
              <p className="text-sm text-muted-foreground">
                {formData.statusBndes ? "Habilitada no BNDES" : "Nao habilitada no BNDES"}
              </p>
            </div>
            <Switch
              checked={formData.statusBndes}
              onCheckedChange={(checked) => setFormData({ ...formData, statusBndes: checked })}
              disabled={isLoading}
              aria-label="Status BNDES"
            />
          </div>

          <Separator />
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Endereco</h3>
          <EnderecoFields
            endereco={formData.endereco}
            onChange={(e) => setFormData({ ...formData, endereco: e })}
            disabled={isLoading}
            prefix="emp"
          />
        </CardContent>
      </Card>

      {/* Filiais */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground text-lg">Filiais ({filiais.length})</CardTitle>
            <Button variant="outline" size="sm" onClick={addFilial} disabled={isLoading}>
              <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
              Adicionar Filial
            </Button>
          </div>
          <CardDescription>Cadastre as filiais vinculadas a esta empresa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {filiais.length === 0 && (
            <p className="text-center text-muted-foreground py-6 text-sm">
              Nenhuma filial adicionada. Clique em "Adicionar Filial" para comecar.
            </p>
          )}
          {filiais.map((filial, idx) => (
            <div key={idx} className="space-y-4 p-4 rounded-lg border bg-muted/20">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground text-sm">Filial {idx + 1}</h4>
                <Button variant="ghost" size="icon" onClick={() => removeFilial(idx)} className="h-8 w-8 text-destructive hover:text-destructive" aria-label={`Remover filial ${idx + 1}`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-foreground text-xs font-medium">Codigo</Label>
                  <Input placeholder="Ex: LJ006" value={filial.codigo} onChange={(e) => updateFilial(idx, "codigo", e.target.value)} className="h-9" disabled={isLoading} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-foreground text-xs font-medium">CNPJ</Label>
                  <Input placeholder="00.000.000/0000-00" value={filial.cnpj} onChange={(e) => updateFilial(idx, "cnpj", formatCnpj(e.target.value))} className="h-9" disabled={isLoading} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-foreground text-xs font-medium">Razao Social</Label>
                  <Input placeholder="Razao social da filial" value={filial.razaoSocial} onChange={(e) => updateFilial(idx, "razaoSocial", e.target.value)} className="h-9" disabled={isLoading} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-foreground text-xs font-medium">Nome Fantasia</Label>
                  <Input placeholder="Nome fantasia" value={filial.nomeFantasia} onChange={(e) => updateFilial(idx, "nomeFantasia", e.target.value)} className="h-9" disabled={isLoading} />
                </div>
              </div>
              <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-1">Endereco da Filial</h5>
              <EnderecoFields
                endereco={filial.endereco}
                onChange={(e) => updateFilial(idx, "endereco", e)}
                disabled={isLoading}
                prefix={`filial-${idx}`}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Acoes */}
      <div className="max-w-2xl space-y-4">
        {saveSuccess && (
          <div className="flex items-center gap-2 p-3 text-sm text-secondary bg-secondary/10 border border-secondary/20 rounded-lg">
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Empresa cadastrada com sucesso! (mock)</span>
          </div>
        )}
        <Button onClick={handleSave} disabled={isLoading} className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground">
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />Salvando...</>
          ) : (
            "Salvar Empresa"
          )}
        </Button>
      </div>
    </div>
  )
}
