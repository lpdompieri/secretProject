import "server-only"

import { cookies } from "next/headers"

export interface ServerSession {
  userId: string
  name: string
  email: string
  role: string
  companyId: string
  isAdmin: boolean
  scopes: string[]
}

interface JwtPayload {
  sub?: string
  email?: string
  name?: string
  "custom:role"?: string
  "custom:companyId"?: string
  scope?: string
}

function decodeJwtPayload(token: string): JwtPayload | null {
  const [, payload] = token.split(".")
  if (!payload) return null

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4)
    const json = Buffer.from(padded, "base64").toString("utf-8")
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

function parseScopes(value?: string): string[] {
  if (!value) return []
  return value
    .split(" ")
    .map((scope) => scope.trim())
    .filter(Boolean)
}

export async function getServerSession(): Promise<ServerSession | null> {
  try {
    const cookieStore = await cookies()

    const idToken =
      cookieStore.get("id_token")?.value ??
      cookieStore.get("idToken")?.value ??
      cookieStore.get("finvia_id_token")?.value

    const accessToken =
      cookieStore.get("access_token")?.value ??
      cookieStore.get("accessToken")?.value ??
      cookieStore.get("finvia_access_token")?.value

    if (!idToken && !accessToken) {
      return null
    }

    const idPayload = idToken ? decodeJwtPayload(idToken) : null
    const accessPayload = accessToken ? decodeJwtPayload(accessToken) : null

    const role = idPayload?.["custom:role"] ?? ""
    const scopes = parseScopes(accessPayload?.scope)

    return {
      userId: idPayload?.sub ?? "",
      name: idPayload?.name ?? "",
      email: idPayload?.email ?? "",
      role,
      companyId: idPayload?.["custom:companyId"] ?? "",
      isAdmin: role === "ADMIN",
      scopes,
    }
  } catch (error) {
    console.error("❌ getServerSession crash", error)
    return null
  }
}
