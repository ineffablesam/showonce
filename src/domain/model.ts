export type CommandSource = 'human' | 'webmcp'

export type TransferPolicy =
  | 'safe_preference'
  | 'recipient_specific'
  | 'state_check'
  | 'availability_checked'
  | 'confirmation_required'
  | 'judgment_required'

export interface Plan {
  id: string
  name: string
  monthlyPrice: number
}

export type HelperPlanId = 'silver' | 'platinum'
export type HelperChoice = HelperPlanId | 'let_recipient_decide'

export interface Preferences {
  paperless: boolean
  communication: 'email' | 'mail'
  renewalFrequency?: 'annual' | 'monthly'
}

export interface AccountState {
  id: string
  availablePlans: Plan[]
  selectedPlanId: string | null
  preferences: Preferences
  address: string
  dependents: string[]
  submittedAt: number | null
}

interface PotentiallySensitiveInput {
  password?: string
  sessionToken?: string
  selector?: string
  coordinates?: unknown
  screenshot?: string
  recipientAddress?: string
}

export type SetPreferenceCommand = PotentiallySensitiveInput &
  (
    | { type: 'set_preference'; key: 'paperless'; value: boolean }
    | {
        type: 'set_preference'
        key: 'communication'
        value: Preferences['communication']
      }
    | {
        type: 'set_preference'
        key: 'renewalFrequency'
        value: NonNullable<Preferences['renewalFrequency']>
      }
  )

export type SelectPlanCommand = PotentiallySensitiveInput & {
  type: 'select_plan'
  planId: string
}

export type DecisionOutcome =
  | 'choose_demonstrated'
  | 'choose_alternative'
  | 'recommend_plan'
  | 'let_recipient_decide'
  | 'cancel'

export type Command =
  | SetPreferenceCommand
  | SelectPlanCommand
  | (PotentiallySensitiveInput & { type: 'set_address'; address: string })
  | (PotentiallySensitiveInput & { type: 'add_dependent'; name: string })
  | (PotentiallySensitiveInput & { type: 'review_recipient_details' })
  | (PotentiallySensitiveInput & { type: 'preview_renewal' })
  | (PotentiallySensitiveInput & { type: 'create_confirmation' })
  // Human-only: a personal, identity-bearing attestation. WebMCP/agents can
  // never issue this command — see executeCommand's source guard — so it
  // can only ever appear in the activity log as a genuine human action.
  | (PotentiallySensitiveInput & { type: 'recipient_attestation' })
  | (PotentiallySensitiveInput & {
      type: 'submit_renewal'
      confirmationToken: string
    })
  | (PotentiallySensitiveInput & {
      type: 'record_decision'
      requestId: string
      outcome: DecisionOutcome
      recommendedPlanId?: HelperPlanId
    })

export type PortableCommand =
  | { type: 'set_preference'; key: 'paperless'; value: boolean }
  | {
      type: 'set_preference'
      key: 'communication'
      value: Preferences['communication']
    }
  | {
      type: 'set_preference'
      key: 'renewalFrequency'
      value: NonNullable<Preferences['renewalFrequency']>
    }
  | (Omit<SelectPlanCommand, keyof PotentiallySensitiveInput> & {
      observedMonthlyPrice?: number
    })
  | { type: 'review_recipient_details' }
  | { type: 'preview_renewal' }
  | { type: 'create_confirmation' }
  | { type: 'submit_renewal' }

export interface Confirmation {
  token: string
  createdAt: number
  expiresAt: number
}

export interface SemanticEvent {
  id: string
  commandType: Command['type']
  source: CommandSource
  timestamp: number
  policy: TransferPolicy
  status: 'applied' | 'refused'
  input: Record<string, unknown>
}

export interface CommandContext {
  state: AccountState
  source: CommandSource
  now: number
  createId: () => string
  createToken?: () => string
  confirmation?: Confirmation
  planSelectionGuard?: {
    demonstratedPlanId: string
    demonstratedPrice?: number
    requiresJudgment: boolean
  }
  planAuthorization?: {
    planId: string
    authorizedBy: 'human' | 'helper'
  }
}

