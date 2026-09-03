import type { Handoff } from '../model'

export type HandoffPolicyAction =
  | 'apply_safe_preferences'
  | 'request_helper'
  | 'submit_without_confirmation'

export function assertHandoffPolicyAllows(
  policy: NonNullable<Handoff['policy']>,
  action: HandoffPolicyAction,
): void {
  if (action === 'apply_safe_preferences' && !policy.allowSafePreferences) {
    throw new Error('Safe preference application is disabled by this handoff')
  }
  if (action === 'request_helper' && !policy.allowHelperEscalation) {
    throw new Error('Helper escalation is disabled by this handoff')
  }
  if (action === 'submit_without_confirmation') {
    if (policy.requireConfirmation) {
      throw new Error('Human confirmation is required by this handoff')
    }
    throw new Error('Platform safety requires human confirmation')
  }
}
