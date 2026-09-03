import { describe, expect, it } from 'vitest'

import { compareProcedureToRecipient } from '../adaptation/compareProcedureToRecipient'
import { executeCommand } from '../commands/executeCommand'
import { confirmationStatus } from '../../components/adaptation/ConfirmationGate'
import type { Command, Handoff, RecordingSession } from '../model'
import { compileProcedure } from '../procedures/compileProcedure'
import {
  createBrowserRepositories,
  decodeHandoff,
  encodeHandoff,
} from '../repositories/browserRepositories'
import {
  applyHelperRecommendation,
  createHelpRequest,
  createDemoAccount,
  createRecipientAccount,
  createRecipientWorkflow,
  recordHelperRecommendation,
} from './productFlow'

class TestStorage implements Storage {
  private readonly values = new Map<string, string>()
  get length() { return this.values.size }
  clear() { this.values.clear() }
  getItem(key: string) { return this.values.get(key) ?? null }
  key(index: number) { return [...this.values.keys()][index] ?? null }
  removeItem(key: string) { this.values.delete(key) }
  setItem(key: string, value: string) { this.values.set(key, value) }
}

const event = (
  id: string,
  commandType: Command['type'],
  policy: 'safe_preference' | 'availability_checked' | 'recipient_specific' | 'state_check' | 'confirmation_required',
  input: Record<string, unknown>,
) => ({
  id,
  commandType,
  source: 'human' as const,
  timestamp: Number(id.replace(/\D/gu, '')) || 1,
  policy,
  status: 'applied' as const,
  input,
})

