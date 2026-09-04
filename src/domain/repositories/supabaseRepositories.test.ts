import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import type {
  ActivityEvent,
  Confirmation,
  Handoff,
  HandoffStatus,
  HelperDecision,
  HelpRequest,
  Procedure,
} from '../model'
import {
  generatePublicToken,
  isPublicToken,
} from '../sharing/publicCapabilities'
import {
  SupabaseActivityRepository,
  SupabaseDecisionRepository,
  SupabaseHandoffRepository,
  SupabaseHelpRequestRepository,
  SupabaseProcedureRepository,
} from './supabaseRepositories'
import type {
  PublicHandoff,
  PublicHelpRequest,
  SharedTransport,
} from './supabaseRepositories'

const DAY = 24 * 60 * 60 * 1000
const ownerToken = `own_${'B'.repeat(32)}`
const handoffToken = 'A'.repeat(24)
const requestToken = 'C'.repeat(24)

const procedure: Procedure = {
  id: 'procedure-1',
  recordingId: 'recording-1',
  title: 'Renew benefits',
  createdAt: 1,
  sourceEventIds: [],
  steps: [],
}

class FakeSharedTransport implements SharedTransport {
  private clock = 0
  private confirmation?: Confirmation & {
    handoffToken: string
    consumedAt?: number
  }
  readonly procedures = new Map<string, { owner: string; value: Procedure }>()
  readonly handoffs = new Map<string, { owner: string; value: Handoff }>()
  readonly requests = new Map<string, { owner: string; value: HelpRequest }>()
  readonly decisions = new Map<
    string,
    { owner: string; value: HelperDecision }
  >()
  readonly activity = new Map<
    string,
    { owner: string; value: ActivityEvent; handoffToken?: string }
  >()

  async createProcedure(input: {
    procedure: Procedure
  }): Promise<void> {
    this.procedures.set(input.procedure.id, {
      owner: ownerToken,
      value: structuredClone(input.procedure),
    })
  }

  async listProcedures(): Promise<Procedure[]> {
    return [...this.procedures.values()]
      .filter(({ owner }) => owner === ownerToken)
      .map(({ value }) => structuredClone(value))
  }

  async getProcedure(input: {
    id?: string
    recordingId?: string
  }): Promise<Procedure | null> {
    return (
      [...this.procedures.values()].find(
        ({ owner, value }) =>
          owner === ownerToken &&
          (value.id === input.id || value.recordingId === input.recordingId),
      )?.value ?? null
    )
  }

  async deleteProcedure(input: { id: string }): Promise<void> {
    const entry = [...this.procedures.entries()].find(
      ([, stored]) => stored.owner === ownerToken && stored.value.id === input.id,
    )
    if (!entry) return
    this.procedures.delete(entry[0])
    for (const [key, stored] of [...this.handoffs.entries()]) {
      if (stored.owner === ownerToken && stored.value.procedureId === input.id) {
        this.handoffs.delete(key)
      }
    }
  }

  async createHandoff(input: {
    handoff: Handoff
  }): Promise<void> {
    this.handoffs.set(input.handoff.id, {
      owner: ownerToken,
      value: structuredClone(input.handoff),
    })
  }

  async listHandoffs(): Promise<Handoff[]> {
    return [...this.handoffs.values()]
      .filter(({ owner }) => owner === ownerToken)
      .map(({ value }) => structuredClone(value))
  }

  async getHandoff(input: {
    id: string
  }): Promise<Handoff | null> {
    const stored = this.handoffs.get(input.id)
    if (
      stored &&
      (stored.value.expiresAt ?? Number.POSITIVE_INFINITY) <= this.clock &&
      stored.value.status !== 'expired'
    ) {
      stored.value = { ...stored.value, status: 'expired', updatedAt: this.clock }
    }
    return stored?.owner === ownerToken
      ? structuredClone(stored.value)
      : null
  }

  async deleteHandoff(input: { id: string }): Promise<void> {
    const stored = this.handoffs.get(input.id)
    if (stored?.owner === ownerToken) this.handoffs.delete(input.id)
  }

  async getPublicHandoff(input: {
    publicToken: string
    now?: number
  }): Promise<PublicHandoff | null> {
    this.clock = input.now ?? Date.now()
    const entry = [...this.handoffs.entries()].find(
      ([, stored]) => stored.value.publicToken === input.publicToken,
    )
    const stored = entry?.[1].value
    if (
      entry &&
      stored &&
      (stored.expiresAt ?? 0) <= this.clock &&
      stored.status !== 'expired'
    ) {
      entry[1].value = { ...stored, status: 'expired', updatedAt: this.clock }
      this.handoffs.set(entry[0], entry[1])
    }
    if (
      !stored?.publicToken ||
      (stored.expiresAt ?? 0) <= this.clock ||
      stored.status === 'expired'
    ) {
      return null
    }
    return {
      publicToken: stored.publicToken,
      title: stored.title,
      createdAt: stored.createdAt,
      expiresAt: stored.expiresAt,
      status: stored.status,
      ...(stored.recipient ? { recipient: stored.recipient } : {}),
      procedure: {
        title: stored.procedure?.title ?? stored.title,
        steps: (stored.procedure?.steps ?? []).map(
          ({ id: _id, ...step }) => step,
        ),
      },
      policy: stored.policy ?? {
        allowSafePreferences: false,
        requireConfirmation: true,
        allowHelperEscalation: false,
      },
    }
  }

