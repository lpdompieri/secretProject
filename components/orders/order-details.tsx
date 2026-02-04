"use client"

/**
 * =============================================================================
 * COMPONENTE - DETALHES DO PEDIDO
 * =============================================================================
 * 
 * Responsabilidade: Exibir todos os detalhes de um pedido em drawer/modal
 * =============================================================================
 */

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  X,
  Package,
  User,
  MapPin,
  CreditCard,
  FileText,
  Store,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Order } from "@/types/order"
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/types/order"

// =============================================================================
// TIPOS
// =============================================================================

interface OrderDetailsProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
}

// =============================================================================
// COMPONENTE
// =============================================================================

export function OrderDetails({ order, isOpen, onClose }: OrderDetailsProps) {
  if (!order) return null

  const statusColors = ORDER_STATUS_COLORS[order.status]

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Pedido #{order.numeroPedido}
            </SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </Button>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
                statusColors.bg,
                statusColors.text,
                statusColors.border
              )}
            >
              {ORDER_STATUS_LABELS[order.status]}
            </span>
            <span className="text-sm text-muted-foreground">
              {new Date(order.dataEmissao).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Loja */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Store className="h-4 w-4 text-primary" />
                Loja
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="font-medium">{order.loja.nome}</p>
              <p className="text-sm text-muted-foreground">CNPJ: {order.loja.cnpj}</p>
            </CardContent>
          </Card>

          {/* Cliente */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Dados do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div>
                <p className="font-medium">{order.cliente.nome}</p>
                <p className="text-sm text-muted-foreground">
                  CPF/CNPJ: {order.cliente.cpfCnpj}
                </p>
              </div>
              <div className="text-sm">
                <p>{order.cliente.email}</p>
                <p>{order.cliente.telefone}</p>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p>
                    {order.cliente.endereco.logradouro}, {order.cliente.endereco.numero}
                    {order.cliente.endereco.complemento && ` - ${order.cliente.endereco.complemento}`}
                  </p>
                  <p>
                    {order.cliente.endereco.bairro} - {order.cliente.endereco.cidade}/{order.cliente.endereco.estado}
                  </p>
                  <p>CEP: {order.cliente.endereco.cep}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Itens do Pedido */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Itens do Pedido ({order.itens.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {order.itens.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between py-3 border-b last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.descricao}</p>
                      <p className="text-xs text-muted-foreground">
                        Cod: {item.codigo} | Qtd: {item.quantidade}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">
                        {item.valorTotal.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.valorUnitario.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}{" "}
                        cada
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Totais */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>
                    {order.subtotal.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
                {order.desconto > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Desconto</span>
                    <span className="text-green-600">
                      -{order.desconto.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total do Pedido</span>
                  <span className="text-lg">
                    {order.valorTotal.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados de Pagamento */}
          {order.pagamento && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Dados do Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Forma de Pagamento</p>
                    <p className="font-medium">{order.pagamento.formaPagamento}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Parcelamento</p>
                    <p className="font-medium">{order.pagamento.parcelas}x</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Taxa de Juros</p>
                    <p className="font-medium">{order.pagamento.taxaJuros}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Valor dos Juros</p>
                    <p className="font-medium">
                      {order.pagamento.valorJuros.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Valor da Parcela</p>
                    <p className="font-medium">
                      {order.pagamento.valorParcela.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total com Juros</p>
                    <p className="font-medium text-primary">
                      {order.pagamento.valorTotal.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                  </div>
                </div>

                {order.pagamento.transacaoId && (
                  <>
                    <Separator />
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Transacao ID</span>
                        <span className="font-mono">{order.pagamento.transacaoId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">NSU Host</span>
                        <span className="font-mono">{order.pagamento.nsuHost}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cod. Autorizacao</span>
                        <span className="font-mono">{order.pagamento.codigoAutorizacao}</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Nota Fiscal */}
          {order.notaFiscal && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Nota Fiscal
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Numero</p>
                    <p className="font-medium">{order.notaFiscal.numero}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Serie</p>
                    <p className="font-medium">{order.notaFiscal.serie}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Chave de Acesso</p>
                    <p className="font-mono text-xs break-all">
                      {order.notaFiscal.chaveAcesso}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Data de Emissao</p>
                    <p className="font-medium">
                      {new Date(order.notaFiscal.dataEmissao).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="w-full bg-transparent">
            Fechar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
