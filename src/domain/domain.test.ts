import { describe, expect, it } from 'vitest'

import { compareProcedureToRecipient } from './adaptation/compareProcedureToRecipient'
import { executeCommand } from './commands/executeCommand'
import type {
  AccountState,
  Command,
  Procedure,
  SemanticEvent,
} from './model'
import { compileProcedure } from './procedures/compileProcedure'
import { sanitizeSensitive } from './security/sanitize'

const account = (overrides: Partial<AccountState> = {}): AccountState => ({
  id: 'recipient-1',
  availablePlans: [
    { id: 'silver', name: 'Silver PPO', monthlyPrice: 400 },
    { id: 'gold', name: 'Gold PPO', monthlyPrice: 520 },
  ],
  selectedPlanId: null,
  preferences: { paperless: false, communication: 'mail' },
  address: 'Recipient-only address',
  dependents: [],
  submittedAt: null,
  ...overrides,
})

describe('sanitizeSensitive', () => {
  it('recursively removes credentials, sessions, browser artifacts, and recipient values', () => {
    const value = {
      username: 'safe label',
      password: 'secret',
      nested: {
        sessionToken: 'token',
        selector: '#submit',
        coordinates: { x: 1, y: 2 },
        screenshot: 'data:image/png',
        recipientAddress: 'private',
      },
      items: [{ apiKey: 'key', preference: 'paperless' }],
    }

    expect(sanitizeSensitive(value)).toEqual({
      username: 'safe label',
      nested: {},
      items: [{ preference: 'paperless' }],
    })
  })

  it('terminates safely when an array contains itself', () => {
    const cyclic: unknown[] = []
    cyclic.push(cyclic)

    expect(sanitizeSensitive(cyclic)).toEqual([undefined])
  })
})

