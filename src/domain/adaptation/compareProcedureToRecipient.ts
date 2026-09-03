import type {
  AccountState,
  AdaptationDifference,
  AdaptationMatch,
  AdaptationResult,
  Command,
  PortableCommand,
  ProcedureStep,
} from '../model'

export interface AdaptationOptions {
  materialPriceThresholdPercent?: number
}

function roundPercent(value: number): number {
  return Math.round(value * 100) / 100
}

export function compareProcedureToRecipient(
  procedure: { steps: Array<Pick<ProcedureStep, 'commandType' | 'input'>> },
  initial: AccountState,
  recipient: AccountState,
  options: AdaptationOptions = {},
): AdaptationResult {
  const threshold = options.materialPriceThresholdPercent ?? 25
  const matches: AdaptationMatch[] = []
  const safeActions: Command[] = []
  const skippedActions: Array<{ command: PortableCommand; reason: string }> = []
  const differences: AdaptationDifference[] = []
  let needsJudgment = false

  for (const step of procedure.steps) {
    if (step.commandType === 'set_preference') {
      const command = step.input as Extract<
        PortableCommand,
        { type: 'set_preference' }
      >
      if (recipient.preferences[command.key] === command.value) {
        matches.push({
          kind: 'preference_match',
          command,
          detail: `${command.key} already matches`,
        })
        continue
      }
      differences.push({
        kind: 'preference_difference',
        detail: `${command.key} differs from the demonstrated preference`,
      })
      safeActions.push(command)
      continue
    }

    if (step.commandType === 'review_recipient_details') {
      differences.push({
        kind: 'recipient_address_preserved',
        detail: 'Recipient address is current and was skipped',
      })
      differences.push({
        kind: 'recipient_dependents_preserved',
        detail: 'Recipient dependents were left alone',
      })
      skippedActions.push({
        command: step.input,
        reason: 'recipient_details_preserved',
      })
      skippedActions.push({
        command: step.input,
        reason: 'recipient_dependents_left_alone',
      })
      continue
    }

    if (step.commandType === 'preview_renewal') {
      skippedActions.push({
        command: step.input,
        reason: 'recipient_state_checked',
      })
      continue
    }

    if (
      step.commandType === 'create_confirmation' ||
      step.commandType === 'submit_renewal'
    ) {
      if (step.commandType === 'submit_renewal') {
        differences.push({
          kind: 'confirmation_required',
          detail: 'Recipient must confirm before renewal submission',
        })
      }
      skippedActions.push({
        command: step.input,
        reason: 'requires_user_confirmation',
      })
      continue
    }

    const demonstrated = step.input as Extract<
      PortableCommand,
      { type: 'select_plan' }
    >
    const portable: PortableCommand = {
      type: 'select_plan',
      planId: demonstrated.planId,
    }
    const recipientPlan = recipient.availablePlans.find(
      ({ id }) => id === demonstrated.planId,
    )
    if (!recipientPlan) {
      differences.push({
        kind: 'plan_unavailable',
        planId: demonstrated.planId,
        detail: 'The demonstrated plan is not available to this recipient',
      })
      skippedActions.push({ command: portable, reason: 'plan_unavailable' })
      needsJudgment = true
      continue
    }

    const initialPlan = initial.availablePlans.find(
      ({ id }) => id === demonstrated.planId,
    )
    const observedPrice =
      demonstrated.observedMonthlyPrice ?? initialPlan?.monthlyPrice
    if (observedPrice === 0 && recipientPlan.monthlyPrice > 0) {
      differences.push({
        kind: 'material_price_change',
        planId: demonstrated.planId,
        detail: `Plan price changed from zero to ${recipientPlan.monthlyPrice}`,
      })
      skippedActions.push({ command: portable, reason: 'judgment_required' })
      needsJudgment = true
      continue
    }
    if (observedPrice !== undefined && observedPrice > 0) {
      const percentChange = roundPercent(
        ((recipientPlan.monthlyPrice - observedPrice) / observedPrice) * 100,
      )
      if (Math.abs(percentChange) > threshold) {
        differences.push({
          kind: 'material_price_change',
          planId: demonstrated.planId,
          percentChange,
          detail: `Plan price changed by ${percentChange}%`,
        })
        skippedActions.push({ command: portable, reason: 'judgment_required' })
        needsJudgment = true
        continue
      }
    }

    if (recipient.selectedPlanId === demonstrated.planId) {
      matches.push({
        kind: 'plan_match',
        command: portable,
        detail: `${demonstrated.planId} is already selected`,
      })
      continue
    }
    differences.push({
      kind: 'plan_difference',
      planId: demonstrated.planId,
      detail: 'The selected plan differs from the demonstrated plan',
    })
    safeActions.push(portable)
  }

  return {
    matches,
    safeActions,
    skippedActions,
    differences,
    needsJudgment,
    confirmationRequired: true,
  }
}
