export const runtime = "nodejs"

import { NextResponse } from "next/server"

export async function PUT(
  _req: Request,
  { params }: { params: { pedido: string[] } }
) {
  return NextResponse.json({
    ok: true,
    params,
    pedidoExtraido: params?.pedido?.[0] ?? null,
  })
}