describe('review-critical product behavior', () => {
  it('compiles a successful seven-action manual renewal including preview and submit', () => {
    const recording: RecordingSession = {
      id: 'recording-complete',
      title: 'Complete renewal',
      createdAt: 1,
      status: 'finished',
      events: [
        event('e1', 'set_preference', 'safe_preference', {
          type: 'set_preference',
          key: 'renewalFrequency',
          value: 'annual',
        }),
        event('e2', 'set_preference', 'safe_preference', {
          type: 'set_preference',
          key: 'paperless',
          value: true,
        }),
        event('e3', 'select_plan', 'availability_checked', {
          type: 'select_plan',
          planId: 'gold',
          observedMonthlyPrice: 88,
        }),
        event('e4', 'review_recipient_details', 'recipient_specific', {
          type: 'review_recipient_details',
        }),
        event('e5', 'preview_renewal', 'state_check', {
          type: 'preview_renewal',
        }),
        event('e6', 'create_confirmation', 'confirmation_required', {
          type: 'create_confirmation',
        }),
        event('e7', 'submit_renewal', 'confirmation_required', {
          type: 'submit_renewal',
        }),
      ],
    }

    const procedure = compileProcedure(recording, recording.events)
    expect(procedure.steps.map((step) => step.commandType)).toEqual([
      'set_preference',
      'set_preference',
      'select_plan',
      'review_recipient_details',
      'preview_renewal',
      'create_confirmation',
      'submit_renewal',
    ])
    expect(procedure.sourceEventIds).toHaveLength(7)

    const recipient = createRecipientAccount('normal')
    const adaptation = compareProcedureToRecipient(
      procedure,
      createDemoAccount(),
      recipient,
    )
    expect(adaptation.skippedActions).toContainEqual(
      expect.objectContaining({ reason: 'recipient_details_preserved' }),
    )
    expect(adaptation.skippedActions).toContainEqual(
      expect.objectContaining({ reason: 'requires_user_confirmation' }),
    )
    expect(createDemoAccount().dependents).toHaveLength(1)
    expect(recipient.dependents).toHaveLength(2)
  })

  it('decodes a sanitized portable handoff without sender storage', () => {
    const procedure = compileProcedure(
      { id: 'r', title: 'Portable', createdAt: 1 },
      [
        event('e1', 'set_preference', 'safe_preference', {
          type: 'set_preference',
          key: 'paperless',
          value: true,
        }),
      ],
    )
    const handoff: Handoff = {
      id: 'portable',
      procedureId: procedure.id,
      title: 'For Mom',
      createdAt: 2,
      procedure,
      recipient: 'Mom',
      note: 'Please review',
      expiresAt: 2 + 7 * 24 * 60 * 60 * 1000,
      policy: {
        allowSafePreferences: true,
        requireConfirmation: true,
        allowHelperEscalation: true,
      },
    }

    expect(decodeHandoff(encodeHandoff(handoff))).toEqual(handoff)
  })

  it('requires human confirmation and judgment before WebMCP consequence', () => {
    const state = createRecipientAccount('normal')
    const createConfirmation = executeCommand(
      {
        state,
        source: 'webmcp',
        now: 10,
        createId: () => 'event',
      },
      { type: 'create_confirmation' },
    )
    expect(createConfirmation).toMatchObject({
      ok: false,
      reason: 'requires_user_confirmation',
    })

    const material = executeCommand(
      {
        state,
        source: 'webmcp',
        now: 10,
        createId: () => 'event',
        planSelectionGuard: {
          demonstratedPlanId: 'gold',
          demonstratedPrice: 88,
          requiresJudgment: true,
        },
      },
      { type: 'select_plan', planId: 'gold' },
    )
    expect(material).toMatchObject({ ok: false, reason: 'judgment_required' })

    const substitution = executeCommand(
      {
        state: createRecipientAccount('unavailable'),
        source: 'webmcp',
        now: 10,
        createId: () => 'event',
        planSelectionGuard: {
          demonstratedPlanId: 'gold',
          demonstratedPrice: 88,
          requiresJudgment: true,
        },
      },
      { type: 'select_plan', planId: 'silver' },
    )
    expect(substitution).toMatchObject({
      ok: false,
      reason: 'judgment_required',
    })

    const humanConfirmation = executeCommand(
      {
        state,
        source: 'human',
        now: 20,
        createId: () => 'human-event',
        createToken: () => 'human-token',
      },
      { type: 'create_confirmation' },
    ).confirmation
    expect(confirmationStatus(humanConfirmation, 21)).toBe('fresh')
    expect(
      executeCommand(
        {
          state: { ...state, selectedPlanId: 'silver' },
          source: 'webmcp',
          now: (humanConfirmation?.expiresAt ?? 0) + 1,
          createId: () => 'expired-event',
          confirmation: humanConfirmation,
        },
        {
          type: 'submit_renewal',
          confirmationToken: humanConfirmation?.token ?? '',
        },
      ),
    ).toMatchObject({ ok: false, reason: 'confirmation_expired' })
    expect(
      confirmationStatus(
        humanConfirmation,
        (humanConfirmation?.expiresAt ?? 0) + 1,
      ),
    ).toBe('expired')
  })

  it('persists workflow phase, helper request, and exact recommendation', async () => {
    const storage = new TestStorage()
    const repositories = createBrowserRepositories({
      storage,
      channelFactory: () => undefined,
    })
    const run = await createRecipientWorkflow(
      repositories,
      'handoff-1',
      'unavailable',
      'mom-unavailable',
    )
    const recommendation = await recordHelperRecommendation(
      repositories,
      run,
      'silver',
    )

    const reloaded = createBrowserRepositories({
      storage,
      channelFactory: () => undefined,
    })
    expect((await reloaded.runs.get(run.id))?.helperRequestId).toBeTruthy()
    expect(recommendation).toMatchObject({
      outcome: 'recommend_plan',
      recommendedPlanId: 'silver',
    })
    expect((await reloaded.runs.get(run.id))?.phase).toBe(
      'helper_resolved',
    )
    expect(
      (await reloaded.decisions.list()).find(
        (decision) => decision.id === recommendation.id,
      ),
    ).toEqual(recommendation)
  })

  it.each(['silver', 'platinum'] as const)(
    'applies the available %s helper recommendation end-to-end',
    async (recommendedPlanId) => {
      const storage = new TestStorage()
      const repositories = createBrowserRepositories({
        storage,
        channelFactory: () => undefined,
      })
      const account = createRecipientAccount('unavailable')
      const run = await createRecipientWorkflow(
        repositories,
        'handoff-1',
        'unavailable',
        account.id,
      )
      const request = await createHelpRequest(repositories, 'handoff-1')
      const waiting = {
        ...run,
        helperRequestId: request.id,
        phase: 'awaiting_helper' as const,
      }
      const decision = await recordHelperRecommendation(
        repositories,
        waiting,
        recommendedPlanId,
      )

      const result = await applyHelperRecommendation(
        repositories,
        account,
        waiting,
        decision,
        { handoffToken: 'handoff-1' },
      )

      expect(result.command.ok).toBe(true)
      expect(result.account.selectedPlanId).toBe(recommendedPlanId)
      expect(result.run).toMatchObject({
        phase: 'confirmation',
        selectedPlanId: recommendedPlanId,
        lastOutcome: 'helper',
      })
    },
  )

  it('does not advance after a failed helper plan selection', async () => {
    const storage = new TestStorage()
    const repositories = createBrowserRepositories({
      storage,
      channelFactory: () => undefined,
    })
    const account = createRecipientAccount('normal')
    const run = await createRecipientWorkflow(
      repositories,
      'handoff-1',
      'normal',
      account.id,
    )

    const result = await applyHelperRecommendation(
      repositories,
      account,
      run,
      {
        id: 'decision-missing',
        requestId: 'request-1',
        outcome: 'recommend_plan',
        recommendedPlanId: 'platinum',
        decidedAt: 1,
      },
      { handoffToken: 'handoff-1' },
    )

    expect(result.command).toMatchObject({
      ok: false,
      reason: 'plan_unavailable',
    })
    expect(result.account).toEqual(account)
    expect(result.run.phase).toBe('explain')
    expect(result.run.selectedPlanId).toBeUndefined()
  })
})
