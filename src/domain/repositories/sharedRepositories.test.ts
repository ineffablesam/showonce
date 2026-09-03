import { describe, expect, it } from 'vitest'

import type { Handoff, HelpRequest, Procedure } from '../model'
import {
  assertHandoffTransition,
  generatePublicToken,
  isExpired,
  isPublicToken,
} from '../sharing/publicCapabilities'
import {
  createLocalOnlySharedRepositories,
  selectSharedPersistence,
} from './sharedRepositories'

const procedure: Procedure = {
  id: 'procedure-1',
  recordingId: 'recording-1',
  title: 'Renew benefits',
  createdAt: 1,
  sourceEventIds: [],
  steps: [],
}

describe('public sharing capabilities', () => {
  it('generates unique base64url tokens with at least 128 bits', () => {
    const tokens = new Set(Array.from({ length: 256 }, generatePublicToken))

    expect(tokens.size).toBe(256)
    for (const token of tokens) {
      expect(isPublicToken(token)).toBe(true)
      expect(token).toMatch(/^[A-Za-z0-9_-]{22,}$/)
    }
  })

  it('accepts only legal handoff lifecycle transitions', () => {
    expect(() => assertHandoffTransition('created', 'opened')).not.toThrow()
    expect(() => assertHandoffTransition('opened', 'running')).not.toThrow()
    expect(() => assertHandoffTransition('running', 'needs_input')).not.toThrow()
    expect(() =>
      assertHandoffTransition('needs_input', 'waiting_confirmation'),
    ).not.toThrow()
    expect(() =>
      assertHandoffTransition('waiting_confirmation', 'completed'),
    ).not.toThrow()
    expect(() => assertHandoffTransition('created', 'completed')).toThrow(
      'Illegal handoff status transition',
    )
    expect(() => assertHandoffTransition('completed', 'running')).toThrow(
      'Illegal handoff status transition',
    )
  })

  it('treats the exact expiry instant as expired', () => {
    expect(isExpired({ expiresAt: 10 }, 9)).toBe(false)
    expect(isExpired({ expiresAt: 10 }, 10)).toBe(true)
  })
})