export interface CommandResult {
  ok: boolean
  state: AccountState
  event: SemanticEvent
  reason?:
    | 'plan_unavailable'
    | 'confirmation_required'
    | 'confirmation_invalid'
    | 'confirmation_expired'
    | 'already_submitted'
    | 'plan_required'
    | 'invalid_command'
    | 'judgment_required'
    | 'requires_user_confirmation'
  confirmation?: Confirmation
  decision?: HelperDecision
}

export interface Recording {
  id: string
  title: string
  createdAt: number
}

export interface RecordingSession extends Recording {
  status: 'capturing' | 'finished'
  events: SemanticEvent[]
  description?: string
  targetApp?: 'nexa-benefits'
}

export interface ProcedureStep {
  id: string
  commandType: PortableCommand['type']
  policy:
    | 'safe_preference'
    | 'availability_checked'
    | 'recipient_specific'
    | 'state_check'
    | 'confirmation_required'
  input: PortableCommand
}

export interface Procedure {
  id: string
  recordingId: string
  title: string
  createdAt: number
  sourceEventIds: string[]
  steps: ProcedureStep[]
}

export type HandoffStatus =
  | 'created'
  | 'opened'
  | 'running'
  | 'needs_input'
  | 'waiting_confirmation'
  | 'completed'
  | 'expired'

export interface Handoff {
  id: string
  publicToken?: string
  procedureId: string
  title: string
  createdAt: number
  updatedAt?: number
  status?: HandoffStatus
  procedure?: Procedure
  recipient?: string
  note?: string
  expiresAt?: number
  policy?: {
    allowSafePreferences: boolean
    requireConfirmation: boolean
    allowHelperEscalation: boolean
  }
}

export interface ActivityEvent {
  id: string
  kind: 'command' | 'webmcp_invocation'
  timestamp: number
  source: CommandSource | 'system'
  toolName?: string
  commandType?: Command['type']
  policy?: TransferPolicy
  outcome?: 'applied' | 'refused' | 'read' | 'aborted' | 'error'
}

export interface HelperDecision {
  id: string
  requestId: string
  outcome: DecisionOutcome
  decidedAt: number
  recommendedPlanId?: HelperPlanId
}

export interface HelpRequest {
  id: string
  publicToken?: string
  handoffId: string
  createdAt: number
  updatedAt?: number
  expiresAt?: number
  status: 'open' | 'resolved'
  detail: 'plan_unavailable'
  options?: HelperChoice[]
}

export interface RecipientWorkflowRun {
  id: string
  handoffId: string
  scenario: 'normal' | 'unavailable'
  accountId: string
  // 'confirmation' is the single AWAITING HUMAN APPROVAL phase: an agent may
  // read state, adapt safe preferences, and prepare the renewal, but only
  // one deliberate human action (attest + submit, atomically) moves a run
  // from 'confirmation' straight to 'complete' — there is no separate
  // "confirmed, ready to submit" phase to round-trip through.
  phase:
    | 'explain'
    | 'adapted'
    | 'awaiting_helper'
    | 'helper_resolved'
    | 'confirmation'
    | 'complete'
  createdAt: number
  updatedAt: number
  helperRequestId?: string
  selectedPlanId?: string
  lastOutcome?: string
}

export interface AdaptationDifference {
  kind:
    | 'preference_difference'
    | 'plan_difference'
    | 'plan_unavailable'
    | 'material_price_change'
    | 'recipient_address_preserved'
    | 'recipient_dependents_preserved'
    | 'confirmation_required'
  planId?: string
  percentChange?: number
  detail: string
}

export interface AdaptationMatch {
  kind: 'preference_match' | 'plan_match'
  command: PortableCommand
  detail: string
}

export interface AdaptationResult {
  matches: AdaptationMatch[]
  safeActions: Command[]
  skippedActions: Array<{ command: PortableCommand; reason: string }>
  differences: AdaptationDifference[]
  needsJudgment: boolean
  confirmationRequired: true
}
