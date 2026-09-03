import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import {
  RECIPIENT_COOKIE_NAME,
  RECIPIENT_COOKIE_OPTIONS,
  isRecipientCapability,
  resolveRecipientCapability,
} from './recipientCapability'

describe('recipient capability cookie', () => {
  it('accepts only a cryptographically strong distinct recipient capability', () => {
    const token = `rcp_${'A'.repeat(43)}`
    expect(resolveRecipientCapability(undefined, () => token)).toEqual({
      token,
      shouldSet: true,
    })
    expect(resolveRecipientCapability(token, () => 'unused')).toEqual({
      token,
      shouldSet: false,
    })
    expect(isRecipientCapability(token)).toBe(true)
    expect(isRecipientCapability(`own_${'A'.repeat(32)}`)).toBe(false)
    expect(RECIPIENT_COOKIE_NAME).not.toContain('owner')
    expect(RECIPIENT_COOKIE_OPTIONS).toEqual({
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
    })
  })

  it('keeps recipient capability details out of client state and tool contracts', () => {
    const clientSources = [
      '../routes/s.$publicToken.tsx',
      '../webmcp/types.ts',
      '../webmcp/definitions/tools.ts',
      '../domain/repositories/appRepositories.ts',
    ].map((path) =>
      readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8'),
    )
    for (const source of clientSources) {
      expect(source).not.toContain(RECIPIENT_COOKIE_NAME)
      expect(source).not.toMatch(/rcp_\[|recipientToken|recipientCapability/iu)
      expect(source).not.toMatch(/localStorage.*recipient/iu)
    }
  })
})
