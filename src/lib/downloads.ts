import { DownloadToken } from "@/types/download"

const TOKENS: DownloadToken[] = []

export function createToken(params: Omit<DownloadToken, "token">) {
  const token = crypto.randomUUID().replace(/-/g, "")
  const t: DownloadToken = { token, ...params }
  TOKENS.push(t)
  return t
}

export function getToken(token: string) {
  return TOKENS.find(t => t.token === token) || null
}

export function consumeToken(token: string) {
  const t = getToken(token)
  if (!t) return null
  t.remaining = Math.max(0, t.remaining - 1)
  return t
}

export function cleanupExpired(now = new Date()) {
  for (let i = TOKENS.length - 1; i >= 0; i--) {
    const t = TOKENS[i]
    if (new Date(t.expiresAt).getTime() < now.getTime() || t.remaining <= 0) {
      TOKENS.splice(i, 1)
    }
  }
}

export function listTokensByOrder(orderId: string) {
  return TOKENS.filter(t => t.orderId === orderId)
}
