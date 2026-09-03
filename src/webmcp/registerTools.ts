import type { ActivityEvent } from '../domain/model'
import { assertHandoffPolicyAllows } from '../domain/sharing/handoffPolicy'
import { SHOWONCE_TOOLS } from './definitions/tools'
import type {
  ShowOnceToolDescriptor,
  ShowOnceToolName,
  WebMCPRegistration,
  WebMCPRegistrationContext,
  WebMCPRegistrationOptions,
  WebMCPScope,
} from './types'

function abortError(): DOMException {
  return new DOMException('The WebMCP invocation was aborted', 'AbortError')
}

const neverAbortedSignal = new AbortController().signal

function assertNotAborted(signal: AbortSignal): void {
  if (signal.aborted) {
    throw abortError()
  }
}

function stringInput(
  input: Record<string, unknown>,
  key: string,
): string | null {
  return typeof input[key] === 'string' ? input[key] : null
}

function defaultId(): string {
  return globalThis.crypto.randomUUID()
}

async function audit(
  context: WebMCPRegistrationContext,
  toolName: ShowOnceToolName,
  outcome: NonNullable<ActivityEvent['outcome']>,
): Promise<void> {
  await context.repositories.activity.append({
    id: (context.createId ?? defaultId)(),
    kind: 'webmcp_invocation',
    timestamp: (context.now ?? Date.now)(),
    source: 'webmcp',
    toolName,
    outcome,
  })
}

async function invoke(
  descriptor: ShowOnceToolDescriptor,
  context: WebMCPRegistrationContext,
  input: Record<string, unknown>,
  signal: AbortSignal,
): Promise<unknown> {
  let result: unknown
  let outcome: NonNullable<ActivityEvent['outcome']> = descriptor.annotations
    ?.readOnlyHint
    ? 'read'
    : 'applied'

  try {
    assertNotAborted(signal)
    await context.onToolStart?.(descriptor.name)
    assertNotAborted(signal)
    switch (descriptor.name) {
      case 'showonce_get_handoff': {
        const id = stringInput(input, 'id')
        result =
          context.getActiveHandoff?.() ??
          (id ? await context.repositories.handoffs.get(id) : null)
        break
      }
      case 'benefits_get_account_state':
        result = context.getRecipientState()
        break
      case 'benefits_get_current_plan': {
        const state = context.getRecipientState()
        result =
          state.availablePlans.find(({ id }) => id === state.selectedPlanId) ??
          null
        break
      }
      case 'benefits_get_available_plans':
        result = context.getRecipientState().availablePlans
        break
      case 'showonce_compare_to_handoff': {
        const handoff = context.getActiveHandoff?.()
        if (!handoff?.procedure) {
          outcome = 'refused'
          result = { ok: false, reason: 'handoff_not_found' }
          break
        }
        const recipient = context.getRecipientState()
        result = context.compare(
          handoff.procedure,
          context.getInitialState?.() ?? recipient,
          recipient,
        )
        break
      }
      case 'benefits_apply_safe_preferences': {
        const handoff = context.getActiveHandoff?.()
        if (!handoff?.procedure) {
          outcome = 'refused'
          result = { ok: false, reason: 'handoff_not_found' }
          break
        }
        try {
          assertHandoffPolicyAllows(
            handoff.policy ?? {
              allowSafePreferences: false,
              requireConfirmation: true,
              allowHelperEscalation: false,
            },
            'apply_safe_preferences',
          )
        } catch {
          outcome = 'refused'
          result = { ok: false, reason: 'handoff_policy_denied' }
          break
        }
        const adaptation = context.compare(
          handoff.procedure,
          context.getInitialState?.() ?? context.getRecipientState(),
          context.getRecipientState(),
        )
        const results = []
        for (const command of adaptation.safeActions.filter(
          (candidate) => candidate.type === 'set_preference',
        )) {
          results.push(context.execute(command))
        }
        result = { ok: results.every((item) => item.ok), results }
        outcome = results.every((item) => item.ok) ? 'applied' : 'refused'
        break
      }
      case 'benefits_set_renewal_period': {
        const period = input.period
        if (period !== 'monthly' && period !== 'annual') {
          outcome = 'refused'
          result = { ok: false, reason: 'invalid_command' }
          break
        }
        const commandResult = context.execute({
          type: 'set_preference',
          key: 'renewalFrequency',
          value: period,
        })
        result = commandResult
        outcome = commandResult.ok ? 'applied' : 'refused'
        break
      }
      case 'benefits_set_paperless': {
        const enabled = input.enabled
        if (typeof enabled !== 'boolean') {
          outcome = 'refused'
          result = { ok: false, reason: 'invalid_command' }
          break
        }
        const commandResult = context.execute({
          type: 'set_preference',
          key: 'paperless',
          value: enabled,
        })
        result = commandResult
        outcome = commandResult.ok ? 'applied' : 'refused'
        break
      }
      case 'benefits_preview_renewal': {
        const commandResult = context.execute({ type: 'preview_renewal' })
        result = commandResult
        outcome = commandResult.ok ? 'applied' : 'refused'
        break
      }
      case 'showonce_request_helper':
        if (!context.requestHelper) {
          outcome = 'refused'
          result = { ok: false, reason: 'helper_not_available' }
          break
        }
        try {
          assertHandoffPolicyAllows(
            context.getActiveHandoff?.()?.policy ?? {
              allowSafePreferences: false,
              requireConfirmation: true,
              allowHelperEscalation: false,
            },
            'request_helper',
          )
        } catch {
          outcome = 'refused'
          result = { ok: false, reason: 'handoff_policy_denied' }
          break
        }
        result = await context.requestHelper()
        break
      case 'showonce_get_helper_decision': {
        const requestId = context.getActiveHelpRequestId?.()
        result = requestId
          ? await context.repositories.decisions.pollByRequestToken(requestId)
          : null
        break
      }
      case 'benefits_submit_renewal': {
        const confirmation = context.getConfirmation?.()
        if (!confirmation) {
          outcome = 'refused'
          result = { ok: false, reason: 'requires_user_confirmation' }
          break
        }
        const commandResult = context.execute({
          type: 'submit_renewal',
          confirmationToken: confirmation.token,
        })
        if (commandResult.ok) {
          if (!context.completeHandoff) {
            throw new Error('Atomic handoff completion is unavailable')
          }
          await context.completeHandoff(confirmation.token)
        }
        result = commandResult
        outcome = commandResult.ok ? 'applied' : 'refused'
        break
      }
    }
    assertNotAborted(signal)
  } catch (error) {
    outcome =
      signal.aborted ||
      (error instanceof DOMException && error.name === 'AbortError')
        ? 'aborted'
        : 'error'
    await audit(context, descriptor.name, outcome)
    throw error
  }

  if (
    descriptor.name !== 'benefits_submit_renewal' ||
    outcome !== 'applied'
  ) {
    await audit(context, descriptor.name, outcome)
  }
  context.onToolResult?.(descriptor.name, result)
  return result
}

