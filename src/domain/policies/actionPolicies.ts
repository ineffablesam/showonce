import type { Command, TransferPolicy } from '../model'

export const ACTION_POLICIES = {
  set_preference: 'safe_preference',
  set_address: 'recipient_specific',
  add_dependent: 'recipient_specific',
  review_recipient_details: 'recipient_specific',
  preview_renewal: 'state_check',
  select_plan: 'availability_checked',
  create_confirmation: 'confirmation_required',
  recipient_attestation: 'confirmation_required',
  submit_renewal: 'confirmation_required',
  record_decision: 'judgment_required',
} as const satisfies Record<Command['type'], TransferPolicy>

export function policyForCommand(command: Command): TransferPolicy {
  return ACTION_POLICIES[command.type]
}

export function isPortablePolicy(
  policy: TransferPolicy,
): policy is Exclude<TransferPolicy, 'judgment_required'> {
  return policy !== 'judgment_required'
}
