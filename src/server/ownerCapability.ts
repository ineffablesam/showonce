import { getCookie, setCookie } from '@tanstack/react-start/server'

export const OWNER_COOKIE_NAME = '__Host-showonce-owner'
export const OWNER_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: true,
  path: '/',
}

function generateOwnerCapability(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24))
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  const encoded = btoa(binary)
    .replace(/\+/gu, '-')
    .replace(/\//gu, '_')
    .replace(/=+$/u, '')
  return `own_${encoded}`
}

function isOwnerCapability(value: string): boolean {
  return /^own_[A-Za-z0-9_-]{32}$/u.test(value)
}

export function resolveOwnerCapability(
  existing: string | undefined,
  generate: () => string = generateOwnerCapability,
): { token: string; shouldSet: boolean } {
  if (existing && isOwnerCapability(existing)) {
    return { token: existing, shouldSet: false }
  }
  return { token: generate(), shouldSet: true }
}

export function getOrCreateOwnerCapability(): string {
  const resolved = resolveOwnerCapability(getCookie(OWNER_COOKIE_NAME))
  if (resolved.shouldSet) {
    setCookie(OWNER_COOKIE_NAME, resolved.token, OWNER_COOKIE_OPTIONS)
  }
  return resolved.token
}
