import { describe, expect, it, vi } from 'vitest'

import { compareProcedureToRecipient } from '../domain/adaptation/compareProcedureToRecipient'
import { executeCommand } from '../domain/commands/executeCommand'
import { createRecipientAccount } from '../domain/integration/productFlow'
import type {
  AccountState,
  CommandResult,
  Confirmation,
  Handoff,
  HelpRequest,
  Procedure,
} from '../domain/model'
import { createLocalOnlySharedRepositories } from '../domain/repositories/sharedRepositories'
import { SHOWONCE_TOOLS } from './definitions/tools'
import { registerWebMCPTools } from './registerTools'

const state = {
  id: 'mom-normal',
  availablePlans: [{ id: 'gold', name: 'Gold', monthlyPrice: 142 }],
  selectedPlanId: 'silver',
  preferences: {
    paperless: false,
    communication: 'mail' as const,
    renewalFrequency: 'monthly' as const,
  },
  address: 'private',
  dependents: ['A', 'B'],
  submittedAt: null,
}

const result: CommandResult = {
  ok: true,
  state,
  event: {
    id: 'event',
    commandType: 'preview_renewal',
    source: 'webmcp',
    timestamp: 1,
    policy: 'state_check',
    status: 'applied',
    input: { type: 'preview_renewal' },
  },
}

function setup(confirmation?: Confirmation) {
  const registrations: WebMCP.ModelContextTool[] = []
  const modelContext = {
    registerTool: vi.fn(async (tool: WebMCP.ModelContextTool) => {
      registrations.push(tool)
    }),
  } as unknown as WebMCP.ModelContext
  const execute = vi.fn(() => result)
  const activity = { append: vi.fn(async () => undefined) }
  const handoff = {
    id: 'handoff',
    procedureId: 'procedure',
    title: 'For Mom',
    createdAt: 1,
    policy: {
      allowSafePreferences: true,
      requireConfirmation: true,
      allowHelperEscalation: true,
    },
    procedure: {
      id: 'procedure',
      recordingId: 'recording',
      title: 'Renew',
      createdAt: 1,
      steps: [],
      sourceEventIds: [],
    },
  }
  return {
    registrations,
    modelContext,
    execute,
    context: {
      document: { modelContext },
      scope: 'recipient' as const,
      repositories: {
        procedures: {
          list: vi.fn(async () => [handoff.procedure]),
          get: vi.fn(async () => handoff.procedure),
        },
        handoffs: {
          list: vi.fn(async () => [handoff]),
          get: vi.fn(async () => handoff),
        },
        activity,
        decisions: {
          list: vi.fn(async () => []),
          get: vi.fn(async () => null),
          save: vi.fn(async () => undefined),
          pollByRequestToken: vi.fn(async () => ({
            id: 'decision',
            requestId: 'request',
            outcome: 'recommend_plan' as const,
            recommendedPlanId: 'silver' as const,
            decidedAt: 2,
          })),
        },
        helpRequests: {
          list: vi.fn(async () => []),
          get: vi.fn(async () => null),
          save: vi.fn(async () => undefined),
        },
      },
      execute,
      compare: vi.fn(() => ({
        matches: [],
        safeActions: [],
        skippedActions: [],
        differences: [],
        needsJudgment: false,
        confirmationRequired: true as const,
      })),
      getRecipientState: () => state,
      getInitialState: () => state,
      getActiveHandoff: () => handoff,
      getConfirmation: () => confirmation,
      completeHandoff: vi.fn(async () => undefined),
      requestHelper: vi.fn(async () => ({
        id: 'request',
        handoffId: 'handoff',
        createdAt: 1,
        status: 'open' as const,
        detail: 'plan_unavailable' as const,
      })),
      getActiveHelpRequestId: () => 'R'.repeat(24),
      createId: () => 'audit',
      now: () => 1,
    },
  }
}

