import type {
  AccountState,
  AdaptationResult,
  PortableCommand,
  ProcedureStep,
} from '../domain/model'

export interface CompareAgentGuidance {
  stopBeforePlanSelection: true
  askRecipientFirst: true
  summary: string
  suggestedQuestion: string
  afterRecipientAgrees: string
  doNot: readonly string[]
}

function selectPlanStep(
  steps: Array<Pick<ProcedureStep, 'commandType' | 'input'>>,
): Extract<PortableCommand, { type: 'select_plan' }> | null {
  for (const step of steps) {
    if (step.commandType !== 'select_plan') continue
    return step.input as Extract<PortableCommand, { type: 'select_plan' }>
  }
  return null
}

export function buildCompareAgentGuidance(
  comparison: AdaptationResult,
  procedure: { steps: Array<Pick<ProcedureStep, 'commandType' | 'input'>> },
  recipient: AccountState,
): CompareAgentGuidance | undefined {
  if (!comparison.needsJudgment) return undefined

  const demonstrated = selectPlanStep(procedure.steps)
  const recipientPlan = demonstrated
    ? recipient.availablePlans.find(({ id }) => id === demonstrated.planId)
    : undefined
  const planName = recipientPlan?.name ?? demonstrated?.planId ?? 'the recorded plan'
  const unavailable = comparison.differences.some(
    (difference) => difference.kind === 'plan_unavailable',
  )
  const priceChange = comparison.differences.find(
    (difference) => difference.kind === 'material_price_change',
  )
  const recordedPrice = demonstrated?.observedMonthlyPrice

  let summary = 'Something in the recording does not match this account.'
  if (unavailable) {
    summary = `${planName} from the recording is not offered on this account.`
  } else if (
    priceChange &&
    recordedPrice !== undefined &&
    recipientPlan !== undefined
  ) {
    summary = `The recording shows ${planName} at $${recordedPrice}/month, but this account has it at $${recipientPlan.monthlyPrice}/month.`
  } else if (priceChange) {
    summary = priceChange.detail
  }

  return {
    stopBeforePlanSelection: true,
    askRecipientFirst: true,
    summary,
    suggestedQuestion:
      'Briefly explain the mismatch, then ask the recipient: "Should I ask [name]?" Use the sender\'s name from the conversation if they gave one (for example, "Should I ask Samuel?").',
    afterRecipientAgrees:
      'Only after they say yes, call showonce_request_helper, poll showonce_get_helper_decision, then follow the recommendation before selecting a plan.',
    doNot: [
      'Do not call benefits_select_plan for the mismatched plan yet.',
      'Do not ask the recipient to proceed at the new price without asking the sender first.',
      'Do not submit or prepare renewal until plan choice is resolved.',
    ],
  }
}

export function buildJudgmentRequiredGuidance(
  comparison: AdaptationResult | null,
): Pick<CompareAgentGuidance, 'suggestedQuestion' | 'afterRecipientAgrees'> {
  if (comparison?.needsJudgment) {
    return {
      suggestedQuestion:
        'Plan selection is blocked until the sender weighs in. Ask the recipient: "Should I ask [name]?"',
      afterRecipientAgrees:
        'Call showonce_request_helper, then poll showonce_get_helper_decision.',
    }
  }
  return {
    suggestedQuestion:
      'This plan choice needs the sender\'s input first. Ask: "Should I ask [name]?"',
    afterRecipientAgrees:
      'Call showonce_request_helper, then poll showonce_get_helper_decision.',
  }
}
