import type {
  ActivityEvent,
  Handoff,
  HelperDecision,
  HelpRequest,
  Procedure,
} from '../model'
import type {
  PublicHandoff,
  PublicHelpRequest,
} from '../repositories/types'
import { isPublicToken } from './publicCapabilities'

const MAX_JSON_BYTES = 64 * 1024
const MAX_TITLE = 120
const MAX_NOTE = 500
const MAX_RECIPIENT_NAME = 80
const SENSITIVE_KEY =
  /password|authorization|credential|session|payment|card|cookie|secret|authToken/iu

function assertRecord(value: unknown, label: string): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`)
  }
  return value as Record<string, unknown>
}

function assertExactKeys(
  record: Record<string, unknown>,
  allowed: readonly string[],
  label: string,
): void {
  const unexpected = Object.keys(record).find((key) => !allowed.includes(key))
  if (unexpected) {
    if (SENSITIVE_KEY.test(unexpected)) {
      throw new Error(`${label} contains a sensitive field: ${unexpected}`)
    }
    throw new Error(`${label} contains an unsupported field: ${unexpected}`)
  }
}

function assertString(
  value: unknown,
  label: string,
  maximum: number,
): asserts value is string {
  if (
    typeof value !== 'string' ||
    value.trim().length === 0 ||
    value.length > maximum
  ) {
    throw new Error(`${label} is invalid or exceeds ${maximum} characters`)
  }
}

function assertFiniteNumber(
  value: unknown,
  label: string,
): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number`)
  }
}

function assertSafeJson(value: unknown, label: string): void {
  const seen = new WeakSet<object>()
  const visit = (candidate: unknown): void => {
    if (candidate === null || typeof candidate !== 'object') return
    if (seen.has(candidate)) throw new Error(`${label} must not be cyclic`)
    seen.add(candidate)
    if (Array.isArray(candidate)) {
      for (const item of candidate) visit(item)
      return
    }
    for (const [key, nested] of Object.entries(candidate)) {
      if (SENSITIVE_KEY.test(key)) {
        throw new Error(`${label} contains a sensitive field: ${key}`)
      }
      visit(nested)
    }
  }
  visit(value)
  const json = JSON.stringify(value)
  if (new TextEncoder().encode(json).byteLength > MAX_JSON_BYTES) {
    throw new Error(`${label} exceeds ${MAX_JSON_BYTES} bytes`)
  }
}

function validateProcedureStep(value: unknown): void {
  const step = assertRecord(value, 'Procedure step')
  assertExactKeys(step, ['id', 'commandType', 'policy', 'input'], 'Procedure step')
  assertString(step.id, 'Procedure step id', 128)
  const input = assertRecord(step.input, 'Procedure step input')
  const allowedCommands = [
    'set_preference',
    'select_plan',
    'review_recipient_details',
    'preview_renewal',
    'create_confirmation',
    'submit_renewal',
  ]
  if (
    !allowedCommands.includes(String(step.commandType)) ||
    input.type !== step.commandType
  ) {
    throw new Error('Procedure step command is invalid')
  }
  const inputKeys =
    step.commandType === 'set_preference'
      ? ['type', 'key', 'value']
      : step.commandType === 'select_plan'
        ? ['type', 'planId', 'observedMonthlyPrice']
        : ['type']
  assertExactKeys(input, inputKeys, 'Procedure step input')
  const expectedPolicy = {
    set_preference: 'safe_preference',
    select_plan: 'availability_checked',
    review_recipient_details: 'recipient_specific',
    preview_renewal: 'state_check',
    create_confirmation: 'confirmation_required',
    submit_renewal: 'confirmation_required',
  }[String(step.commandType)]
  if (step.policy !== expectedPolicy) {
    throw new Error('Procedure step policy does not match its command')
  }
  if (
    (step.commandType === 'set_preference' &&
      !['paperless', 'communication', 'renewalFrequency'].includes(
        String(input.key),
      )) ||
    (step.commandType === 'select_plan' &&
      (typeof input.planId !== 'string' ||
        input.planId.length === 0 ||
        input.planId.length > 64))
  ) {
    throw new Error('Procedure step input is invalid')
  }
  if (
    step.commandType === 'set_preference' &&
    ((input.key === 'paperless' && typeof input.value !== 'boolean') ||
      (input.key === 'communication' &&
        input.value !== 'email' &&
        input.value !== 'mail') ||
      (input.key === 'renewalFrequency' &&
        input.value !== 'monthly' &&
        input.value !== 'annual'))
  ) {
    throw new Error('Procedure step preference value is invalid')
  }
  if (
    step.commandType === 'select_plan' &&
    input.observedMonthlyPrice !== undefined &&
    (typeof input.observedMonthlyPrice !== 'number' ||
      !Number.isFinite(input.observedMonthlyPrice) ||
      input.observedMonthlyPrice < 0)
  ) {
    throw new Error('Procedure step observed price is invalid')
  }
}

