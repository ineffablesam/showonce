import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import {
  OWNER_COOKIE_OPTIONS,
  resolveOwnerCapability,
} from './ownerCapability'

describe('owner workspace cookie', () => {
  it('reuses a valid cookie and creates an invalid or missing one', () => {
    const valid = `own_${'A'.repeat(32)}`
    expect(resolveOwnerCapability(valid, () => 'unused')).toEqual({
      token: valid,
      shouldSet: false,
    })
    expect(
      resolveOwnerCapability(undefined, () => `own_${'B'.repeat(32)}`),
    ).toEqual({
      token: `own_${'B'.repeat(32)}`,
      shouldSet: true,
    })
    expect(
      resolveOwnerCapability('invalid', () => `own_${'C'.repeat(32)}`),
    ).toEqual({
      token: `own_${'C'.repeat(32)}`,
      shouldSet: true,
    })
    expect(resolveOwnerCapability(undefined).token).toMatch(
      /^own_[A-Za-z0-9_-]{32}$/,
    )
  })

  it('uses an HttpOnly SameSite=Lax session cookie', () => {
    expect(OWNER_COOKIE_OPTIONS).toMatchObject({
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })
    expect(OWNER_COOKIE_OPTIONS).not.toHaveProperty('maxAge')
    expect(OWNER_COOKIE_OPTIONS).not.toHaveProperty('expires')
  })

  it('keeps owner capability and shared authorization out of browser storage', () => {
    const appRepositories = readFileSync(
      fileURLToPath(
        new URL('../domain/repositories/appRepositories.ts', import.meta.url),
      ),
      'utf8',
    )
    expect(appRepositories).not.toMatch(
      /localStorage|OWNER_STORAGE_KEY|generateOwnerCapability|ownerToken/u,
    )
  })
})
