import type { HandoffStatus } from '../model'

const TOKEN_BYTES = 18

const transitions: Record<HandoffStatus, readonly HandoffStatus[]> = {
  created: ['opened', 'expired'],
  opened: ['running', 'expired'],
  running: ['needs_input', 'waiting_confirmation', 'completed', 'expired'],
  needs_input: ['running', 'waiting_confirmation', 'expired'],
  waiting_confirmation: ['running', 'completed', 'expired'],
  completed: [],
  expired: [],
}

export function generatePublicToken(): string {
  return encodeRandom(TOKEN_BYTES)
}

function encodeRandom(size: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(size))
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
    .replace(/\+/gu, '-')
    .replace(/\//gu, '_')
    .replace(/=+$/u, '')
}

export function isPublicToken(value: string): boolean {
  return /^[A-Za-z0-9_-]{24}$/u.test(value)
}

export function isExpired(
  value: { expiresAt?: number },
  now = Date.now(),
): boolean {
  return value.expiresAt !== undefined && value.expiresAt <= now
}

export function assertHandoffTransition(
  from: HandoffStatus,
  to: HandoffStatus,
): void {
  if (!transitions[from].includes(to)) {
    throw new Error(`Illegal handoff status transition: ${from} → ${to}`)
  }
}