describe('executeCommand', () => {
  it('applies a safe preference and emits a sanitized semantic event', () => {
    const result = executeCommand(
      { state: account(), source: 'human', now: 1_000, createId: () => 'event-1' },
      { type: 'set_preference', key: 'paperless', value: true, password: 'never-log' },
    )

    expect(result.ok).toBe(true)
    expect(result.state.preferences.paperless).toBe(true)
    expect(result.event).toMatchObject({
      id: 'event-1',
      commandType: 'set_preference',
      source: 'human',
      policy: 'safe_preference',
      input: { type: 'set_preference', key: 'paperless', value: true },
    })
  })

  it('refuses unavailable plans without mutating state', () => {
    const state = account()
    const result = executeCommand(
      { state, source: 'webmcp', now: 2_000, createId: () => 'event-2' },
      { type: 'select_plan', planId: 'missing' },
    )

    expect(result).toMatchObject({
      ok: false,
      state,
      reason: 'plan_unavailable',
      event: { status: 'refused', source: 'webmcp' },
    })
  })

  it('emits only allowlisted metadata for recipient-specific commands', () => {
    const result = executeCommand(
      { state: account(), source: 'human', now: 3_000, createId: () => 'event-private' },
      { type: 'add_dependent', name: 'Private Dependent Name' },
    )

    expect(result.ok).toBe(true)
    expect(result.state.dependents).toEqual(['Private Dependent Name'])
    expect(result.event.input).toEqual({ type: 'add_dependent' })
    expect(JSON.stringify(result.event)).not.toContain('Private Dependent Name')
  })

  it('rejects runtime-invalid preference key and value combinations', () => {
    const state = account()
    const result = executeCommand(
      { state, source: 'webmcp', now: 4_000, createId: () => 'event-invalid' },
      {
        type: 'set_preference',
        key: 'paperless',
        value: 'email',
      } as unknown as Command,
    )

    expect(result).toMatchObject({
      ok: false,
      state,
      reason: 'invalid_command',
      event: { status: 'refused', input: { type: 'set_preference' } },
    })
  })

  it('records the authoritative selected-plan price', () => {
    const result = executeCommand(
      { state: account(), source: 'human', now: 4_500, createId: () => 'event-plan' },
      {
        type: 'select_plan',
        planId: 'silver',
        observedMonthlyPrice: 1,
      } as unknown as Command,
    )

    expect(result.event.input).toEqual({
      type: 'select_plan',
      planId: 'silver',
      observedMonthlyPrice: 400,
    })
  })

  it('requires a fresh recipient confirmation before final submission', () => {
    const confirmation = executeCommand(
      {
        state: account(),
        source: 'human',
        now: 5_000,
        createId: () => 'event-confirmation',
        createToken: () => 'confirmation-1',
      },
      { type: 'create_confirmation' },
    )

    expect(confirmation.confirmation).toEqual({
      token: 'confirmation-1',
      createdAt: 5_000,
      expiresAt: 125_000,
    })
    expect(confirmation.event.id).toBe('event-confirmation')
    expect(confirmation.event.id).not.toBe(confirmation.confirmation?.token)
    expect(JSON.stringify(confirmation.event)).not.toContain('confirmation-1')

    const submitted = executeCommand(
      {
        state: { ...confirmation.state, selectedPlanId: 'silver' },
        source: 'webmcp',
        now: 124_999,
        createId: () => 'event-3',
        confirmation: confirmation.confirmation,
      },
      { type: 'submit_renewal', confirmationToken: 'confirmation-1' },
    )
    expect(submitted.ok).toBe(true)
    expect(submitted.state.submittedAt).toBe(124_999)

    const expired = executeCommand(
      {
        state: account({ selectedPlanId: 'silver' }),
        source: 'webmcp',
        now: 125_001,
        createId: () => 'event-4',
        confirmation: confirmation.confirmation,
      },
      { type: 'submit_renewal', confirmationToken: 'confirmation-1' },
    )
    expect(expired).toMatchObject({ ok: false, reason: 'confirmation_expired' })
  })

  it('refuses submission when no valid available plan is selected', () => {
    const confirmation = {
      token: 'confirmation-1',
      createdAt: 5_000,
      expiresAt: 125_000,
    }
    for (const state of [
      account({ selectedPlanId: null }),
      account({ selectedPlanId: 'retired-plan' }),
    ]) {
      expect(
        executeCommand(
          {
            state,
            source: 'webmcp',
            now: 6_000,
            createId: () => 'event-submit-without-plan',
            confirmation,
          },
          { type: 'submit_renewal', confirmationToken: confirmation.token },
        ),
      ).toMatchObject({
        ok: false,
        state,
        reason: 'plan_required',
      })
    }
  })

  it('validates typed helper decisions without persisting them itself', () => {
    const valid = executeCommand(
      { state: account(), source: 'webmcp', now: 6_000, createId: () => 'decision-1' },
      {
        type: 'record_decision',
        requestId: 'request-1',
        outcome: 'choose_demonstrated',
      },
    )
    expect(valid).toMatchObject({
      ok: true,
      decision: {
        id: 'decision-1',
        requestId: 'request-1',
        outcome: 'choose_demonstrated',
        decidedAt: 6_000,
      },
      event: {
        commandType: 'record_decision',
        input: {
          type: 'record_decision',
          requestId: 'request-1',
          outcome: 'choose_demonstrated',
        },
      },
    })

    const invalid = executeCommand(
      { state: account(), source: 'webmcp', now: 6_001, createId: () => 'decision-2' },
      {
        type: 'record_decision',
        requestId: '',
        outcome: 'invented',
      } as unknown as Command,
    )
    expect(invalid).toMatchObject({ ok: false, reason: 'invalid_command' })
    expect(invalid.decision).toBeUndefined()
  })
})

