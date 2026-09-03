import { executeCommand } from '../commands/executeCommand'
import type {
  AccountState,
  Command,
  CommandResult,
  Confirmation,
  Handoff,
  HelperDecision,
  HelperChoice,
  HelpRequest,
  RecipientWorkflowRun,
  Procedure,
  RecordingSession,
} from '../model'
import { compileProcedure } from '../procedures/compileProcedure'
import type { ShowOnceRepositories } from '../repositories/types'
import { generatePublicToken } from '../sharing/publicCapabilities'
import { assertHandoffPolicyAllows } from '../sharing/handoffPolicy'

interface Runtime {
  now?: () => number
  createId?: () => string
  createToken?: () => string
}

const now = () => Date.now()
const createId = () => globalThis.crypto.randomUUID()

export function createDemoAccount(): AccountState {
  return {
    id: 'samuel',
    availablePlans: [
      { id: 'silver', name: 'Silver', monthlyPrice: 62 },
      { id: 'gold', name: 'Gold', monthlyPrice: 88 },
      { id: 'platinum', name: 'Platinum', monthlyPrice: 126 },
    ],
    selectedPlanId: null,
    preferences: {
      paperless: false,
      communication: 'mail',
      renewalFrequency: 'monthly',
    },
    address: '41 Market Street',
    dependents: ['Jordan'],
    submittedAt: null,
  }
}

/** Demo recipient account — the handoff's `recipient` name is a free-text
 * story detail set at handoff-creation time, not tied to this account id. */
export function createRecipientAccount(
  scenario: 'normal' | 'unavailable',
): AccountState {
  return {
    id: scenario === 'normal' ? 'recipient-normal' : 'recipient-unavailable',
    availablePlans:
      scenario === 'normal'
        ? [
            { id: 'silver', name: 'Silver', monthlyPrice: 96 },
            { id: 'gold', name: 'Gold', monthlyPrice: 142 },
          ]
        : [
            { id: 'silver', name: 'Silver', monthlyPrice: 96 },
            { id: 'platinum', name: 'Platinum', monthlyPrice: 180 },
          ],
    selectedPlanId: null,
    preferences: {
      paperless: false,
      communication: 'mail',
      renewalFrequency: 'monthly',
    },
    address: '14 Cedar Lane',
    dependents: ['Avery', 'Casey'],
    submittedAt: null,
  }
}

export async function startRecording(
  repositories: ShowOnceRepositories,
  title: string,
  runtime: Runtime & {
    description?: string
    targetApp?: 'nexa-benefits'
  } = {},
): Promise<RecordingSession> {
  const timestamp = (runtime.now ?? now)()
  const recording: RecordingSession = {
    id: (runtime.createId ?? createId)(),
    title: title.trim(),
    createdAt: timestamp,
    status: 'capturing',
    events: [],
    ...(runtime.description ? { description: runtime.description.trim() } : {}),
    ...(runtime.targetApp ? { targetApp: runtime.targetApp } : {}),
  }
  await repositories.recordings.save(recording)
  return recording
}

export async function applyRecordedCommand(
  repositories: ShowOnceRepositories,
  recordingId: string,
  account: AccountState,
  command: Command,
  runtime: Runtime & {
    confirmation?: Confirmation
    createToken?: () => string
  } = {},
): Promise<CommandResult> {
  const recording = await repositories.recordings.get(recordingId)
  if (!recording || recording.status !== 'capturing') {
    throw new Error('Recording is not capturing')
  }
  const timestamp = (runtime.now ?? now)()
  const result = executeCommand(
    {
      state: account,
      source: 'human',
      now: timestamp,
      createId: runtime.createId ?? createId,
      confirmation: runtime.confirmation,
      createToken: runtime.createToken,
    },
    command,
  )
  // The recording + account writes are what the recorder UI reads back, so
  // they must succeed for the capture to be visible. Activity is only an
  // audit trail: never let a shared-persistence hiccup there block capture.
  await Promise.all([
    repositories.recordings.save({
      ...recording,
      events: [...recording.events, result.event],
    }),
    repositories.accounts.save(result.state),
  ])
  void repositories.activity
    .save({
      id: `activity-${result.event.id}`,
      kind: 'command',
      timestamp,
      source: 'human',
      outcome: result.ok ? 'applied' : 'refused',
      commandType: result.event.commandType,
      policy: result.event.policy,
    })
    .catch((error: unknown) => {
      console.warn('Failed to record activity event', error)
    })
  return result
}