export function assertPublicToken(value: string): void {
  if (!isPublicToken(value)) {
    throw new Error('Invalid public token; expected 24 base64url characters')
  }
}

export function validateProcedure(value: Procedure): Procedure {
  const record = assertRecord(value, 'Procedure')
  assertExactKeys(
    record,
    ['id', 'recordingId', 'title', 'createdAt', 'sourceEventIds', 'steps'],
    'Procedure',
  )
  assertString(record.id, 'Procedure id', 128)
  assertString(record.recordingId, 'Recording id', 128)
  assertString(record.title, 'Procedure title', MAX_TITLE)
  assertFiniteNumber(record.createdAt, 'Procedure createdAt')
  if (!Array.isArray(record.sourceEventIds) || !Array.isArray(record.steps)) {
    throw new Error('Procedure arrays are invalid')
  }
  if (record.steps.length > 100 || record.sourceEventIds.length > 100) {
    throw new Error('Procedure contains too many steps or source events')
  }
  for (const step of record.steps) validateProcedureStep(step)
  assertSafeJson(record, 'Procedure')
  return structuredClone(value)
}

export function validateHandoff(value: Handoff): Handoff {
  const record = assertRecord(value, 'Handoff')
  assertExactKeys(
    record,
    [
      'id',
      'publicToken',
      'procedureId',
      'title',
      'createdAt',
      'updatedAt',
      'status',
      'procedure',
      'recipient',
      'note',
      'expiresAt',
      'policy',
    ],
    'Handoff',
  )
  assertString(record.id, 'Handoff id', 128)
  assertString(record.procedureId, 'Procedure id', 128)
  assertString(record.title, 'Handoff title', MAX_TITLE)
  if (typeof record.publicToken !== 'string') {
    throw new Error('Handoff public token is required')
  }
  assertPublicToken(record.publicToken)
  if (record.note !== undefined) {
    assertString(record.note, 'Handoff note', MAX_NOTE)
  }
  if (record.recipient !== undefined && record.recipient !== null) {
    assertString(record.recipient, 'Handoff recipient', MAX_RECIPIENT_NAME)
  }
  if (record.procedure !== undefined) {
    validateProcedure(record.procedure as Procedure)
  }
  if (record.policy !== undefined) {
    const policy = assertRecord(record.policy, 'Handoff policy')
    assertExactKeys(
      policy,
      [
        'allowSafePreferences',
        'requireConfirmation',
        'allowHelperEscalation',
      ],
      'Handoff policy',
    )
    if (Object.values(policy).some((setting) => typeof setting !== 'boolean')) {
      throw new Error('Handoff policy is invalid')
    }
  }
  assertFiniteNumber(record.createdAt, 'Handoff createdAt')
  assertFiniteNumber(record.expiresAt, 'Handoff expiresAt')
  if (record.expiresAt <= record.createdAt) {
    throw new Error('Handoff expiry must follow creation')
  }
  if (record.status !== 'created') {
    throw new Error('New handoff status must be created')
  }
  assertSafeJson(record, 'Handoff')
  return structuredClone(value)
}

const helperRequestOptionsByDetail = {
  plan_unavailable: ['silver', 'platinum', 'let_recipient_decide'],
  material_price_change: ['gold', 'silver', 'let_recipient_decide'],
} as const

function assertHelpRequestDetailAndOptions(
  detail: unknown,
  options: unknown,
  label: string,
): void {
  if (
    detail !== 'plan_unavailable' &&
    detail !== 'material_price_change'
  ) {
    throw new Error(`${label} detail is invalid`)
  }
  if (
    !Array.isArray(options) ||
    options.length === 0 ||
    options.length > 3
  ) {
    throw new Error(`${label} DTO is invalid`)
  }
  const allowed = helperRequestOptionsByDetail[detail]
  if (
    !options.every((option) =>
      allowed.includes(String(option) as (typeof allowed)[number]),
    )
  ) {
    throw new Error(`${label} option is invalid`)
  }
}

