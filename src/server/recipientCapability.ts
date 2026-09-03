import { getCookie, setCookie } from '@tanstack/react-start/server'

export const RECIPIENT_COOKIE_NAME = '__Host-showonce-recipient'
export const RECIPIENT_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: true,
  path: '/',
}

function generateRecipientCapability(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return `rcp_${btoa(binary)
    .replace(/\+/gu, '-')
    .replace(/\//gu, '_')
    .replace(/=+$/u, '')}`
}

export function isRecipientCapability(value: string): boolean {
  return /^rcp_[A-Za-z0-9_-]{43}$/u.test(value)
}

export function resolveRecipientCapability(
  existing: string | undefined,
  generate: () => string = generateRecipientCapability,
): { token: string; shouldSet: boolean } {
  if (existing && isRecipientCapability(existing)) {
    return { token: existing, shouldSet: false }
  }
  return { token: generate(), shouldSet: true }
}

export function getOrCreateRecipientCapability(): string {
  const resolved = resolveRecipientCapability(getCookie(RECIPIENT_COOKIE_NAME))
  if (resolved.shouldSet) {
    setCookie(RECIPIENT_COOKIE_NAME, resolved.token, RECIPIENT_COOKIE_OPTIONS)
  }
  return resolved.token
}

export function getRecipientCapability(): string {
  const value = getCookie(RECIPIENT_COOKIE_NAME)
  if (!value || !isRecipientCapability(value)) {
    throw new Error('Recipient capability is unavailable')
  }
  return value
}