  async markHandoffOpened(input: {
    publicToken: string
    now?: number
  }): Promise<PublicHandoff> {
    return this.transition(input.publicToken, 'opened', input.now, true)
  }

  async transitionHandoff(input: {
    publicToken: string
    status: HandoffStatus
    now?: number
  }): Promise<PublicHandoff> {
    if (input.status === 'completed') {
      throw new Error('Completed requires recipient confirmation')
    }
    return this.transition(input.publicToken, input.status, input.now, false)
  }

  async createConfirmation(input: {
    publicToken: string
    now?: number
  }): Promise<Confirmation> {
    const createdAt = input.now ?? Date.now()
    this.confirmation = {
      handoffToken: input.publicToken,
      token: 'D'.repeat(43),
      createdAt,
      expiresAt: createdAt + 120_000,
    }
    return structuredClone(this.confirmation)
  }

  async completeHandoff(input: {
    publicToken: string
    confirmationToken: string
    now?: number
  }): Promise<PublicHandoff> {
    const now = input.now ?? Date.now()
    if (
      !this.confirmation ||
      this.confirmation.handoffToken !== input.publicToken ||
      this.confirmation.token !== input.confirmationToken
    ) {
      throw new Error('Recipient confirmation is invalid')
    }
    if (this.confirmation.consumedAt !== undefined) {
      throw new Error('Recipient confirmation was already consumed')
    }
    if (this.confirmation.expiresAt <= now) {
      throw new Error('Recipient confirmation is expired')
    }
    this.confirmation.consumedAt = now
    return this.transition(input.publicToken, 'completed', now, false)
  }

  private async transition(
    publicToken: string,
    status: HandoffStatus,
    now = Date.now(),
    opening: boolean,
  ): Promise<PublicHandoff> {
    this.clock = now
    const entry = [...this.handoffs.entries()].find(
      ([, stored]) => stored.value.publicToken === publicToken,
    )
    if (!entry) throw new Error('Handoff unavailable')
    const [id, stored] = entry
    if ((stored.value.expiresAt ?? 0) <= now) {
      throw new Error('Handoff unavailable')
    }
    const current = stored.value.status ?? 'created'
    if (current !== status) {
      const allowed =
        (opening && current === 'created' && status === 'opened') ||
        (current === 'opened' && status === 'running') ||
        (current === 'running' &&
          ['needs_input', 'waiting_confirmation', 'completed'].includes(
            status,
          )) ||
        (current === 'needs_input' &&
          ['running', 'waiting_confirmation'].includes(status)) ||
        (current === 'waiting_confirmation' &&
          ['running', 'completed'].includes(status))
      if (!allowed) throw new Error('Illegal handoff status transition')
      stored.value = { ...stored.value, status, updatedAt: now }
      this.handoffs.set(id, stored)
    }
    const result = await this.getPublicHandoff({ publicToken, now })
    if (!result) throw new Error('Handoff unavailable')
    return result
  }

  async createHelpRequest(input: {
    handoffToken: string
    request: HelpRequest
    now?: number
  }): Promise<void> {
    const parent = [...this.handoffs.values()].find(
      ({ value }) => value.publicToken === input.handoffToken,
    )
    const now = input.now ?? Date.now()
    if (
      !parent ||
      (parent.value.expiresAt ?? 0) <= now ||
      ['completed', 'expired'].includes(parent.value.status ?? 'created')
    ) {
      throw new Error('Handoff unavailable')
    }
    if (!parent.value.policy?.allowHelperEscalation) {
      throw new Error('Helper escalation is disabled')
    }
    this.requests.set(input.request.id, {
      owner: parent.owner,
      value: {
        ...structuredClone(input.request),
        expiresAt: Math.min(
          input.request.expiresAt ?? now + 7 * DAY,
          parent.value.expiresAt ?? now,
        ),
      },
    })
  }

  async saveHelpRequest(input: {
    request: HelpRequest
  }): Promise<void> {
    this.requests.set(input.request.id, {
      owner: ownerToken,
      value: structuredClone(input.request),
    })
  }

  async listHelpRequests(): Promise<HelpRequest[]> {
    return [...this.requests.values()]
      .filter(({ owner }) => owner === ownerToken)
      .map(({ value }) => structuredClone(value))
  }

  async getHelpRequest(input: {
    id: string
  }): Promise<HelpRequest | null> {
    const stored = this.requests.get(input.id)
    return stored?.owner === ownerToken
      ? structuredClone(stored.value)
      : null
  }

  async getPublicHelpRequest(input: {
    publicToken: string
    now?: number
  }): Promise<PublicHelpRequest | null> {
    const request = [...this.requests.values()].find(
      ({ value }) => value.publicToken === input.publicToken,
    )?.value
    const parent = request ? this.handoffs.get(request.handoffId)?.value : null
    const now = input.now ?? Date.now()
    if (
      !request?.publicToken ||
      request.expiresAt === undefined ||
      !parent ||
      (request.expiresAt ?? 0) <= now ||
      (parent.expiresAt ?? 0) <= now ||
      ['completed', 'expired'].includes(parent.status ?? 'created')
    ) {
      return null
    }
    return {
      publicToken: request.publicToken,
      expiresAt: request.expiresAt,
      status: request.status,
      detail: request.detail,
      options: request.options,
    }
  }