export async function applyRecipientCommand(
  repositories: ShowOnceRepositories,
  account: AccountState,
  command: Command,
  options: Runtime & {
    handoffToken: string
    policy?: Handoff['policy']
    source?: 'human' | 'webmcp'
    confirmation?: Confirmation
    createToken?: () => string
  },
): Promise<CommandResult> {
  if (command.type === 'set_preference' && options.policy) {
    assertHandoffPolicyAllows(options.policy, 'apply_safe_preferences')
  }
  const timestamp = (options.now ?? now)()
  const result = executeCommand(
    {
      state: account,
      source: options.source ?? 'human',
      now: timestamp,
      createId: options.createId ?? createId,
      createToken: options.createToken,
      confirmation: options.confirmation,
    },
    command,
  )
  // Same reasoning as applyRecordedCommand: account state must persist
  // reliably; activity logging is best-effort and must not block it.
  await repositories.accounts.save(result.state)
  void repositories.activity
    .appendForHandoffToken(options.handoffToken, {
      id: `activity-${result.event.id}`,
      kind: 'command',
      timestamp,
      source: options.source ?? 'human',
      outcome: result.ok ? 'applied' : 'refused',
      commandType: result.event.commandType,
      policy: result.event.policy,
    })
    .catch((error: unknown) => {
      console.warn('Failed to record activity event', error)
    })
  return result
}

export async function finishRecording(
  repositories: ShowOnceRepositories,
  recordingId: string,
): Promise<Procedure> {
  const recording = await repositories.recordings.get(recordingId)
  if (!recording) throw new Error('Recording not found')
  const procedure = compileProcedure(recording, recording.events)
  await Promise.all([
    repositories.recordings.save({ ...recording, status: 'finished' }),
    repositories.procedures.save(procedure),
  ])
  return procedure
}

export async function createHandoff(
  repositories: ShowOnceRepositories,
  procedure: Procedure,
  title: string,
  details: {
    recipient?: string
    note?: string
    expiresAt?: number
    policy?: Handoff['policy']
  } = {},
  runtime: Runtime = {},
): Promise<Handoff> {
  const handoff: Handoff = {
    id: (runtime.createId ?? createId)(),
    publicToken: (runtime.createToken ?? generatePublicToken)(),
    procedureId: procedure.id,
    title: title.trim(),
    createdAt: (runtime.now ?? now)(),
    updatedAt: (runtime.now ?? now)(),
    status: 'created',
    procedure,
    ...details,
  }
  handoff.expiresAt ??= handoff.createdAt + 7 * 24 * 60 * 60 * 1000
  await repositories.handoffs.save(handoff)
  return handoff
}

export async function createHelpRequest(
  repositories: ShowOnceRepositories,
  handoffId: string,
  runtime: Runtime = {},
  detail: HelpRequest['detail'] = 'plan_unavailable',
): Promise<HelpRequest> {
  const options: HelpRequest['options'] =
    detail === 'material_price_change'
      ? ['gold', 'silver', 'let_recipient_decide']
      : ['silver', 'platinum', 'let_recipient_decide']
  const request: HelpRequest = {
    id: (runtime.createId ?? createId)(),
    publicToken: (runtime.createToken ?? generatePublicToken)(),
    handoffId,
    createdAt: (runtime.now ?? now)(),
    updatedAt: (runtime.now ?? now)(),
    expiresAt: (runtime.now ?? now)() + 7 * 24 * 60 * 60 * 1000,
    status: 'open',
    detail,
    options,
  }
  await repositories.helpRequests.createForHandoffToken(handoffId, request)
  return request
}