describe('shared repository boundary', () => {
  it('requires Supabase for runtime shared resources', () => {
    expect(
      selectSharedPersistence(
        { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_ANON_KEY: 'key' },
        'production',
      ),
    ).toBe('supabase')
    expect(() => selectSharedPersistence({}, 'development')).toThrow(
      'Shared persistence is unavailable',
    )
    expect(() => selectSharedPersistence({}, 'production')).toThrow(
      'Shared persistence is unavailable',
    )
  })

  it('lets independent clients load a handoff using only its public token', async () => {
    const sharedState = new Map<string, unknown>()
    const sender = createLocalOnlySharedRepositories({ sharedState })
    const recipient = createLocalOnlySharedRepositories({ sharedState })
    const token = generatePublicToken()
    const handoff: Handoff = {
      id: 'internal-handoff-id',
      publicToken: token,
      procedureId: procedure.id,
      title: 'For Mom',
      createdAt: 1,
      updatedAt: 1,
      expiresAt: 1 + 7 * 24 * 60 * 60 * 1000,
      status: 'created',
      procedure,
    }

    await sender.handoffs.save(handoff)
    const loaded = await recipient.handoffs.getByPublicToken(token, 2)

    expect(loaded).toMatchObject({
      publicToken: token,
      title: 'For Mom',
      status: 'created',
    })
    expect((await sender.handoffs.get(handoff.id))?.status).toBe('created')
    expect(loaded).not.toHaveProperty('recipientCapability')
    expect(loaded).not.toHaveProperty('recipientToken')
    await recipient.handoffs.markOpened(token, 2)
    expect((await sender.handoffs.get(handoff.id))?.status).toBe('opened')
    expect(JSON.stringify(loaded)).not.toContain('internal-handoff-id')
  })

  it('round-trips a minimum-information helper decision by polling', async () => {
    const sharedState = new Map<string, unknown>()
    const recipient = createLocalOnlySharedRepositories({ sharedState })
    const helper = createLocalOnlySharedRepositories({ sharedState })
    const requestToken = generatePublicToken()
    const parentToken = generatePublicToken()
    await recipient.handoffs.save({
      id: 'internal-handoff-id',
      publicToken: parentToken,
      procedureId: procedure.id,
      title: 'For Mom',
      createdAt: 1,
      updatedAt: 1,
      expiresAt: 1 + 7 * 24 * 60 * 60 * 1000,
      status: 'created',
      procedure,
      policy: {
        allowSafePreferences: true,
        requireConfirmation: true,
        allowHelperEscalation: true,
      },
    })
    const request: HelpRequest = {
      id: 'internal-request-id',
      publicToken: requestToken,
      handoffId: 'internal-handoff-id',
      createdAt: 1,
      updatedAt: 1,
      expiresAt: 1 + 7 * 24 * 60 * 60 * 1000,
      status: 'open',
      detail: 'plan_unavailable',
      options: ['silver', 'platinum', 'let_recipient_decide'],
    }

    await recipient.helpRequests.createForHandoffToken(
      parentToken,
      request,
      2,
    )
    const publicRequest = await helper.helpRequests.getByPublicToken(
      requestToken,
      2,
    )
    expect(publicRequest).toEqual({
      publicToken: requestToken,
      expiresAt: request.expiresAt,
      status: 'open',
      detail: 'plan_unavailable',
      options: request.options,
    })
    expect(JSON.stringify(publicRequest)).not.toMatch(
      /internal-request-id|internal-handoff-id|address|dependent|account/i,
    )

    await helper.decisions.saveForRequestToken(
      requestToken,
      {
        id: 'internal-decision-id',
        requestId: 'not-trusted-by-shared-storage',
        outcome: 'recommend_plan',
        recommendedPlanId: 'silver',
        decidedAt: 3,
      },
      3,
    )

    await expect(recipient.decisions.pollByRequestToken(requestToken, 4)).resolves
      .toMatchObject({
        outcome: 'recommend_plan',
        recommendedPlanId: 'silver',
      })
  })

  it('requires a bound recipient and fresh single-use confirmation to complete', async () => {
    const sharedState = new Map<string, unknown>()
    const recipient = createLocalOnlySharedRepositories({ sharedState })
    const attacker = createLocalOnlySharedRepositories({ sharedState })
    const token = generatePublicToken()
    const startedAt = Date.now()
    await recipient.handoffs.save({
      id: 'secure-handoff',
      publicToken: token,
      procedureId: procedure.id,
      title: 'For Mom',
      createdAt: startedAt,
      updatedAt: startedAt,
      expiresAt: startedAt + 1_000_000,
      status: 'created',
      procedure,
    })

    await recipient.handoffs.markOpened(token, startedAt + 2)
    await recipient.handoffs.transitionByPublicToken(token, 'running', startedAt + 3)
    await recipient.activity.appendForHandoffToken(token, {
      id: 'forged-activity',
      kind: 'command',
      timestamp: startedAt + 4,
      source: 'human',
      commandType: 'create_confirmation',
      policy: 'confirmation_required',
      outcome: 'applied',
    })
    await expect(
      recipient.handoffs.transitionByPublicToken(token, 'completed', startedAt + 5),
    ).rejects.toThrow()
    await expect(attacker.handoffs.markOpened(token, startedAt + 5)).rejects.toThrow(
      'recipient',
    )

    const confirmation = await recipient.handoffs.createConfirmation(token, startedAt + 10)
    await expect(
      attacker.handoffs.complete(token, confirmation.token, startedAt + 11),
    ).rejects.toThrow('recipient')
    await expect(
      recipient.handoffs.complete(token, 'wrong-token', startedAt + 11),
    ).rejects.toThrow('confirmation')
    await expect(
      recipient.handoffs.complete(token, confirmation.token, startedAt + 130_010),
    ).rejects.toThrow('expired')

    const fresh = await recipient.handoffs.createConfirmation(token, startedAt + 20)
    await expect(
      recipient.handoffs.complete(token, fresh.token, startedAt + 21),
    ).resolves.toMatchObject({ status: 'completed' })
    await expect(
      recipient.handoffs.complete(token, fresh.token, startedAt + 22),
    ).rejects.toThrow('consumed')
  })
})