  async saveDecision(input: {
    decision: HelperDecision
  }): Promise<void> {
    this.decisions.set(input.decision.id, {
      owner: ownerToken,
      value: structuredClone(input.decision),
    })
  }

  async listDecisions(): Promise<HelperDecision[]> {
    return [...this.decisions.values()]
      .filter(({ owner }) => owner === ownerToken)
      .map(({ value }) => structuredClone(value))
  }

  async getDecision(input: {
    id: string
  }): Promise<HelperDecision | null> {
    const stored = this.decisions.get(input.id)
    return stored?.owner === ownerToken
      ? structuredClone(stored.value)
      : null
  }

  async recordDecision(input: {
    requestToken: string
    decision: HelperDecision
    now?: number
  }): Promise<HelperDecision> {
    const requestEntry = [...this.requests.entries()].find(
      ([, stored]) => stored.value.publicToken === input.requestToken,
    )
    if (!requestEntry) throw new Error('Request unavailable')
    const [requestId, request] = requestEntry
    const parent = this.handoffs.get(request.value.handoffId)?.value
    const now = input.now ?? Date.now()
    if (
      !parent ||
      request.value.status !== 'open' ||
      (request.value.expiresAt ?? 0) <= now ||
      (parent.expiresAt ?? 0) <= now ||
      ['completed', 'expired'].includes(parent.status ?? 'created')
    ) {
      throw new Error('Request unavailable')
    }
    const decision = { ...input.decision, requestId }
    this.decisions.set(decision.id, {
      owner: request.owner,
      value: decision,
    })
    request.value = { ...request.value, status: 'resolved', updatedAt: now }
    this.requests.set(requestId, request)
    return structuredClone(decision)
  }

  async pollDecision(input: {
    requestToken: string
    now?: number
  }): Promise<HelperDecision | null> {
    const request = [...this.requests.values()].find(
      ({ value }) => value.publicToken === input.requestToken,
    )
    const now = input.now ?? Date.now()
    const parent = request
      ? this.handoffs.get(request.value.handoffId)?.value
      : null
    if (
      !request ||
      !parent ||
      (request.value.expiresAt ?? 0) <= now ||
      (parent.expiresAt ?? 0) <= now ||
      ['completed', 'expired'].includes(parent.status ?? 'created')
    ) {
      return null
    }
    return (
      [...this.decisions.values()].find(
        ({ value }) => value.requestId === request.value.id,
      )?.value ?? null
    )
  }

  async appendActivity(input: {
    event: ActivityEvent
  }): Promise<void> {
    this.activity.set(input.event.id, {
      owner: ownerToken,
      value: structuredClone(input.event),
    })
  }

  async appendPublicActivity(input: {
    handoffToken: string
    event: ActivityEvent
    now?: number
  }): Promise<void> {
    const parent = [...this.handoffs.values()].find(
      ({ value }) => value.publicToken === input.handoffToken,
    )
    if (
      !parent ||
      (parent.value.expiresAt ?? 0) <= (input.now ?? this.clock) ||
      ['completed', 'expired'].includes(parent.value.status ?? 'created')
    ) {
      throw new Error('Handoff unavailable')
    }
    if (
      input.event.commandType === 'set_preference' &&
      !parent.value.policy?.allowSafePreferences
    ) {
      throw new Error('Safe preference application is disabled')
    }
    this.activity.set(input.event.id, {
      owner: parent.owner,
      value: structuredClone(input.event),
      handoffToken: input.handoffToken,
    })
  }

  async listActivity(): Promise<ActivityEvent[]> {
    return [...this.activity.values()]
      .filter(({ owner }) => owner === ownerToken)
      .map(({ value }) => structuredClone(value))
  }

  async getActivity(input: {
    id: string
  }): Promise<ActivityEvent | null> {
    const stored = this.activity.get(input.id)
    return stored?.owner === ownerToken
      ? structuredClone(stored.value)
      : null
  }
}

function createRepositories(transport: SharedTransport, owner = ownerToken) {
  void owner
  return {
    procedures: new SupabaseProcedureRepository(transport),
    handoffs: new SupabaseHandoffRepository(transport),
    requests: new SupabaseHelpRequestRepository(transport),
    decisions: new SupabaseDecisionRepository(transport),
    activity: new SupabaseActivityRepository(transport),
  }
}

describe('capability formats', () => {
  it('uses exact public and owner capability formats', () => {
    expect(generatePublicToken()).toMatch(/^[A-Za-z0-9_-]{24}$/)
    expect(isPublicToken('A'.repeat(24))).toBe(true)
    expect(isPublicToken('A'.repeat(23))).toBe(false)
  })
})

