import { getCookie, setCookie } from '@tanstack/react-start/server'

import { normalizeUsername } from '../lib/workspaceUsername'

export const OWNER_COOKIE_NAME = '__Host-showonce-owner'
export const USERNAME_COOKIE_NAME = '__Host-showonce-username'

export function ownerCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: true,
    path: '/',
  }
}

/** @deprecated Prefer explicit username sessions via openWorkspaceServer. */
export const OWNER_COOKIE_OPTIONS = ownerCookieOptions()

function isOwnerCapability(value: string): boolean {
  return /^own_[A-Za-z0-9_-]{32}$/u.test(value)
}

export async function deriveOwnerCapabilityFromUsername(
  username: string,
): Promise<string> {
  const normalized = normalizeUsername(username)
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`showonce-workspace:${normalized}`),
  )
  const bytes = new Uint8Array(digest)
  const alphabet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
  let token = ''
  for (let index = 0; index < 32; index += 1) {
    token += alphabet[bytes[index]! % alphabet.length]!
  }
  return `own_${token}`
}

export function getWorkspaceUsername(): string | null {
  const username = getCookie(USERNAME_COOKIE_NAME)
  if (!username) return null
  const normalized = normalizeUsername(username)
  return normalized.length >= 2 ? normalized : null
}

export function getOwnerCapability(): string {
  const token = getCookie(OWNER_COOKIE_NAME)
  if (token && isOwnerCapability(token)) return token
  throw new Error('Workspace session required')
}

export function getOrCreateOwnerCapability(): string {
  return getOwnerCapability()
}

export async function openWorkspaceSession(username: string): Promise<{
  username: string
  token: string
}> {
  const normalized = normalizeUsername(username)
  const token = await deriveOwnerCapabilityFromUsername(normalized)
  const options = ownerCookieOptions()
  setCookie(OWNER_COOKIE_NAME, token, options)
  setCookie(USERNAME_COOKIE_NAME, normalized, options)
  return { username: normalized, token }
}

export function clearWorkspaceSession(): void {
  const options = ownerCookieOptions()
  setCookie(OWNER_COOKIE_NAME, '', { ...options, maxAge: 0 })
  setCookie(USERNAME_COOKIE_NAME, '', { ...options, maxAge: 0 })
}

export function resolveOwnerCapability(
  existing: string | undefined,
  generate: () => string,
): { token: string; shouldSet: boolean } {
  if (existing && isOwnerCapability(existing)) {
    return { token: existing, shouldSet: false }
  }
  return { token: generate(), shouldSet: true }
}