export function validateHelpRequest(value: HelpRequest): HelpRequest {
  const record = assertRecord(value, 'Helper request')
  assertExactKeys(
    record,
    [
      'id',
      'publicToken',
      'handoffId',
      'createdAt',
      'updatedAt',
      'expiresAt',
      'status',
      'detail',
      'options',
    ],
    'Helper request',
  )
  assertString(record.id, 'Helper request id', 128)
  if (typeof record.publicToken !== 'string') {
    throw new Error('Helper request public token is required')
  }
  assertPublicToken(record.publicToken)
  assertFiniteNumber(record.createdAt, 'Helper request createdAt')
  assertFiniteNumber(record.updatedAt, 'Helper request updatedAt')
  assertFiniteNumber(record.expiresAt, 'Helper request expiresAt')
  if (record.expiresAt <= record.createdAt) {
    throw new Error('Helper request expiry must follow creation')
  }
  if (record.status !== 'open' && record.status !== 'resolved') {
    throw new Error('Helper request DTO is invalid')
  }
  assertHelpRequestDetailAndOptions(record.detail, record.options, 'Helper request')
  assertSafeJson(record, 'Helper request')
  return structuredClone(value)
}

export function validateDecision(value: HelperDecision): HelperDecision {
  const record = assertRecord(value, 'Helper decision')
  assertExactKeys(
    record,
    ['id', 'requestId', 'outcome', 'decidedAt', 'recommendedPlanId'],
    'Helper decision',
  )
  assertString(record.id, 'Helper decision id', 128)
  assertFiniteNumber(record.decidedAt, 'Helper decision decidedAt')
  if (
    record.outcome !== 'recommend_plan' &&
    record.outcome !== 'let_recipient_decide'
  ) {
    throw new Error('Helper decision outcome is invalid')
  }
  if (
    record.outcome === 'recommend_plan' &&
    record.recommendedPlanId !== 'silver' &&
    record.recommendedPlanId !== 'gold' &&
    record.recommendedPlanId !== 'platinum'
  ) {
    throw new Error('Helper decision recommendation is invalid')
  }
  if (
    record.outcome === 'let_recipient_decide' &&
    record.recommendedPlanId !== undefined
  ) {
    throw new Error('Helper decision recommendation must be omitted')
  }
  assertSafeJson(record, 'Helper decision')
  return structuredClone(value)
}

export function validateActivity(value: ActivityEvent): ActivityEvent {
  const record = assertRecord(value, 'Activity event')
  assertExactKeys(
    record,
    [
      'id',
      'kind',
      'timestamp',
      'source',
      'toolName',
      'commandType',
      'policy',
      'outcome',
    ],
    'Activity event',
  )
  assertString(record.id, 'Activity id', 128)
  assertFiniteNumber(record.timestamp, 'Activity timestamp')
  const commandTypes = [
    'set_preference',
    'select_plan',
    'set_address',
    'add_dependent',
    'review_recipient_details',
    'preview_renewal',
    'create_confirmation',
    'recipient_attestation',
    'submit_renewal',
    'record_decision',
  ]
  const policies = [
    'safe_preference',
    'availability_checked',
    'never_transfer',
    'recipient_specific',
    'state_check',
    'confirmation_required',
    'human_judgment',
  ]
  const outcomes = ['applied', 'refused', 'read', 'aborted', 'error']
  const toolNames = [
    'showonce_get_handoff',
    'benefits_get_account_state',
    'benefits_get_current_plan',
    'benefits_get_available_plans',
    'showonce_compare_to_handoff',
    'benefits_apply_safe_preferences',
    'benefits_set_renewal_period',
    'benefits_set_paperless',
    'benefits_preview_renewal',
    'benefits_select_plan',
    'showonce_request_helper',
    'showonce_get_helper_decision',
    'benefits_prepare_renewal',
    'showonce_request_human_approval',
  ]
  if (
    !['command', 'webmcp_invocation'].includes(String(record.kind)) ||
    !['human', 'webmcp', 'system'].includes(String(record.source)) ||
    (record.commandType !== undefined &&
      !commandTypes.includes(String(record.commandType))) ||
    (record.policy !== undefined && !policies.includes(String(record.policy))) ||
    (record.outcome !== undefined && !outcomes.includes(String(record.outcome)))
    || (record.toolName !== undefined &&
      !toolNames.includes(String(record.toolName)))
  ) {
    throw new Error('Activity enum is invalid')
  }
  if (
    (record.kind === 'webmcp_invocation' &&
      (record.source !== 'webmcp' ||
        typeof record.toolName !== 'string' ||
        record.commandType !== undefined ||
        record.policy !== undefined)) ||
    (record.kind === 'command' &&
      (typeof record.commandType !== 'string' ||
        typeof record.policy !== 'string' ||
        record.toolName !== undefined))
  ) {
    throw new Error('Activity discriminated schema is invalid')
  }
  assertSafeJson(record, 'Activity event')
  return structuredClone(value)
}

