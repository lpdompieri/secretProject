"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Search, Building2, MapPin, CheckCircle2, XCircle, Loader2, ArrowLeft, Plus } from "lucide-react"
import { findEmpresaByCnpj, formatEndereco, type MockEmpresa } from "@/mocks/empresas"

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

  async function handleSearch() {
    const cleanCnpj = cnpjInput.replace(/\D/g, "")
    if (cleanCnpj.length !== 14) {
      setError("CNPJ deve conter 14 dígitos")
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
      setView("register")
    }
  }

  function handleBack() {
    setView("search")
    setEmpresa(null)
    setCnpjInput("")
  }

  /* =========================================================
     SEARCH VIEW
  ==========================================================*/
  if (view === "search") {
    return (
      <div className="space-y-8 max-w-4xl">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">Empresas</h1>
          <p className="text-muted-foreground">
            Gestão corporativa e governança BNDES
          </p>
        </header>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Consultar Empresa
            </CardTitle>
            <CardDescription>
              Informe o CNPJ para visualizar ou cadastrar
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <Label>CNPJ</Label>
              <Input
                placeholder="00.000.000/0000-00"
                value={cnpjInput}
                onChange={(e) => setCnpjInput(formatCnpj(e.target.value))}
                disabled={isLoading}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Consultando...
                </>
              ) : (
                "Consultar Empresa"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  /* =========================================================
     DETAILS VIEW (ENTERPRISE)
  ==========================================================*/
  if (view === "details" && empresa) {
    const totalFiliais = empresa.filiais.length

    return (
      <div className="space-y-8">
        {/* HEADER + ACTION BAR */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{empresa.razaoSocial}</h1>
              <p className="text-muted-foreground">
                {empresa.nomeFantasia}
              </p>
            </div>
          </div>

          <Badge
            variant={empresa.statusBndes ? "secondary" : "outline"}
            className="px-3 py-1 text-sm"
          >
            {empresa.statusBndes ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-1" />
                BNDES Ativo
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-1" />
                BNDES Inativo
              </>
            )}
          </Badge>
        </div>

        {/* KPI CARDS */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Filiais</p>
              <p className="text-2xl font-bold">{totalFiliais}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">CNPJ</p>
              <p className="font-mono text-lg">
                {formatCnpj(empresa.cnpj)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Código</p>
              <p className="text-lg font-semibold">
                {empresa.codigo}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">UF</p>
              <p className="text-lg font-semibold">
                {empresa.endereco.estado}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ENDEREÇO */}
        <Card>
          <CardHeader>
            <CardTitle>Endereço Corporativo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
              {formatEndereco(empresa.endereco)}
            </p>
          </CardContent>
        </Card>

        {/* FILIAIS */}
        <Card>
          <CardHeader>
            <CardTitle>Filiais Vinculadas</CardTitle>
            <CardDescription>
              Estrutura operacional vinculada ao CNPJ raiz
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {empresa.filiais.map((filial) => (
              <div
                key={filial.cnpj}
                className="p-4 rounded-lg border flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{filial.nomeFantasia}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {formatCnpj(filial.cnpj)}
                  </p>
                </div>

                <Badge variant="outline">
                  {filial.codigo}
                </Badge>
              </div>
            ))}

            {empresa.filiais.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhuma filial vinculada.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  /* =========================================================
     REGISTER VIEW (simplificado)
  ==========================================================*/
  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={handleBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Cadastrar Empresa</CardTitle>
          <CardDescription>
            CNPJ não encontrado na base
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Estrutura de cadastro mantida conforme versão anterior.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
