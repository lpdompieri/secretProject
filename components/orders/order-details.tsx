"use client"

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
  BadgeCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Order } from "@/types/order"
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/types/order"

interface OrderDetailsProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
}

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
            </Button>
          </div>

          {/* Numero BNDES */}
          <div className="mt-2 text-sm">
            <span className="text-muted-foreground">Pedido BNDES: </span>
            <span className="font-medium">
              {order.numeroPedidoBndes ?? "Não integrado"}
            </span>
          </div>

          {/* Vendedor / Gerente */}
          <div className="mt-2 text-sm space-y-1">
            <div>
              <span className="text-muted-foreground">Vendedor: </span>
              <span className="font-medium">{order.vendedor}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Gerente Aprovador: </span>
              <span className="font-medium">{order.gerenteAprovador}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-3">
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
          </div>
        </SheetHeader>

        <div className="space-y-6">

          {/* Loja */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Store className="h-4 w-4 text-primary" />
                Loja
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{order.loja.nome}</p>
              <p className="text-sm text-muted-foreground">
                CNPJ: {order.loja.cnpj}
              </p>
            </CardContent>
          </Card>

          {/* Cliente - sempre PJ */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Dados do Cliente (Pessoa Jurídica)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{order.cliente.nome}</p>
              <p className="text-muted-foreground">
                CNPJ: {order.cliente.cpfCnpj}
              </p>
              <p>{order.cliente.email}</p>
              <p>{order.cliente.telefone}</p>
            </CardContent>
          </Card>

          {/* Pagamento */}
          {order.pagamento && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Dados do Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-muted-foreground">Forma</p>
                    <p className="font-medium">{order.pagamento.formaPagamento}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Parcelas</p>
                    <p className="font-medium">{order.pagamento.parcelas}x</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">CPF do Pagador</p>
                    <p className="font-medium">{order.pagamento.cpfPagador}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        </div>

        <div className="mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="w-full">
            Fechar
          </Button>
        </div>

      </SheetContent>
    </Sheet>
  )
}