describe('Supabase repository capability flow', () => {
  it('rejects invalid token lengths, oversized text, and sensitive fields', async () => {
    const repositories = createRepositories(new FakeSharedTransport())
    await expect(
      repositories.procedures.save({
        ...procedure,
        title: 'x'.repeat(121),
      }),
    ).rejects.toThrow('title')
    await expect(
      repositories.handoffs.save({
        id: 'handoff-bad',
        publicToken: 'short',
        procedureId: procedure.id,
        title: 'For Alex',
        createdAt: 1,
        updatedAt: 1,
        expiresAt: DAY,
        status: 'created',
        procedure,
      }),
    ).rejects.toThrow('public token')
    await expect(
      repositories.handoffs.save({
        id: 'handoff-sensitive',
        publicToken: handoffToken,
        procedureId: procedure.id,
        title: 'For Alex',
        createdAt: 1,
        updatedAt: 1,
        expiresAt: DAY,
        status: 'created',
        procedure,
        password: 'secret',
      } as Handoff),
    ).rejects.toThrow('sensitive')
  })

  it('rejects invalid discriminated procedure, activity, and decision DTOs', async () => {
    const repositories = createRepositories(new FakeSharedTransport())
    await expect(
      repositories.procedures.save({
        ...procedure,
        steps: [
          {
            id: 'bad-step',
            commandType: 'select_plan',
            policy: 'safe_preference',
            input: { type: 'select_plan', planId: 'silver' },
          },
        ],
      }),
    ).rejects.toThrow('policy')
    await expect(
      repositories.activity.save({
        id: 'bad-activity',
        kind: 'command',
        timestamp: 1,
        source: 'human',
        toolName: 'not-valid-for-command',
      }),
    ).rejects.toThrow(/activity/iu)
    await expect(
      repositories.decisions.saveForRequestToken(requestToken, {
        id: 'bad-decision',
        requestId: 'request',
        outcome: 'let_recipient_decide',
        recommendedPlanId: 'silver',
        decidedAt: 1,
      }),
    ).rejects.toThrow('recommend')
  })

  it('supports owner CRUD without silent empty fallbacks', async () => {
    const transport = new FakeSharedTransport()
    const repositories = createRepositories(transport)
    await repositories.procedures.save(procedure)
    expect(await repositories.procedures.list()).toEqual([procedure])
    expect(await repositories.procedures.get(procedure.id)).toEqual(procedure)
    expect(
      await repositories.procedures.getByRecordingId(procedure.recordingId),
    ).toEqual(procedure)
  })

  it('deletes owner procedures and cascades to their handoffs', async () => {
    const transport = new FakeSharedTransport()
    const repositories = createRepositories(transport)
    await repositories.procedures.save(procedure)
    await repositories.handoffs.save({
      id: 'handoff-cascade',
      publicToken: handoffToken,
      procedureId: procedure.id,
      title: 'For Alex',
      createdAt: 1,
      expiresAt: 8 * DAY,
      status: 'created',
      procedure,
      policy: {
        allowSafePreferences: true,
        requireConfirmation: true,
        allowHelperEscalation: true,
      },
    })

    await repositories.procedures.remove(procedure.id)

    expect(await repositories.procedures.get(procedure.id)).toBeNull()
    expect(await repositories.handoffs.get('handoff-cascade')).toBeNull()
  })

  it('deletes a single owner handoff without touching its procedure', async () => {
    const transport = new FakeSharedTransport()
    const repositories = createRepositories(transport)
    await repositories.procedures.save(procedure)
    await repositories.handoffs.save({
      id: 'handoff-standalone',
      publicToken: handoffToken,
      procedureId: procedure.id,
      title: 'For Alex',
      createdAt: 1,
      expiresAt: 8 * DAY,
      status: 'created',
      procedure,
      policy: {
        allowSafePreferences: true,
        requireConfirmation: true,
        allowHelperEscalation: true,
      },
    })

    await repositories.handoffs.remove('handoff-standalone')

    expect(await repositories.handoffs.get('handoff-standalone')).toBeNull()
    expect(await repositories.procedures.get(procedure.id)).toEqual(procedure)
  })

  it('keeps public reads side-effect-free and opening idempotent', async () => {
    const transport = new FakeSharedTransport()
    const sender = createRepositories(transport)
    await sender.procedures.save(procedure)
    await sender.handoffs.save({
      id: 'handoff-1',
      publicToken: handoffToken,
      procedureId: procedure.id,
      title: 'For Alex',
      createdAt: 1,
      updatedAt: 1,
      expiresAt: 8 * DAY,
      status: 'created',
      procedure,
      policy: {
        allowSafePreferences: true,
        requireConfirmation: true,
        allowHelperEscalation: true,
      },
    })
    const recipient = createRepositories(transport, `own_${'Z'.repeat(32)}`)
    const publicView = await recipient.handoffs.getByPublicToken(handoffToken, 2)
    expect(publicView?.status).toBe('created')
    expect(JSON.stringify(publicView)).not.toMatch(
      /handoff-1|procedureId|ownerToken|password|session|payment/iu,
    )
    expect((await sender.handoffs.get('handoff-1'))?.status).toBe('created')
    await Promise.all([
      recipient.handoffs.markOpened(handoffToken, 2),
      recipient.handoffs.markOpened(handoffToken, 3),
    ])
    expect((await sender.handoffs.get('handoff-1'))?.status).toBe('opened')
  })

  it('runs the full lifecycle and helper roundtrip across clients', async () => {
    const transport = new FakeSharedTransport()
    const sender = createRepositories(transport)
    const recipient = createRepositories(transport, `own_${'Z'.repeat(32)}`)
    const helper = createRepositories(transport, `own_${'Y'.repeat(32)}`)
    await sender.procedures.save(procedure)
    await sender.handoffs.save({
      id: 'handoff-1',
      publicToken: handoffToken,
      procedureId: procedure.id,
      title: 'For Alex',
      createdAt: 1,
      updatedAt: 1,
      expiresAt: 8 * DAY,
      status: 'created',
      procedure,
      policy: {
        allowSafePreferences: true,
        requireConfirmation: true,
        allowHelperEscalation: true,
      },
    })
    await recipient.handoffs.markOpened(handoffToken, 2)
    await recipient.handoffs.transitionByPublicToken(
      handoffToken,
      'running',
      3,
    )
    await recipient.handoffs.transitionByPublicToken(
      handoffToken,
      'needs_input',
      4,
    )
    await recipient.requests.createForHandoffToken(
      handoffToken,
      {
        id: 'request-1',
        publicToken: requestToken,
        handoffId: 'handoff-1',
        createdAt: 4,
        updatedAt: 4,
        expiresAt: 20 * DAY,
        status: 'open',
        detail: 'plan_unavailable',
        options: ['silver', 'platinum', 'let_recipient_decide'],
      },
      4,
    )
    expect(
      (await helper.requests.getByPublicToken(requestToken, 5))?.expiresAt,
    ).toBe(8 * DAY)
    await helper.decisions.saveForRequestToken(
      requestToken,
      {
        id: 'decision-1',
        requestId: 'untrusted',
        outcome: 'recommend_plan',
        recommendedPlanId: 'silver',
        decidedAt: 5,
      },
      5,
    )
    expect(
      await recipient.decisions.pollByRequestToken(requestToken, 6),
    ).toMatchObject({ outcome: 'recommend_plan', recommendedPlanId: 'silver' })
    await recipient.handoffs.transitionByPublicToken(
      handoffToken,
      'waiting_confirmation',
      6,
    )
    await recipient.activity.appendForHandoffToken(handoffToken, {
      id: 'activity-confirmation',
      kind: 'command',
      timestamp: 6,
      source: 'human',
      commandType: 'create_confirmation',
      policy: 'confirmation_required',
      outcome: 'applied',
    })
    expect(transport.activity.get('activity-confirmation')?.owner).toBe(
      ownerToken,
    )
    const confirmation =
      await recipient.handoffs.createConfirmation(handoffToken, 6)
    await recipient.handoffs.complete(
      handoffToken,
      confirmation.token,
      7,
    )
    expect((await sender.handoffs.get('handoff-1'))?.status).toBe('completed')
  })

  it('rejects helper operations after parent expiration', async () => {
    const transport = new FakeSharedTransport()
    const repositories = createRepositories(transport)
    await repositories.procedures.save(procedure)
    await repositories.handoffs.save({
      id: 'handoff-1',
      publicToken: handoffToken,
      procedureId: procedure.id,
      title: 'For Alex',
      createdAt: 1,
      updatedAt: 1,
      expiresAt: 10,
      status: 'created',
      procedure,
    })
    await expect(
      repositories.requests.createForHandoffToken(
        handoffToken,
        {
          id: 'request-1',
          publicToken: requestToken,
          handoffId: 'handoff-1',
          createdAt: 11,
          updatedAt: 11,
          expiresAt: 20,
          status: 'open',
          detail: 'plan_unavailable',
          options: ['silver'],
        },
        11,
      ),
    ).rejects.toThrow('Handoff unavailable')
  })

  it('persists derived expired status for owner reads', async () => {
    const transport = new FakeSharedTransport()
    const repositories = createRepositories(transport)
    await repositories.procedures.save(procedure)
    await repositories.handoffs.save({
      id: 'handoff-expiring',
      publicToken: handoffToken,
      procedureId: procedure.id,
      title: 'Expiring',
      createdAt: 1,
      updatedAt: 1,
      expiresAt: 10,
      status: 'created',
      procedure,
    })
    await expect(
      repositories.handoffs.getByPublicToken(handoffToken, 11),
    ).resolves.toBeNull()
    await expect(
      repositories.handoffs.get('handoff-expiring'),
    ).resolves.toMatchObject({ status: 'expired', updatedAt: 11 })
  })

  it('denies helper and public activity operations after completion', async () => {
    const transport = new FakeSharedTransport()
    const repositories = createRepositories(transport)
    await repositories.procedures.save(procedure)
    await repositories.handoffs.save({
      id: 'handoff-terminal',
      publicToken: handoffToken,
      procedureId: procedure.id,
      title: 'Terminal handoff',
      createdAt: 1,
      updatedAt: 1,
      expiresAt: 8 * DAY,
      status: 'created',
      procedure,
      policy: {
        allowSafePreferences: true,
        requireConfirmation: true,
        allowHelperEscalation: true,
      },
    })
    await repositories.handoffs.markOpened(handoffToken, 2)
    await repositories.handoffs.transitionByPublicToken(
      handoffToken,
      'running',
      3,
    )
    await repositories.requests.createForHandoffToken(
      handoffToken,
      {
        id: 'request-before-terminal',
        publicToken: requestToken,
        handoffId: 'handoff-terminal',
        createdAt: 3,
        updatedAt: 3,
        expiresAt: 6 * DAY,
        status: 'open',
        detail: 'plan_unavailable',
        options: ['silver'],
      },
      3,
    )
    await repositories.activity.appendForHandoffToken(handoffToken, {
      id: 'activity-terminal-confirmation',
      kind: 'command',
      timestamp: 3,
      source: 'human',
      commandType: 'create_confirmation',
      policy: 'confirmation_required',
      outcome: 'applied',
    })
    const confirmation =
      await repositories.handoffs.createConfirmation(handoffToken, 3)
    await repositories.handoffs.complete(
      handoffToken,
      confirmation.token,
      4,
    )
    await expect(
      repositories.requests.getByPublicToken(requestToken, 5),
    ).resolves.toBeNull()
    await expect(
      repositories.decisions.saveForRequestToken(
        requestToken,
        {
          id: 'decision-terminal',
          requestId: 'request-before-terminal',
          outcome: 'recommend_plan',
          recommendedPlanId: 'silver',
          decidedAt: 5,
        },
        5,
      ),
    ).rejects.toThrow('Request unavailable')
    await expect(
      repositories.decisions.pollByRequestToken(requestToken, 5),
    ).resolves.toBeNull()
    await expect(
      repositories.requests.createForHandoffToken(
        handoffToken,
        {
          id: 'request-terminal',
          publicToken: requestToken,
          handoffId: 'handoff-terminal',
          createdAt: 5,
          updatedAt: 5,
          expiresAt: 6 * DAY,
          status: 'open',
          detail: 'plan_unavailable',
          options: ['silver'],
        },
        5,
      ),
    ).rejects.toThrow('Handoff unavailable')
    await expect(
      repositories.activity.appendForHandoffToken(handoffToken, {
        id: 'activity-terminal',
        kind: 'command',
        timestamp: 5,
        source: 'human',
        commandType: 'preview_renewal',
        policy: 'state_check',
        outcome: 'applied',
      }),
    ).rejects.toThrow('Handoff unavailable')
  })

  it('returns only the minimum public DTO', async () => {
    const transport = new FakeSharedTransport()
    const repositories = createRepositories(transport)
    await repositories.procedures.save(procedure)
    await repositories.handoffs.save({
      id: 'handoff-minimum',
      publicToken: handoffToken,
      procedureId: procedure.id,
      title: 'For Alex',
      createdAt: 1,
      updatedAt: 1,
      expiresAt: 8 * DAY,
      status: 'created',
      procedure,
      recipient: 'Alex',
      note: 'private sender note',
      policy: {
        allowSafePreferences: true,
        requireConfirmation: true,
        allowHelperEscalation: true,
      },
    })
    const result = await repositories.handoffs.getByPublicToken(handoffToken, 2)
    expect(result).not.toHaveProperty('id')
    expect(result?.recipient).toBe('Alex')
    expect(result).not.toHaveProperty('note')
    expect(result?.procedure).not.toHaveProperty('id')
    expect(result?.procedure).not.toHaveProperty('recordingId')
    expect(result?.procedure).not.toHaveProperty('sourceEventIds')
  })
})