describe('focused route-scoped WebMCP tools', () => {
  it('accepts clients that omit optional invocation context', async () => {
    const harness = setup()
    await registerWebMCPTools(harness.context)
    const tool = harness.registrations.find(
      ({ name }) => name === 'showonce_compare_to_handoff',
    )
    const executeWithoutOptions = tool?.execute as unknown as (
      input: Record<string, unknown>,
    ) => Promise<unknown>

    await expect(executeWithoutOptions({})).resolves.toMatchObject({
      needsJudgment: false,
      confirmationRequired: true,
    })
  })

  it('denies policy-disabled safe preferences and helper escalation', async () => {
    const harness = setup()
    const active = harness.context.getActiveHandoff()
    harness.context.getActiveHandoff = () => ({
      ...active,
      policy: {
        allowSafePreferences: false,
        requireConfirmation: true,
        allowHelperEscalation: false,
      },
    })
    await registerWebMCPTools(harness.context)
    for (const name of [
      'benefits_apply_safe_preferences',
      'showonce_request_helper',
    ]) {
      const tool = harness.registrations.find((candidate) => candidate.name === name)
      await expect(
        tool?.execute({}, { signal: new AbortController().signal }),
      ).resolves.toEqual({ ok: false, reason: 'handoff_policy_denied' })
    }
    expect(harness.context.requestHelper).not.toHaveBeenCalled()
  })

  it('polls helper decisions by the active request capability', async () => {
    const harness = setup()
    await registerWebMCPTools(harness.context)
    const tool = harness.registrations.find(
      ({ name }) => name === 'showonce_get_helper_decision',
    )
    const decision = await tool?.execute(
      {},
      { signal: new AbortController().signal },
    )
    expect(
      harness.context.repositories.decisions.pollByRequestToken,
    ).toHaveBeenCalledWith('R'.repeat(24))
    expect(decision).toMatchObject({ recommendedPlanId: 'silver' })
  })

  it('defines exactly the required tools and never exposes confirmation creation', () => {
    expect(SHOWONCE_TOOLS.map(({ name }) => name)).toEqual([
      'showonce_get_handoff',
      'benefits_get_account_state',
      'benefits_get_current_plan',
      'benefits_get_available_plans',
      'showonce_compare_to_handoff',
      'benefits_apply_safe_preferences',
      'benefits_set_renewal_period',
      'benefits_set_paperless',
      'benefits_preview_renewal',
      'showonce_request_helper',
      'showonce_get_helper_decision',
      'benefits_submit_renewal',
    ])
    expect(SHOWONCE_TOOLS.some(({ name }) => name.includes('confirmation'))).toBe(
      false,
    )
  })

  it('registers all recipient tools only on the recipient route and one in the library', async () => {
    const recipient = setup()
    await registerWebMCPTools(recipient.context)
    expect(recipient.registrations).toHaveLength(12)

    const library = setup()
    await registerWebMCPTools({ ...library.context, scope: 'library' })
    expect(library.registrations.map(({ name }) => name)).toEqual([
      'showonce_get_handoff',
    ])
  })

  it('returns requires_user_confirmation before UI confirmation', async () => {
    const fixture = setup()
    await registerWebMCPTools(fixture.context)
    const submit = fixture.registrations.find(
      ({ name }) => name === 'benefits_submit_renewal',
    )
    const submitResult = await submit?.execute(
      {},
      { signal: new AbortController().signal },
    )
    expect(submitResult).toEqual({
      ok: false,
      reason: 'requires_user_confirmation',
    })
    expect(fixture.execute).not.toHaveBeenCalled()
    expect(fixture.context.repositories.activity.append).toHaveBeenCalledWith(
      expect.objectContaining({
        toolName: 'benefits_submit_renewal',
        outcome: 'refused',
      }),
    )
  })

  it('submits after a fresh human UI confirmation exists', async () => {
    const confirmation = {
      token: 'human-token',
      createdAt: 10,
      expiresAt: 130,
    }
    const fixture = setup(confirmation)
    await registerWebMCPTools(fixture.context)
    const submit = fixture.registrations.find(
      ({ name }) => name === 'benefits_submit_renewal',
    )
    await submit?.execute({}, { signal: new AbortController().signal })
    expect(fixture.execute).toHaveBeenCalledWith({
      type: 'submit_renewal',
      confirmationToken: 'human-token',
    })
    expect(fixture.context.completeHandoff).toHaveBeenCalledWith('human-token')
  })

  it('runs registered handlers through atomic completion and activity', async () => {
    const sharedState = new Map<string, unknown>()
    const recipient = createLocalOnlySharedRepositories({ sharedState })
    const helper = createLocalOnlySharedRepositories({ sharedState })
    const registrations: WebMCP.ModelContextTool[] = []
    const baseTime = Date.now()
    const handoffToken = 'H'.repeat(24)
    const requestToken = 'R'.repeat(24)
    const procedure: Procedure = {
      id: 'procedure-tool-flow',
      recordingId: 'recording-tool-flow',
      title: 'Renew benefits',
      createdAt: baseTime,
      sourceEventIds: [],
      steps: [
        {
          id: 'step-annual',
          commandType: 'set_preference',
          policy: 'safe_preference',
          input: {
            type: 'set_preference',
            key: 'renewalFrequency',
            value: 'annual',
          },
        },
        {
          id: 'step-paperless',
          commandType: 'set_preference',
          policy: 'safe_preference',
          input: { type: 'set_preference', key: 'paperless', value: true },
        },
        {
          id: 'step-plan',
          commandType: 'select_plan',
          policy: 'availability_checked',
          input: {
            type: 'select_plan',
            planId: 'gold',
            observedMonthlyPrice: 88,
          },
        },
      ],
    }
    const handoff: Handoff = {
      id: 'handoff-tool-flow',
      publicToken: handoffToken,
      procedureId: procedure.id,
      title: 'For Mom',
      createdAt: baseTime,
      updatedAt: baseTime,
      expiresAt: baseTime + 600_000,
      status: 'created',
      procedure,
      policy: {
        allowSafePreferences: true,
        requireConfirmation: true,
        allowHelperEscalation: true,
      },
    }
    await recipient.handoffs.save(handoff)
    const activeHandoff = await recipient.handoffs.markOpened(
      handoffToken,
      baseTime + 1,
    )
    await recipient.handoffs.transitionByPublicToken(
      handoffToken,
      'running',
      baseTime + 2,
    )

    let account: AccountState = {
      ...createRecipientAccount('normal'),
      selectedPlanId: 'silver',
    }
    const confirmationRef: { current?: Confirmation } = {}
    let submittedState: AccountState | undefined
    let id = 0
    const now = baseTime + 10
    const request: HelpRequest = {
      id: 'helper-request-tool-flow',
      publicToken: requestToken,
      handoffId: handoff.id,
      createdAt: now,
      updatedAt: now,
      expiresAt: baseTime + 500_000,
      status: 'open',
      detail: 'plan_unavailable',
      options: ['silver', 'platinum', 'let_recipient_decide'],
    }
    await registerWebMCPTools({
      document: {
        modelContext: {
          registerTool: vi.fn(async (tool: WebMCP.ModelContextTool) => {
            registrations.push(tool)
          }),
        } as unknown as WebMCP.ModelContext,
      },
      scope: 'recipient',
      repositories: {
        procedures: recipient.procedures,
        handoffs: recipient.handoffs,
        activity: {
          append: (event) =>
            recipient.activity.appendForHandoffToken(handoffToken, event),
        },
        decisions: recipient.decisions,
        helpRequests: recipient.helpRequests,
      },
      execute: (command) => {
        const commandResult = executeCommand(
          {
            state: account,
            source: 'webmcp',
            now,
            confirmation: confirmationRef.current,
            createId: () => `command-${++id}`,
          },
          command,
        )
        if (command.type === 'submit_renewal') {
          submittedState = commandResult.state
        } else {
          account = commandResult.state
        }
        return commandResult
      },
      compare: compareProcedureToRecipient,
      getRecipientState: () => account,
      getInitialState: () => ({
        ...createRecipientAccount('normal'),
        availablePlans: [
          { id: 'silver', name: 'Silver', monthlyPrice: 62 },
          { id: 'gold', name: 'Gold', monthlyPrice: 88 },
        ],
      }),
      getActiveHandoff: () => activeHandoff,
      requestHelper: async () => {
        await recipient.helpRequests.createForHandoffToken(
          handoffToken,
          request,
          now,
        )
        return request
      },
      getActiveHelpRequestId: () => requestToken,
      getConfirmation: () => confirmationRef.current,
      completeHandoff: async (confirmationToken) => {
        await recipient.handoffs.complete(handoffToken, confirmationToken, now)
        account = submittedState ?? account
      },
      createId: () => `invocation-${++id}`,
      now: () => now,
    })

    const invoke = async (name: string) => {
      const tool = registrations.find((candidate) => candidate.name === name)
      expect(tool).toBeDefined()
      return tool?.execute({}, { signal: new AbortController().signal })
    }

    await expect(invoke('showonce_compare_to_handoff')).resolves.toMatchObject({
      needsJudgment: true,
    })
    await expect(invoke('benefits_apply_safe_preferences')).resolves.toMatchObject({
      ok: true,
    })
    expect(account.preferences).toMatchObject({
      renewalFrequency: 'annual',
      paperless: true,
    })
    await invoke('showonce_request_helper')
    await helper.decisions.saveForRequestToken(
      requestToken,
      {
        id: 'helper-decision-tool-flow',
        requestId: request.id,
        outcome: 'recommend_plan',
        recommendedPlanId: 'silver',
        decidedAt: now + 1,
      },
      now + 1,
    )
    await expect(invoke('showonce_get_helper_decision')).resolves.toMatchObject({
      recommendedPlanId: 'silver',
    })
    await recipient.handoffs.transitionByPublicToken(
      handoffToken,
      'waiting_confirmation',
      now + 2,
    )
    confirmationRef.current = await recipient.handoffs.createConfirmation(
      handoffToken,
      now + 3,
    )
    await expect(invoke('benefits_submit_renewal')).resolves.toMatchObject({
      ok: true,
    })

    expect(account.submittedAt).toBe(now)
    await expect(recipient.handoffs.get(handoff.id)).resolves.toMatchObject({
      status: 'completed',
    })
    await expect(recipient.activity.list()).resolves.toContainEqual(
      expect.objectContaining({
        kind: 'command',
        source: 'webmcp',
        commandType: 'submit_renewal',
        policy: 'confirmation_required',
        outcome: 'applied',
        timestamp: now,
      }),
    )
  })

  it('does not fake registrations when WebMCP is unavailable', async () => {
    const fixture = setup()
    const registration = await registerWebMCPTools({
      ...fixture.context,
      document: {},
    })
    expect(registration).toMatchObject({
      available: false,
      registeredToolNames: [],
    })
  })
})
