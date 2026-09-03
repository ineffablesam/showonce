import type {
  Procedure,
  ProcedureStep,
  Recording,
  SemanticEvent,
} from '../model'
import { isPortablePolicy } from '../policies/actionPolicies'
import { sanitizeSensitive } from '../security/sanitize'

function stepFromEvent(event: SemanticEvent): ProcedureStep | null {
  if (event.status !== 'applied' || !isPortablePolicy(event.policy)) {
    return null
  }

  const input = sanitizeSensitive(event.input) as Record<string, unknown>
  if (
    event.commandType === 'set_preference' &&
    input.key === 'paperless' &&
    typeof input.value === 'boolean'
  ) {
    return {
      id: `step-${event.id}`,
      commandType: 'set_preference',
      policy: 'safe_preference',
      input: {
        type: 'set_preference',
        key: 'paperless',
        value: input.value,
      },
    }
  }

  if (
    event.commandType === 'set_preference' &&
    input.key === 'communication' &&
    (input.value === 'email' || input.value === 'mail')
  ) {
    return {
      id: `step-${event.id}`,
      commandType: 'set_preference',
      policy: 'safe_preference',
      input: {
        type: 'set_preference',
        key: 'communication',
        value: input.value,
      },
    }
  }

  if (
    event.commandType === 'set_preference' &&
    input.key === 'renewalFrequency' &&
    (input.value === 'annual' || input.value === 'monthly')
  ) {
    return {
      id: `step-${event.id}`,
      commandType: 'set_preference',
      policy: 'safe_preference',
      input: {
        type: 'set_preference',
        key: 'renewalFrequency',
        value: input.value,
      },
    }
  }

  if (event.commandType === 'select_plan' && typeof input.planId === 'string') {
    return {
      id: `step-${event.id}`,
      commandType: 'select_plan',
      policy: 'availability_checked',
      input: {
        type: 'select_plan',
        planId: input.planId,
        ...(typeof input.observedMonthlyPrice === 'number'
          ? { observedMonthlyPrice: input.observedMonthlyPrice }
          : {}),
      },
    }
  }

  if (
    event.commandType === 'review_recipient_details' &&
    event.policy === 'recipient_specific'
  ) {
    return {
      id: `step-${event.id}`,
      commandType: 'review_recipient_details',
      policy: 'recipient_specific',
      input: { type: 'review_recipient_details' },
    }
  }

  if (event.commandType === 'preview_renewal' && event.policy === 'state_check') {
    return {
      id: `step-${event.id}`,
      commandType: 'preview_renewal',
      policy: 'state_check',
      input: { type: 'preview_renewal' },
    }
  }

  if (
    event.commandType === 'create_confirmation' &&
    event.policy === 'confirmation_required'
  ) {
    return {
      id: `step-${event.id}`,
      commandType: 'create_confirmation',
      policy: 'confirmation_required',
      input: { type: 'create_confirmation' },
    }
  }

  if (
    event.commandType === 'submit_renewal' &&
    event.policy === 'confirmation_required'
  ) {
    return {
      id: `step-${event.id}`,
      commandType: 'submit_renewal',
      policy: 'confirmation_required',
      input: { type: 'submit_renewal' },
    }
  }

  return null
}

export function compileProcedure(
  recording: Recording,
  events: SemanticEvent[],
): Procedure {
  const portable = events
    .map((event) => ({ event, step: stepFromEvent(event) }))
    .filter(
      (item): item is { event: SemanticEvent; step: ProcedureStep } =>
        item.step !== null,
    )

  return {
    id: `procedure-${recording.id}`,
    recordingId: recording.id,
    title: recording.title,
    createdAt: recording.createdAt,
    sourceEventIds: portable.map(({ event }) => event.id),
    steps: portable.map(({ step }) => step),
  }
}