describe('owner record deletion migration contract', () => {
  const deletionMigration = readFileSync(
    fileURLToPath(
      new URL(
        '../../../supabase/migrations/20260903000000_owner_record_deletion.sql',
        import.meta.url,
      ),
    ),
    'utf8',
  )

  it('pins both delete functions to security definer with an empty search path', () => {
    const functionBlocks = deletionMigration
      .split(/create function/iu)
      .filter((block) => /security definer/iu.test(block))
    expect(functionBlocks).toHaveLength(2)
    for (const block of functionBlocks) {
      expect(block).toMatch(/security definer set search_path = ''/iu)
    }
  })

  it('scopes both deletions by owner_token_hash and validates the owner token', () => {
    expect(deletionMigration).toMatch(
      /delete from public\.handoffs\s+where owner_token_hash = public\.owner_hash\(p_owner_token\)/isu,
    )
    expect(deletionMigration).toMatch(
      /delete from public\.procedures\s+where owner_token_hash = owner_hash/isu,
    )
    expect(deletionMigration.match(/p_owner_token !~ '\^own_/gu)).toHaveLength(2)
  })

  it('deletes handoffs under a procedure before deleting the procedure itself', () => {
    const parts = deletionMigration.split(
      'create function public.delete_owner_procedure',
    )
    expect(parts).toHaveLength(2)
    const procedureFn = parts[1] ?? ''
    const deleteHandoffs = procedureFn.indexOf('delete from public.handoffs')
    const deleteProcedures = procedureFn.indexOf('delete from public.procedures')
    expect(deleteHandoffs).toBeGreaterThan(-1)
    expect(deleteProcedures).toBeGreaterThan(deleteHandoffs)
  })

  it('grants execute on both delete functions to anon only', () => {
    expect(deletionMigration).toContain(
      'grant execute on function public.delete_owner_handoff(text, text) to anon;',
    )
    expect(deletionMigration).toContain(
      'grant execute on function public.delete_owner_procedure(text, text) to anon;',
    )
  })
})

describe('migration security contract', () => {
  const migration = readFileSync(
    fileURLToPath(
      new URL(
        '../../../supabase/migrations/20260902000000_cross_device_sharing.sql',
        import.meta.url,
      ),
    ),
    'utf8',
  )

  it('pins every definer function to an empty search path', () => {
    const functionBlocks = migration
      .split(/create function/iu)
      .filter((block) => /security definer/iu.test(block))
    expect(functionBlocks.length).toBeGreaterThan(0)
    for (const block of functionBlocks) {
      expect(block).toMatch(/security definer set search_path = ''/iu)
    }
    expect(migration).not.toContain('set search_path = public')
  })

  it('does not grant unguarded owner reads or internal appends to anon', () => {
    expect(migration).not.toMatch(
      /grant execute on function public\.(get_procedure|append_internal_activity)/u,
    )
    expect(migration).toContain('p_owner_token')
    expect(migration).toContain('mark_handoff_opened')
  })

  it('strips reserved payload fields before authoritative merges', () => {
    expect(migration).toMatch(
      /payload\s*-\s*array\[[^\]]*'status'[^\]]*\]\s*\|\|\s*jsonb_build_object/isu,
    )
  })

  it('enforces per-owner quotas before public creation', () => {
    expect(migration).toContain('assert_owner_quota')
    expect(migration).toMatch(/procedure quota exceeded/iu)
    expect(migration).toMatch(/handoff quota exceeded/iu)
    expect(migration).toMatch(/helper request quota exceeded/iu)
    expect(migration).toMatch(/activity quota exceeded/iu)
  })

  it('enforces handoff policy and terminal state in capability RPCs', () => {
    expect(migration).toContain('allowHelperEscalation')
    expect(migration).toContain('allowSafePreferences')
    expect(migration).not.toMatch(/Human confirmation activity is required/iu)
    expect(migration).toContain('handoff_confirmations')
    expect(migration).toContain('complete_recipient_handoff')
    expect(migration).toMatch(/h\.status in \('completed','expired'\)/u)
  })

  it('parenthesizes json extraction before removing object keys', () => {
    expect(migration).not.toMatch(/->'[^']+'\s*-\s*array/gu)
    expect(migration).toContain("(step->'input') - array[")
    expect(migration).toContain("(p_payload->'policy') - array[")
  })
})

