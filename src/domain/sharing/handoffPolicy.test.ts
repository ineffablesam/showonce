import { describe, expect, it } from 'vitest'

import type { Handoff } from '../model'
import { assertHandoffPolicyAllows } from './handoffPolicy'

const policy: NonNullable<Handoff['policy']> = {
  allowSafePreferences: false,
  requireConfirmation: true,
  allowHelperEscalation: false,
}

describe('handoff policy enforcement', () => {
  it('denies safe preferences and helper escalation independently', () => {
    expect(() =>
      assertHandoffPolicyAllows(policy, 'apply_safe_preferences'),
    ).toThrow('Safe preference application is disabled')
    expect(() =>
      assertHandoffPolicyAllows(policy, 'request_helper'),
    ).toThrow('Helper escalation is disabled')
  })

  it('requires configured confirmation while preserving platform minimums', () => {
    expect(() =>
      assertHandoffPolicyAllows(policy, 'submit_without_confirmation'),
    ).toThrow('Human confirmation is required')
    expect(() =>
      assertHandoffPolicyAllows(
        { ...policy, requireConfirmation: false },
        'submit_without_confirmation',
      ),
    ).toThrow('Platform safety requires human confirmation')
  })
})
