import { sileo } from 'sileo'

import { handoffRecipientName } from './handoffRecipient'
import {
  notificationPermission,
  notifyRecipientDecisionReady,
  notifySenderNeedsInput,
} from './browserNotifications'

type NeedsInputDetail = 'plan_unavailable' | 'material_price_change'

export function showNeedsInputToast(input: {
  requestId: string
  detail: NeedsInputDetail
  helpToken?: string
  recipient?: string
}) {
  const recipient = handoffRecipientName(input.recipient) || 'Your recipient'
  const title =
    input.detail === 'material_price_change'
      ? 'Regional pricing needs your input'
      : 'Plan choice needs your input'
  const description =
    input.detail === 'material_price_change'
      ? `${recipient} opened your handoff and regional pricing differs from what you demonstrated.`
      : `${recipient} cannot access the plan you demonstrated.`

  sileo.warning({
    title,
    description,
    duration: null,
    button: {
      title: 'Review',
      onClick: () => {
        window.location.assign(
          input.helpToken ? `/help/${input.helpToken}` : '/needs-input',
        )
      },
    },
  })

  if (notificationPermission() === 'granted') {
    notifySenderNeedsInput({
      requestId: input.requestId,
      detail: input.detail,
      helpToken: input.helpToken,
      recipientLabel: recipient,
    })
  }
}

export function showDecisionReadyToast(input: {
  requestId: string
  outcome: 'recommend_plan' | 'let_recipient_decide'
  planLabel?: string
  helperLabel?: string
}) {
  const helper = input.helperLabel ?? 'Your helper'
  const description =
    input.outcome === 'recommend_plan' && input.planLabel
      ? `${helper} recommended ${input.planLabel}.`
      : `${helper} sent guidance. Continue the renewal.`

  sileo.success({
    title: 'Decision ready on your handoff',
    description,
    duration: 8000,
  })

  if (notificationPermission() === 'granted') {
    notifyRecipientDecisionReady(input)
  }
}

export function showNotificationsEnabledToast() {
  sileo.success({
    title: 'Notifications enabled',
    description: 'ShowOnce will alert you here and in the browser when input is needed.',
    duration: 5000,
  })
}