describe('secure recipient confirmation migration contract', () => {
  const migration = readFileSync(
    fileURLToPath(
      new URL(
        '../../../supabase/migrations/20260902000002_secure_recipient_confirmation.sql',
        import.meta.url,
      ),
    ),
    'utf8',
  )

  it('adds a denied confirmation table and recipient binding', () => {
    expect(migration).toContain('recipient_token_hash')
    expect(migration).toContain(
      'create table if not exists public.handoff_confirmations',
    )
    expect(migration).toMatch(
      /alter table public\.handoff_confirmations enable row level security/iu,
    )
    expect(migration).toMatch(
      /revoke all on table public\.handoff_confirmations\s+from public, anon, authenticated/iu,
    )
  })

  it('uses narrow empty-search-path RPCs and removes generic completion', () => {
    for (const name of [
      'mark_handoff_opened',
      'create_recipient_confirmation',
      'complete_recipient_handoff',
    ]) {
      expect(migration).toMatch(
        new RegExp(
          `create(?: or replace)? function public\\.${name}[\\s\\S]*?security definer set search_path = ''`,
          'iu',
        ),
      )
    }
    const transition = migration.match(
      /create or replace function public\.transition_public_handoff[\s\S]*?\$\$;/iu,
    )?.[0]
    expect(transition).toBeTruthy()
    expect(transition).not.toMatch(/p_status\s*=\s*'completed'/iu)
    expect(transition).not.toMatch(/create_confirmation/iu)
    expect(migration).not.toMatch(
      /append_public_activity[\s\S]*create_confirmation[\s\S]*complete_recipient_handoff/iu,
    )
  })

  it('checks recipient, freshness, and one-time consumption atomically', () => {
    expect(migration).toMatch(/expires_at\s*>\s*pg_catalog\.now\(\)/iu)
    expect(migration).toMatch(/consumed_at\s+is\s+null/iu)
    expect(migration).toMatch(/recipient_token_hash\s*=\s*public\.owner_hash/iu)
    expect(migration).toMatch(/set consumed_at = pg_catalog\.now\(\)/iu)
    expect(migration).toMatch(/interval '120 seconds'/iu)
  })

  it('guards every confirmation DDL duplicated by the revised base migration', () => {
    expect(migration).toMatch(
      /alter table public\.handoffs\s+add column if not exists recipient_token_hash/iu,
    )
    expect(migration).toMatch(
      /create table if not exists public\.handoff_confirmations/iu,
    )
    expect(migration).toMatch(
      /create index if not exists handoff_confirmations_lookup_idx/iu,
    )
    expect(migration).toMatch(
      /create index if not exists handoff_confirmations_expires_idx/iu,
    )
    expect(migration).toMatch(
      /drop function if exists public\.mark_handoff_opened\(text\)/iu,
    )
    expect(migration).toMatch(
      /drop function if exists public\.mark_handoff_opened\(text, text\)/iu,
    )
    for (const name of [
      'mark_handoff_opened',
      'transition_public_handoff',
      'create_recipient_confirmation',
      'complete_recipient_handoff',
    ]) {
      expect(migration).toMatch(
        new RegExp(`create or replace function public\\.${name}`, 'iu'),
      )
    }
  })

  it('models fresh base then forward replay without unguarded duplicate creation', () => {
    const base = readFileSync(
      fileURLToPath(
        new URL(
          '../../../supabase/migrations/20260902000000_cross_device_sharing.sql',
          import.meta.url,
        ),
      ),
      'utf8',
    )
    const duplicatedObjects = [
      'recipient_token_hash',
      'handoff_confirmations',
      'handoff_confirmations_lookup_idx',
      'handoff_confirmations_expires_idx',
      'mark_handoff_opened',
      'transition_public_handoff',
      'create_recipient_confirmation',
      'complete_recipient_handoff',
    ]
    for (const object of duplicatedObjects) {
      expect(migration).toContain(object)
    }
    expect(migration).not.toMatch(
      /(?<!or replace )create function public\.(mark_handoff_opened|transition_public_handoff|create_recipient_confirmation|complete_recipient_handoff)/iu,
    )
    expect(migration).not.toMatch(
      /create (table|index) public\.handoff_confirmations/iu,
    )
    expect(migration).not.toMatch(
      /add column recipient_token_hash/iu,
    )

    const state = new Set<string>()
    const replay = (sql: string) => {
      for (const statement of sql.split(';')) {
        const object =
          (/add column(?: if not exists)? recipient_token_hash/iu.test(statement) ||
          (/create table public\.handoffs/iu.test(statement) &&
            /recipient_token_hash/iu.test(statement))
            ? 'recipient_token_hash'
            : undefined) ??
          statement.match(
            /(?:create table(?: if not exists)? public\.|create index(?: if not exists)? |(?:create(?: or replace)?|drop) function(?: if exists)? public\.)(handoff_confirmations(?:_lookup_idx|_expires_idx)?|mark_handoff_opened|transition_public_handoff|create_recipient_confirmation|complete_recipient_handoff)/iu,
          )?.[1]
        if (!object) continue
        if (/drop function if exists/iu.test(statement)) {
          state.delete(object)
          continue
        }
        const replacing = /create or replace function/iu.test(statement)
        const guarded =
          /if not exists/iu.test(statement) ||
          replacing ||
          /alter table .* enable row level security/isu.test(statement) ||
          /^(?:\s*revoke|\s*grant)/iu.test(statement)
        const creates =
          /create (?:or replace )?(?:table|index|function)/iu.test(statement) ||
          /add column/iu.test(statement)
        if (creates && state.has(object) && !guarded) {
          throw new Error(`duplicate unguarded DDL: ${object}`)
        }
        if (creates) state.add(object)
      }
    }
    expect(() => {
      replay(base)
      replay(migration)
      replay(migration)
    }).not.toThrow()
    expect(state).toEqual(new Set(duplicatedObjects))
  })
})