describe('compileProcedure', () => {
  it('compiles portable successful events and excludes recipient-specific values', () => {
    const events: SemanticEvent[] = [
      {
        id: 'event-1',
        commandType: 'set_preference',
        source: 'human',
        timestamp: 10,
        policy: 'safe_preference',
        status: 'applied',
        input: { type: 'set_preference', key: 'paperless', value: true },
      },
      {
        id: 'event-2',
        commandType: 'set_address',
        source: 'human',
        timestamp: 20,
        policy: 'recipient_specific',
        status: 'applied',
        input: { type: 'set_address' },
      },
      {
        id: 'event-3',
        commandType: 'select_plan',
        source: 'human',
        timestamp: 30,
        policy: 'availability_checked',
        status: 'applied',
        input: { type: 'select_plan', planId: 'silver', observedMonthlyPrice: 400 },
      },
    ]

    const procedure = compileProcedure(
      { id: 'recording-1', title: 'Renew benefits', createdAt: 1 },
      events,
    )

    expect(procedure.steps.map((step) => step.commandType)).toEqual([
      'set_preference',
      'select_plan',
    ])
    expect(JSON.stringify(procedure)).not.toContain('address')
    expect(procedure.sourceEventIds).toEqual(['event-1', 'event-3'])
  })
})

describe('compareProcedureToRecipient', () => {
  const procedure: Procedure = {
    id: 'procedure-1',
    recordingId: 'recording-1',
    title: 'Renew benefits',
    createdAt: 1,
    sourceEventIds: ['event-1', 'event-2'],
    steps: [
      {
        id: 'step-1',
        commandType: 'set_preference',
        policy: 'safe_preference',
        input: { type: 'set_preference', key: 'paperless', value: true },
      },
      {
        id: 'step-2',
        commandType: 'select_plan',
        policy: 'availability_checked',
        input: { type: 'select_plan', planId: 'silver', observedMonthlyPrice: 400 },
      },
    ],
  }

  it('returns safe actions for normal recipient differences', () => {
    const result = compareProcedureToRecipient(procedure, account(), account())

    expect(result.safeActions).toEqual([
      { type: 'set_preference', key: 'paperless', value: true },
      { type: 'select_plan', planId: 'silver' },
    ])
    expect(result.needsJudgment).toBe(false)
    expect(result.confirmationRequired).toBe(true)
  })

  it('requires judgment when a matching plan price changes by more than 25%', () => {
    const recipient = account({
      availablePlans: [{ id: 'silver', name: 'Silver PPO', monthlyPrice: 501 }],
    })

    const result = compareProcedureToRecipient(procedure, account(), recipient)

    expect(result.safeActions).not.toContainEqual({
      type: 'select_plan',
      planId: 'silver',
    })
    expect(result.needsJudgment).toBe(true)
    expect(result.differences).toContainEqual(
      expect.objectContaining({ kind: 'material_price_change', percentChange: 25.25 }),
    )
  })

  it('requires judgment when a zero-price demonstrated plan becomes positive', () => {
    const freeProcedure: Procedure = {
      ...procedure,
      steps: procedure.steps.map((step) =>
        step.commandType === 'select_plan'
          ? {
              ...step,
              input: {
                type: 'select_plan' as const,
                planId: 'silver',
                observedMonthlyPrice: 0,
              },
            }
          : step,
      ),
    }
    const initial = account({
      availablePlans: [{ id: 'silver', name: 'Silver PPO', monthlyPrice: 0 }],
    })
    const recipient = account({
      availablePlans: [{ id: 'silver', name: 'Silver PPO', monthlyPrice: 1 }],
    })

    const result = compareProcedureToRecipient(freeProcedure, initial, recipient)

    expect(result.needsJudgment).toBe(true)
    expect(result.safeActions).not.toContainEqual({
      type: 'select_plan',
      planId: 'silver',
    })
    expect(result.differences).toContainEqual(
      expect.objectContaining({
        kind: 'material_price_change',
        planId: 'silver',
      }),
    )
  })

  it('requires judgment instead of substituting an unavailable plan', () => {
    const recipient = account({
      availablePlans: [{ id: 'gold', name: 'Gold PPO', monthlyPrice: 520 }],
    })

    const result = compareProcedureToRecipient(procedure, account(), recipient)

    expect(result.needsJudgment).toBe(true)
    expect(result.differences).toContainEqual(
      expect.objectContaining({ kind: 'plan_unavailable', planId: 'silver' }),
    )
  })
})