export function validatePublicHandoff(value: unknown): PublicHandoff {
  const record = assertRecord(value, 'Public handoff')
  assertExactKeys(
    record,
    [
      'publicToken',
      'title',
      'createdAt',
      'expiresAt',
      'status',
      'procedure',
      'policy',
      'recipient',
    ],
    'Public handoff',
  )
  if (typeof record.publicToken !== 'string') {
    throw new Error('Public handoff token is missing')
  }
  assertPublicToken(record.publicToken)
  assertString(record.title, 'Handoff title', MAX_TITLE)
  if (record.recipient !== undefined && record.recipient !== null) {
    assertString(record.recipient, 'Handoff recipient', MAX_RECIPIENT_NAME)
  }
  assertFiniteNumber(record.createdAt, 'Handoff createdAt')
  assertFiniteNumber(record.expiresAt, 'Handoff expiresAt')
  if (
    ![
      'created',
      'opened',
      'running',
      'needs_input',
      'waiting_confirmation',
      'completed',
      'expired',
    ].includes(String(record.status))
  ) {
    throw new Error('Public handoff status is invalid')
  }
  if (record.procedure === undefined || record.policy === undefined) {
    throw new Error('Public handoff procedure is missing')
  }
  const procedure = assertRecord(record.procedure, 'Public procedure')
  assertExactKeys(procedure, ['title', 'steps'], 'Public procedure')
  assertString(procedure.title, 'Public procedure title', MAX_TITLE)
  if (!Array.isArray(procedure.steps) || procedure.steps.length > 100) {
    throw new Error('Public procedure steps are invalid')
  }
  for (const [index, stepValue] of procedure.steps.entries()) {
    const step = assertRecord(stepValue, 'Public procedure step')
    assertExactKeys(
      step,
      ['commandType', 'policy', 'input'],
      'Public procedure step',
    )
    validateProcedureStep({ ...step, id: `public-${index}` })
  }
  const policy = assertRecord(record.policy, 'Public handoff policy')
  assertExactKeys(
    policy,
    [
      'allowSafePreferences',
      'requireConfirmation',
      'allowHelperEscalation',
    ],
    'Public handoff policy',
  )
  if (Object.values(policy).some((setting) => typeof setting !== 'boolean')) {
    throw new Error('Public handoff policy is invalid')
  }
  assertSafeJson(record, 'Public handoff')
  return structuredClone(record) as unknown as PublicHandoff
}

export function validatePublicHelpRequest(
  value: unknown,
): PublicHelpRequest {
  const record = assertRecord(value, 'Public helper request')
  assertExactKeys(
    record,
    ['publicToken', 'expiresAt', 'status', 'detail', 'options'],
    'Public helper request',
  )
  if (typeof record.publicToken !== 'string') {
    throw new Error('Public helper request token is missing')
  }
  assertPublicToken(record.publicToken)
  assertFiniteNumber(record.expiresAt, 'Helper request expiresAt')
  if (record.status !== 'open' && record.status !== 'resolved') {
    throw new Error('Public helper request DTO is invalid')
  }
  assertHelpRequestDetailAndOptions(
    record.detail,
    record.options,
    'Public helper request',
  )
  assertSafeJson(record, 'Public helper request')
  return structuredClone(record) as unknown as PublicHelpRequest
}