describe('migration repair contract', () => {
  const repairMigration = readFileSync(
    fileURLToPath(
      new URL(
        '../../../supabase/migrations/20260902000001_fix_json_operator_precedence.sql',
        import.meta.url,
      ),
    ),
    'utf8',
  )

  it('replaces the affected definer RPCs with parenthesized json key removal', () => {
    expect(repairMigration).toMatch(
      /create or replace function public\.create_procedure\(p_owner_token text, p_payload jsonb\)/iu,
    )
    expect(repairMigration).toMatch(
      /create or replace function public\.create_handoff\(p_owner_token text, p_payload jsonb\)/iu,
    )
    expect(repairMigration).not.toMatch(/->'[^']+'\s*-\s*array/gu)
    expect(repairMigration).toContain("(step->'input') - array[")
    expect(repairMigration).toContain("(p_payload->'policy') - array[")
  })

  it('preserves empty search_path security definer settings and anon grants', () => {
    const functionBlocks = repairMigration
      .split(/create or replace function/iu)
      .filter((block) => /security definer/iu.test(block))
    expect(functionBlocks).toHaveLength(2)
    for (const block of functionBlocks) {
      expect(block).toMatch(/security definer set search_path = ''/iu)
    }
    expect(repairMigration).toMatch(
      /grant execute on function public\.create_procedure\(text, jsonb\) to anon;/u,
    )
    expect(repairMigration).toMatch(
      /grant execute on function public\.create_handoff\(text, jsonb\) to anon;/u,
    )
  })
})

describe('public handoff recipient migration contract', () => {
  const migration = readFileSync(
    fileURLToPath(
      new URL(
        '../../../supabase/migrations/20260904000000_public_handoff_recipient.sql',
        import.meta.url,
      ),
    ),
    'utf8',
  )

  it('projects recipient from handoff payload into public_handoff_json', () => {
    expect(migration).toMatch(
      /create or replace function public\.public_handoff_json\(h public\.handoffs\)/iu,
    )
    expect(migration).toContain("'recipient', h.payload->'recipient'")
    expect(migration).toContain('jsonb_strip_nulls')
  })
})