function supportsScope(
  scopes: readonly WebMCPScope[],
  scope: WebMCPScope,
): boolean {
  return scopes.includes(scope)
}

function activeDocument(
  supplied?: Pick<Document, 'modelContext'>,
): Pick<Document, 'modelContext'> | undefined {
  if (supplied) {
    return supplied
  }
  return typeof document === 'undefined' ? undefined : document
}

export async function registerWebMCPTools(
  context: WebMCPRegistrationContext,
  options: WebMCPRegistrationOptions = {},
): Promise<WebMCPRegistration> {
  const modelContext = activeDocument(context.document)?.modelContext
  if (!modelContext) {
    return {
      available: false,
      registeredToolNames: [],
      dispose() {},
    }
  }

  if (options.signal?.aborted) {
    return {
      available: true,
      registeredToolNames: [],
      dispose() {},
    }
  }

  const lifecycle = new AbortController()
  const abortLifecycle = () => lifecycle.abort(options.signal?.reason)
  options.signal?.addEventListener('abort', abortLifecycle, { once: true })
  const registeredToolNames: ShowOnceToolName[] = []
  try {
    for (const descriptor of SHOWONCE_TOOLS.filter(({ scopes }) =>
      supportsScope(scopes, context.scope),
    )) {
      const tool: WebMCP.ModelContextTool = {
        name: descriptor.name,
        title: descriptor.title,
        description: descriptor.description,
        inputSchema: descriptor.inputSchema,
        annotations: descriptor.annotations,
        execute: (
          input,
          invocationOptions?: WebMCP.ToolExecuteCallbackOptions,
        ) =>
          invoke(
            descriptor,
            context,
            input,
            invocationOptions?.signal ?? neverAbortedSignal,
          ),
      }
      await modelContext.registerTool(tool, { signal: lifecycle.signal })
      registeredToolNames.push(descriptor.name)
    }
  } catch (error) {
    lifecycle.abort()
    options.signal?.removeEventListener('abort', abortLifecycle)
    throw error
  }

  return {
    available: true,
    registeredToolNames,
    dispose: () => {
      options.signal?.removeEventListener('abort', abortLifecycle)
      lifecycle.abort()
    },
  }
}
