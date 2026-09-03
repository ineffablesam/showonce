import { describe, expect, it, vi } from 'vitest'

import { compareProcedureToRecipient } from '../adaptation/compareProcedureToRecipient'
import { createBrowserRepositories } from '../repositories/browserRepositories'
import {
  applyRecordedCommand,
  applyRecipientCommand,
  completeRecipientSubmission,
  createDemoAccount,
  createRecipientAccount,
  finishRecording,
  startRecording,
  submitWithFreshConfirmation,
} from './productFlow'

class TestStorage implements Storage {
  private readonly values = new Map<string, string>()
  get length() {
    return this.values.size
  }
  clear() {
    this.values.clear()
  }
  getItem(key: string) {
    return this.values.get(key) ?? null
  }
  key(index: number) {
    return [...this.values.keys()][index] ?? null
  }
  removeItem(key: string) {
    this.values.delete(key)
  }
  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

describe('connected ShowOnce product flow', () => {
  it('attaches recipient command activity through the handoff capability', async () => {
    const repositories = createBrowserRepositories({
      storage: new TestStorage(),
      channelFactory: () => undefined,
    })
    const append = vi
      .spyOn(repositories.activity, 'appendForHandoffToken')
      .mockResolvedValue()
    const ownerSave = vi.spyOn(repositories.activity, 'save')
    await applyRecipientCommand(
      repositories,
      createRecipientAccount('normal'),
      { type: 'preview_renewal' },
      {
        handoffToken: 'A'.repeat(24),
        now: () => 2,
        createId: () => 'recipient-event',
      },
    )
    expect(append).toHaveBeenCalledWith(
      'A'.repeat(24),
      expect.objectContaining({ id: 'activity-recipient-event' }),
    )
    expect(ownerSave).not.toHaveBeenCalled()
  })

  it('records human commands and compiles only portable intent', async () => {
    const repositories = createBrowserRepositories({
      storage: new TestStorage(),
      channelFactory: () => undefined,
    })
    const recording = await startRecording(repositories, 'Renew annual benefits', {
      now: () => 1_000,
      createId: () => 'recording-new',
    })
    let account = createDemoAccount()

    const commands = [
      { type: 'set_preference', key: 'renewalFrequency', value: 'annual' },
      { type: 'set_preference', key: 'paperless', value: true },
      { type: 'select_plan', planId: 'gold' },
      { type: 'set_address', address: '14 Private Lane' },
      { type: 'add_dependent', name: 'Jordan' },
      { type: 'add_dependent', name: 'Riley' },
    ] as const

    for (const command of commands) {
      const result = await applyRecordedCommand(
        repositories,
        recording.id,
        account,
        command,
        {
          now: () => 2_000,
          createId: () => `event-${command.type}-${account.dependents.length}`,
        },
      )
      expect(result.event.source).toBe('human')
      account = result.state
    }

    const procedure = await finishRecording(repositories, recording.id)
    expect(procedure.steps.map((step) => step.commandType)).toEqual([
      'set_preference',
      'set_preference',
      'select_plan',
    ])
    expect(JSON.stringify(procedure)).not.toContain('Private Lane')
    expect(JSON.stringify(procedure)).not.toContain('Jordan')
    expect((await repositories.recordings.get(recording.id))?.status).toBe(
      'finished',
    )
  })

  it('adapts safe preferences but asks on a material Gold price difference', async () => {
    const repositories = createBrowserRepositories({
      storage: new TestStorage(),
      channelFactory: () => undefined,
    })
    const recording = await startRecording(repositories, 'Renew annual benefits')
    let samuel = createDemoAccount()

    for (const command of [
      { type: 'set_preference', key: 'renewalFrequency', value: 'annual' },
      { type: 'set_preference', key: 'paperless', value: true },
      { type: 'select_plan', planId: 'gold' },
    ] as const) {
      const result = await applyRecordedCommand(
        repositories,
        recording.id,
        samuel,
        command,
      )
      samuel = result.state
    }

    const procedure = await finishRecording(repositories, recording.id)
    const mom = createRecipientAccount('normal')
    const adaptation = compareProcedureToRecipient(procedure, samuel, mom)

    expect(adaptation.safeActions).toEqual([
      {
        type: 'set_preference',
        key: 'renewalFrequency',
        value: 'annual',
      },
      { type: 'set_preference', key: 'paperless', value: true },
    ])
    expect(adaptation.differences).toContainEqual(
      expect.objectContaining({
        kind: 'material_price_change',
        planId: 'gold',
      }),
    )
    expect(adaptation.needsJudgment).toBe(true)
    expect(mom.address).toBe('Mom recipient address')
    expect(mom.dependents).toEqual(['Avery', 'Casey'])

    const unavailable = compareProcedureToRecipient(
      procedure,
      samuel,
      createRecipientAccount('unavailable'),
    )
    expect(unavailable.needsJudgment).toBe(true)
    expect(unavailable.safeActions).not.toContainEqual(
      expect.objectContaining({ type: 'select_plan' }),
    )
    expect(unavailable.differences).toContainEqual(
      expect.objectContaining({ kind: 'plan_unavailable', planId: 'gold' }),
    )
  })

  it('persists the real submission effect after a fresh confirmation', () => {
    const submitted = submitWithFreshConfirmation(
      { ...createRecipientAccount('normal'), selectedPlanId: 'gold' },
      {
        confirmationNow: 10_000,
        submissionNow: 129_999,
        createId: () => 'event-id',
        createToken: () => 'confirmation-token',
      },
    )

    expect(submitted.ok).toBe(true)
    expect(submitted.state.submittedAt).toBe(129_999)
  })

  it('keeps submission retryable until atomic handoff completion succeeds', async () => {
    const repositories = createBrowserRepositories({
      storage: new TestStorage(),
      channelFactory: () => undefined,
    })
    const account = {
      ...createRecipientAccount('normal'),
      selectedPlanId: 'gold',
    }
    const run = {
      id: 'run-retry',
      handoffId: 'A'.repeat(24),
      scenario: 'normal' as const,
      accountId: account.id,
      phase: 'confirmation' as const,
      createdAt: 1,
      updatedAt: 1,
    }
    const confirmation = {
      token: 'confirmation-token',
      createdAt: 10,
      expiresAt: 130_000,
    }
    const complete = vi
      .spyOn(repositories.handoffs, 'complete')
      .mockRejectedValueOnce(new Error('temporary network failure'))
      .mockResolvedValueOnce({} as never)
    const saveAccount = vi.spyOn(repositories.accounts, 'save')
    const saveRun = vi.spyOn(repositories.runs, 'save')

    await expect(
      completeRecipientSubmission(
        repositories,
        account,
        run,
        confirmation,
        { handoffToken: run.handoffId, now: () => 100 },
      ),
    ).resolves.toMatchObject({
      ok: false,
      reason: 'completion_failed',
      account,
      run: { phase: 'confirmation' },
    })
    expect(saveAccount).not.toHaveBeenCalled()
    expect(saveRun).not.toHaveBeenCalled()

    const retried = await completeRecipientSubmission(
      repositories,
      account,
      run,
      confirmation,
      { handoffToken: run.handoffId, now: () => 101 },
    )
    expect(retried).toMatchObject({
      ok: true,
      account: { submittedAt: 101 },
      run: { phase: 'complete' },
    })
    expect(complete).toHaveBeenCalledTimes(2)
    expect(saveAccount).toHaveBeenCalledTimes(1)
    expect(saveRun).toHaveBeenCalledTimes(1)
  })

  it('requires reconfirmation after expiry without persisting submission', async () => {
    const repositories = createBrowserRepositories({
      storage: new TestStorage(),
      channelFactory: () => undefined,
    })
    const account = {
      ...createRecipientAccount('normal'),
      selectedPlanId: 'gold',
    }
    const run = {
      id: 'run-expiry',
      handoffId: 'A'.repeat(24),
      scenario: 'normal' as const,
      accountId: account.id,
      phase: 'confirmation' as const,
      createdAt: 1,
      updatedAt: 1,
    }
    const complete = vi
      .spyOn(repositories.handoffs, 'complete')
      .mockRejectedValueOnce(
        new Error('Recipient confirmation is invalid, expired, or consumed'),
      )
      .mockResolvedValueOnce({} as never)
    const saveAccount = vi.spyOn(repositories.accounts, 'save')

    const expired = await completeRecipientSubmission(
      repositories,
      account,
      run,
      { token: 'expired', createdAt: 1, expiresAt: 200 },
      { handoffToken: run.handoffId, now: () => 100 },
    )
    expect(expired).toMatchObject({
      ok: false,
      reason: 'confirmation_expired',
      account,
      run: { phase: 'confirmation' },
    })
    expect(complete).toHaveBeenCalledWith(run.handoffId, 'expired', 100)
    expect(saveAccount).not.toHaveBeenCalled()

    const reconfirmed = await completeRecipientSubmission(
      repositories,
      account,
      run,
      { token: 'fresh', createdAt: 101, expiresAt: 120_101 },
      { handoffToken: run.handoffId, now: () => 102 },
    )
    expect(reconfirmed.ok).toBe(true)
    expect(complete).toHaveBeenLastCalledWith(run.handoffId, 'fresh', 102)
    expect(saveAccount).toHaveBeenCalledTimes(1)
  })
})
