"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ShieldCheck, CheckCircle2, Loader2 } from "lucide-react"
import { MOCK_PERFIS, PERMISSOES, type MockPerfil } from "@/mocks/perfis"
import { cn } from "@/lib/utils"

export function PerfisContent() {
  const [perfis, setPerfis] = useState<MockPerfil[]>(MOCK_PERFIS)
  const [selectedPerfil, setSelectedPerfil] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const activePerfil = perfis.find((p) => p.nome === selectedPerfil)

  function togglePermissao(perfilNome: string, permissaoId: string) {
    setPerfis((prev) =>
      prev.map((p) => {
        if (p.nome !== perfilNome) return p
        const hasPermissao = p.permissoes.includes(permissaoId)
        return {
          ...p,
          permissoes: hasPermissao
            ? p.permissoes.filter((id) => id !== permissaoId)
            : [...p.permissoes, permissaoId],
        }
      })
    )
  }

  async function handleSave() {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setIsSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-foreground text-balance">Perfis de Usuarios</h1>
        <p className="text-muted-foreground mt-1">Gerencie perfis e suas permissoes</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Lista de perfis */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Perfis
          </h2>
          {perfis.map((perfil) => (
            <Card
              key={perfil.nome}
              className={cn(
                "cursor-pointer transition-all border shadow-sm hover:shadow-md",
                selectedPerfil === perfil.nome
                  ? "border-primary ring-2 ring-primary/20"
                  : "hover:border-primary/30"
              )}
              onClick={() => setSelectedPerfil(perfil.nome)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center",
                      selectedPerfil === perfil.nome 
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/10"
                    )}>
                      <ShieldCheck className={cn(
                        "h-5 w-5",
                        selectedPerfil === perfil.nome 
                          ? "text-primary-foreground"
                          : "text-secondary"
                      )} aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{perfil.nome}</p>
                      <p className="text-xs text-muted-foreground">{perfil.descricao}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {perfil.permissoes.length}/{PERMISSOES.length}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Permissoes do perfil selecionado */}
        <div className="lg:col-span-2">
          {!activePerfil ? (
            <Card className="border-0 shadow-md">
              <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center space-y-2">
                  <ShieldCheck className="h-10 w-10 mx-auto text-muted-foreground/50" aria-hidden="true" />
                  <p>Selecione um perfil para gerenciar suas permissoes</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <ShieldCheck className="h-5 w-5 text-secondary" aria-hidden="true" />
                  Permissoes: {activePerfil.nome}
                </CardTitle>
                <CardDescription>{activePerfil.descricao}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-3">
                  {PERMISSOES.map((perm) => {
                    const isChecked = activePerfil.permissoes.includes(perm.id)
                    return (
                      <div
                        key={perm.id}
                        className={cn(
                          "flex items-start gap-4 p-4 rounded-lg border transition-colors",
                          isChecked
                            ? "bg-secondary/5 border-secondary/20"
                            : "bg-muted/30 border-border"
                        )}
                      >
                        <Checkbox
                          id={`perm-${activePerfil.nome}-${perm.id}`}
                          checked={isChecked}
                          onCheckedChange={() => togglePermissao(activePerfil.nome, perm.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={`perm-${activePerfil.nome}-${perm.id}`}
                            className="text-foreground font-medium cursor-pointer"
                          >
                            {perm.label}
                          </Label>
                          <p className="text-sm text-muted-foreground mt-0.5">{perm.descricao}</p>
                          <Badge variant="outline" className="mt-2 font-mono text-xs">
                            {perm.id}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {saveSuccess && (
                  <div className="flex items-center gap-2 p-3 text-sm text-secondary bg-secondary/10 border border-secondary/20 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Permissoes salvas com sucesso! (mock)</span>
                  </div>
                )}

                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Permissoes"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
