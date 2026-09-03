import type {
  AccountState,
  Command,
  CommandContext,
  CommandResult,
  SemanticEvent,
} from '../model'
import { policyForCommand } from '../policies/actionPolicies'
import { sanitizeSensitive } from '../security/sanitize'

const CONFIRMATION_TTL_MS = 120_000
const DECISION_OUTCOMES = new Set([
  'choose_demonstrated',
  'choose_alternative',
  'recommend_plan',
  'let_recipient_decide',
  'cancel',
])

interface RuntimePreference {
  key?: unknown
  value?: unknown
}

function isValidPreference(command: RuntimePreference): boolean {
  return (
    (command.key === 'paperless' && typeof command.value === 'boolean') ||
    (command.key === 'communication' &&
      (command.value === 'email' || command.value === 'mail')) ||
    (command.key === 'renewalFrequency' &&
      (command.value === 'annual' || command.value === 'monthly'))
  )
}

function safeEventInput(
  command: Command,
  authoritativePlanPrice?: number,
): Record<string, unknown> {
  switch (command.type) {
    case 'set_preference': {
      const runtimeCommand = command as RuntimePreference
      if (isValidPreference(runtimeCommand)) {
        return {
          type: command.type,
          key: runtimeCommand.key,
          value: runtimeCommand.value,
        }
      }
      return { type: command.type }
    }
    case 'select_plan':
      return {
        type: command.type,
        planId: command.planId,
        ...(authoritativePlanPrice === undefined
          ? {}
          : { observedMonthlyPrice: authoritativePlanPrice }),
      }
    case 'record_decision':
      return {
        type: command.type,
        requestId: command.requestId,
        outcome: command.outcome,
        ...(command.recommendedPlanId
          ? { recommendedPlanId: command.recommendedPlanId }
          : {}),
      }
    default:
      return { type: command.type }
  }
}

function eventFor(
  context: CommandContext,
  command: Command,
  status: SemanticEvent['status'],
  authoritativePlanPrice?: number,
): SemanticEvent {
  return {
    id: context.createId(),
    commandType: command.type,
    source: context.source,
    timestamp: context.now,
    policy: policyForCommand(command),
    status,
    input: sanitizeSensitive(safeEventInput(command, authoritativePlanPrice)),
  }
}

function refused(
  context: CommandContext,
  command: Command,
  reason: NonNullable<CommandResult['reason']>,
): CommandResult {
  return {
    ok: false,
    state: context.state,
    reason,
    event: eventFor(context, command, 'refused'),
  }
}

function withPreferences(
  state: AccountState,
  command: Extract<Command, { type: 'set_preference' }>,
): AccountState {
  if (command.key === 'paperless') {
    return {
      ...state,
      preferences: { ...state.preferences, paperless: command.value },
    }
  }
  if (command.key === 'renewalFrequency') {
    return {
      ...state,
      preferences: {
        ...state.preferences,
        renewalFrequency: command.value,
      },
    }
  }
  return {
    ...state,
    preferences: { ...state.preferences, communication: command.value },
  }
}

export function executeCommand(
  context: CommandContext,
  command: Command,
): CommandResult {
  if (command.type === 'create_confirmation') {
    if (context.source === 'webmcp') {
      return refused(context, command, 'requires_user_confirmation')
    }
    const token = (context.createToken ?? (() => globalThis.crypto.randomUUID()))()
    const confirmation = {
      token,
      createdAt: context.now,
      expiresAt: context.now + CONFIRMATION_TTL_MS,
    }
    return {
      ok: true,
      state: context.state,
      confirmation,
      event: eventFor(context, command, 'applied'),
    }
  }

  if (command.type === 'recipient_attestation') {
    // This is the one command WebMCP tools are structurally unable to issue:
    // there is no tool that sends it, and even if one existed, the source
    // guard below would refuse it. It never mutates account state — it only
    // produces the semantic event that proves a human personally attested,
    // immediately before the same click atomically submits the renewal.
    if (context.source === 'webmcp') {
      return refused(context, command, 'requires_user_confirmation')
    }
    return {
      ok: true,
      state: context.state,
      event: eventFor(context, command, 'applied'),
    }
  }

  if (
    command.type === 'set_preference' &&
    !isValidPreference(command)
  ) {
    return refused(context, command, 'invalid_command')
  }

  if (command.type === 'select_plan') {
    if (
      context.source === 'webmcp' &&
      context.planSelectionGuard?.requiresJudgment &&
      context.planAuthorization?.planId !== command.planId
    ) {
      return refused(context, command, 'judgment_required')
    }
    const plan = context.state.availablePlans.find(({ id }) => id === command.planId)
    if (!plan) {
      return refused(context, command, 'plan_unavailable')
    }
    const state = { ...context.state, selectedPlanId: command.planId }
    return {
      ok: true,
      state,
      event: eventFor(context, command, 'applied', plan.monthlyPrice),
    }
  }

  if (command.type === 'submit_renewal') {
    if (context.state.submittedAt !== null) {
      return refused(context, command, 'already_submitted')
    }
    if (
      context.state.selectedPlanId === null ||
      !context.state.availablePlans.some(
        ({ id }) => id === context.state.selectedPlanId,
      )
    ) {
      return refused(context, command, 'plan_required')
    }
    if (!context.confirmation) {
      return refused(context, command, 'requires_user_confirmation')
    }
    if (context.confirmation.token !== command.confirmationToken) {
      return refused(context, command, 'confirmation_invalid')
    }
    if (context.now >= context.confirmation.expiresAt) {
      return refused(context, command, 'confirmation_expired')
    }
    const state = { ...context.state, submittedAt: context.now }
    return {
      ok: true,
      state,
      event: eventFor(context, command, 'applied'),
    }
  }

  if (command.type === 'record_decision') {
    const runtimeOutcome: unknown = command.outcome
    if (
      command.requestId.trim() === '' ||
      typeof runtimeOutcome !== 'string' ||
      !DECISION_OUTCOMES.has(runtimeOutcome) ||
      (command.outcome === 'recommend_plan' &&
        command.recommendedPlanId !== 'silver' &&
        command.recommendedPlanId !== 'gold' &&
        command.recommendedPlanId !== 'platinum')
    ) {
      return refused(context, command, 'invalid_command')
    }
    const decision = {
      id: context.createId(),
      requestId: command.requestId,
      outcome: command.outcome,
      decidedAt: context.now,
      ...(command.recommendedPlanId
        ? { recommendedPlanId: command.recommendedPlanId }
        : {}),
    }
    return {
      ok: true,
      state: context.state,
      decision,
      event: eventFor(context, command, 'applied'),
    }
  }

  let state: AccountState
  if (command.type === 'set_preference') {
    state = withPreferences(context.state, command)
  } else if (command.type === 'set_address') {
    state = { ...context.state, address: command.address }
  } else if (command.type === 'add_dependent') {
    state = {
      ...context.state,
      dependents: [...context.state.dependents, command.name],
    }
  } else {
    state = context.state
  }

  return {
    ok: true,
    state,
    event: eventFor(context, command, 'applied'),
  }
}
