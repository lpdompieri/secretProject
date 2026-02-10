export const runtime = "nodejs"

import { NextResponse } from "next/server"

export async function PUT(
  _req: Request,
  ctx: any
) {
  return NextResponse.json({
    rota: "OK",
    ctx,
    params: ctx?.params,
  })
}