export async function createRecipientWorkflow(
  repositories: ShowOnceRepositories,
  handoffId: string,
  scenario: 'normal' | 'unavailable',
  accountId: string,
  runtime: Runtime = {},
): Promise<RecipientWorkflowRun> {
  const existing = (await repositories.runs.list()).find(
    (run) => run.handoffId === handoffId && run.scenario === scenario,
  )
  if (existing) return existing
  const timestamp = (runtime.now ?? now)()
  const run: RecipientWorkflowRun = {
    id: (runtime.createId ?? createId)(),
    handoffId,
    scenario,
    accountId,
    phase: 'explain',
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  await repositories.runs.save(run)
  return run
}

export async function updateRecipientWorkflow(
  repositories: ShowOnceRepositories,
  run: RecipientWorkflowRun,
  update: Partial<
    Pick<
      RecipientWorkflowRun,
      | 'phase'
      | 'helperRequestId'
      | 'selectedPlanId'
      | 'lastOutcome'
    >
  >,
  runtime: Runtime = {},
): Promise<RecipientWorkflowRun> {
  const next = {
    ...run,
    ...update,
    updatedAt: (runtime.now ?? now)(),
  }
  await repositories.runs.save(next)
  return next
}

export async function recordHelperRecommendation(
  repositories: ShowOnceRepositories,
  run: RecipientWorkflowRun,
  recommendation: HelperChoice,
  runtime: Runtime = {},
) {
  const request =
    (run.helperRequestId
      ? await repositories.helpRequests.get(run.helperRequestId)
      : null) ??
    (await createHelpRequest(repositories, run.handoffId, runtime))
  const timestamp = (runtime.now ?? now)()
  const result = executeCommand(
    {
      state: createDemoAccount(),
      source: 'human',
      now: timestamp,
      createId: runtime.createId ?? createId,
    },
    recommendation === 'let_recipient_decide'
      ? {
          type: 'record_decision',
          requestId: request.id,
          outcome: 'let_recipient_decide',
        }
      : {
          type: 'record_decision',
          requestId: request.id,
          outcome: 'recommend_plan',
          recommendedPlanId: recommendation,
        },
  )
  if (!result.decision) throw new Error('Decision was not created')
  await Promise.all([
    repositories.decisions.save(result.decision),
    repositories.helpRequests.save({ ...request, status: 'resolved' }),
    updateRecipientWorkflow(
      repositories,
      { ...run, helperRequestId: request.id },
      {
        phase: 'helper_resolved',
        helperRequestId: request.id,
        lastOutcome: recommendation,
      },
      runtime,
    ),
  ])
  return result.decision
}

export async function applyHelperRecommendation(
  repositories: ShowOnceRepositories,
  account: AccountState,
  run: RecipientWorkflowRun,
  decision: HelperDecision,
  options: Runtime & {
    handoffToken: string
    policy?: Handoff['policy']
  },
): Promise<{
  account: AccountState
  run: RecipientWorkflowRun
  command: CommandResult
}> {
  if (
    decision.outcome !== 'recommend_plan' ||
    !decision.recommendedPlanId
  ) {
    throw new Error('A helper plan recommendation is required')
  }
  const command = await applyRecipientCommand(
    repositories,
    account,
    { type: 'select_plan', planId: decision.recommendedPlanId },
    {
      ...options,
      source: 'human',
    },
  )
  if (!command.ok) return { account, run, command }
  const nextRun = await updateRecipientWorkflow(
    repositories,
    run,
    {
      phase: 'confirmation',
      selectedPlanId: decision.recommendedPlanId,
      lastOutcome: 'helper',
    },
    options,
  )
  return { account: command.state, run: nextRun, command }
}

export async function completeRecipientSubmission(
  repositories: ShowOnceRepositories,
  account: AccountState,
  run: RecipientWorkflowRun,
  confirmation: Confirmation,
  options: Runtime & {
    handoffToken: string
    source?: 'human' | 'webmcp'
  },
): Promise<
  | {
      ok: true
      account: AccountState
      run: RecipientWorkflowRun
      command: CommandResult
    }
  | {
      ok: false
      reason: 'confirmation_expired' | 'completion_failed' | 'submission_refused'
      account: AccountState
      run: RecipientWorkflowRun
      command?: CommandResult
    }
> {
  const timestamp = (options.now ?? now)()
  const command = executeCommand(
    {
      state: account,
      source: options.source ?? 'webmcp',
      now: timestamp,
      createId: options.createId ?? createId,
      confirmation,
    },
    {
      type: 'submit_renewal',
      confirmationToken: confirmation.token,
    },
  )
  if (!command.ok) {
    return {
      ok: false,
      reason:
        command.reason === 'confirmation_expired'
          ? 'confirmation_expired'
          : 'submission_refused',
      account,
      run: { ...run, phase: 'confirmation' },
      command,
    }
  }
  // Reaching the AWAITING HUMAN APPROVAL screen may have happened from
  // 'running' or, when the comparison flagged a material difference,
  // 'needs_input' — both are valid predecessors of 'waiting_confirmation'.
  // Advancing here (idempotently; a no-op if already there) guarantees
  // `.complete()` below always sees an allowed source status regardless of
  // which path the recipient took to get here. Best-effort: if this fails
  // (e.g. a test double with no backing handoff record), fall through and
  // let `.complete()`'s own error handling decide the outcome.
  await repositories.handoffs
    .transitionByPublicToken(options.handoffToken, 'waiting_confirmation', timestamp)
    .catch(() => undefined)
  try {
    await repositories.handoffs.complete(
      options.handoffToken,
      confirmation.token,
      timestamp,
    )
  } catch (error) {
    const confirmationRejected =
      error instanceof Error &&
      /confirmation.*(?:invalid|expired|consumed)/iu.test(error.message)
    return {
      ok: false,
      reason: confirmationRejected
        ? 'confirmation_expired'
        : 'completion_failed',
      account,
      run: { ...run, phase: 'confirmation' },
      command,
    }
  }
  const nextRun: RecipientWorkflowRun = {
    ...run,
    phase: 'complete',
    lastOutcome: 'submitted',
    updatedAt: timestamp,
  }
  await Promise.all([
    repositories.accounts.save(command.state),
    repositories.runs.save(nextRun),
  ])
  return {
    ok: true,
    account: command.state,
    run: nextRun,
    command,
  }
}

/**
 * The single atomic human action that replaces the old two-turn
 * "WebMCP asks for confirmation → human confirms → WebMCP submits again"
 * dance. An agent can read state, adapt safe preferences, and prepare the
 * renewal right up to this point — but only a human clicking "Confirm &
 * submit" can call this. It (1) records a HUMAN-only `recipient_attestation`
 * semantic event, then (2) immediately mints a fresh single-use confirmation
 * and executes `submit_renewal` through the exact same domain command layer,
 * so the UI can go straight from AWAITING HUMAN APPROVAL to the success
 * screen with no further agent turn required.
 */
export async function attestAndSubmitRenewal(
  repositories: ShowOnceRepositories,
  account: AccountState,
  run: RecipientWorkflowRun,
  options: Runtime & { handoffToken: string },
): ReturnType<typeof completeRecipientSubmission> {
  const timestamp = (options.now ?? now)()
  const attestation = executeCommand(
    {
      state: account,
      source: 'human',
      now: timestamp,
      createId: options.createId ?? createId,
    },
    { type: 'recipient_attestation' },
  )
  await repositories.activity
    .appendForHandoffToken(options.handoffToken, {
      id: `activity-${attestation.event.id}`,
      kind: 'command',
      timestamp,
      source: 'human',
      outcome: 'applied',
      commandType: attestation.event.commandType,
      policy: attestation.event.policy,
    })
    .catch((error: unknown) => {
      console.warn('Failed to record attestation activity', error)
    })

  const confirmation = await repositories.handoffs.createConfirmation(
    options.handoffToken,
    timestamp,
  )
  return completeRecipientSubmission(repositories, account, run, confirmation, {
    ...options,
    source: 'human',
  })
}

export function submitWithFreshConfirmation(
  state: AccountState,
  options: {
    confirmationNow: number
    submissionNow: number
    createId: () => string
    createToken: () => string
  },
): CommandResult {
  const confirmationResult = executeCommand(
    {
      state,
      source: 'human',
      now: options.confirmationNow,
      createId: options.createId,
      createToken: options.createToken,
    },
    { type: 'create_confirmation' },
  )
  if (!confirmationResult.confirmation) {
    return confirmationResult
  }
  return executeCommand(
    {
      state: confirmationResult.state,
      source: 'human',
      now: options.submissionNow,
      createId: options.createId,
      confirmation: confirmationResult.confirmation,
    },
    {
      type: 'submit_renewal',
      confirmationToken: confirmationResult.confirmation.token,
    },
  )
}
