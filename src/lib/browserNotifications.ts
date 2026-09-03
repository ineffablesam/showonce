const PERMISSION_KEY = 'showonce:notifications-permission'

export type NotificationRequestResult = {
  permission: NotificationPermission | 'unsupported'
  changed: boolean
  /** True only when the browser may still show the native permission prompt. */
  canPrompt: boolean
}

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function notificationPermission(): NotificationPermission | 'unsupported' {
  if (!notificationsSupported()) return 'unsupported'
  return Notification.permission
}

function rememberPermission(result: NotificationPermission) {
  if (result === 'default') return
  window.localStorage.setItem(PERMISSION_KEY, result)
}

/** Call directly from a click handler so browsers allow the permission prompt. */
export function requestNotificationPermission(): Promise<NotificationRequestResult> {
  if (!notificationsSupported()) {
    return Promise.resolve({
      permission: 'unsupported',
      changed: false,
      canPrompt: false,
    })
  }

  const before = Notification.permission
  if (before === 'granted') {
    return Promise.resolve({
      permission: 'granted',
      changed: false,
      canPrompt: false,
    })
  }

  resetNotificationPermissionGate()

  return Notification.requestPermission().then((result) => {
    rememberPermission(result)
    return {
      permission: result,
      changed: result !== before,
      canPrompt: before === 'default',
    }
  })
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (!notificationsSupported()) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  if (window.localStorage.getItem(PERMISSION_KEY) === 'denied') return false

  const result = await requestNotificationPermission()
  return result.permission === 'granted'
}

export function resetNotificationPermissionGate(): void {
  window.localStorage.removeItem(PERMISSION_KEY)
}

type NotifyOptions = {
  body: string
  tag: string
  url?: string
}

export function showBrowserNotification(title: string, options: NotifyOptions) {
  if (!notificationsSupported() || Notification.permission !== 'granted') return

  const notification = new Notification(title, {
    body: options.body,
    tag: options.tag,
    icon: '/logo.svg',
  })

  if (options.url) {
    notification.onclick = () => {
      window.focus()
      window.location.assign(options.url as string)
      notification.close()
    }
  }
}

export function notifyNotificationsEnabled() {
  showBrowserNotification('Notifications enabled', {
    body: 'ShowOnce will alert you when a recipient needs your input.',
    tag: 'showonce-notifications-enabled',
  })
}

export function notifySenderNeedsInput(input: {
  requestId: string
  detail: 'plan_unavailable' | 'material_price_change'
  recipientLabel?: string
  helpToken?: string
}) {
  const recipient = input.recipientLabel ?? 'Your recipient'
  const title =
    input.detail === 'material_price_change'
      ? 'Regional pricing needs your input'
      : 'Plan choice needs your input'
  const body =
    input.detail === 'material_price_change'
      ? `${recipient} opened your handoff and regional pricing differs from what you demonstrated. Review in Needs input.`
      : `${recipient} cannot access the plan you demonstrated. Pick a recommendation in Needs input.`

  showBrowserNotification(title, {
    body,
    tag: `showonce-needs-input-${input.requestId}`,
    url: input.helpToken ? `/help/${input.helpToken}` : '/needs-input',
  })
}

export function notifyRecipientDecisionReady(input: {
  requestId: string
  outcome: 'recommend_plan' | 'let_recipient_decide'
  planLabel?: string
  helperLabel?: string
}) {
  const helper = input.helperLabel ?? 'Your helper'
  const body =
    input.outcome === 'recommend_plan' && input.planLabel
      ? `${helper} recommended ${input.planLabel}. Open ShowOnce to continue.`
      : `${helper} sent guidance. Open ShowOnce to continue the renewal.`

  showBrowserNotification('Decision ready on your handoff', {
    body,
    tag: `showonce-decision-${input.requestId}`,
  })
}

export function notificationBlockedHelp(): string {
  return 'Chrome will not re-prompt after a block. Click the tune icon or lock in the address bar → Site settings → Notifications → Allow, then refresh this page.'
}
