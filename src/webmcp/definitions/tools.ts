import type { ShowOnceToolDescriptor } from '../types'

const objectSchema = (
  properties: Record<string, object> = {},
  required: string[] = [],
) => ({
  type: 'object',
  additionalProperties: false,
  properties,
  ...(required.length > 0 ? { required } : {}),
})

export const SHOWONCE_TOOLS = [
  {
    name: 'showonce_get_handoff',
    title: 'Inspect a handoff',
    description:
      'Returns the active sanitized portable handoff for the current recipient page. Pass id only when inspecting from the library.',
    inputSchema: objectSchema({ id: { type: 'string' } }),
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    scopes: ['library', 'recipient'],
  },
  {
    name: 'benefits_get_account_state',
    title: 'Inspect recipient state',
    description: 'Returns the current connected recipient account state.',
    inputSchema: objectSchema(),
    annotations: { readOnlyHint: true },
    scopes: ['recipient'],
  },
  {
    name: 'benefits_get_current_plan',
    title: 'Get current plan',
    description: 'Returns the recipient current selected plan.',
    inputSchema: objectSchema(),
    annotations: { readOnlyHint: true },
    scopes: ['recipient'],
  },
  {
    name: 'benefits_get_available_plans',
    title: 'Get available plans',
    description: 'Lists plans actually available to this recipient.',
    inputSchema: objectSchema(),
    annotations: { readOnlyHint: true },
    scopes: ['recipient'],
  },
  {
    name: 'showonce_compare_to_handoff',
    title: 'Compare to handoff',
    description:
      'Compares the shared recording with this recipient account. When needsJudgment is true (price change or unavailable plan), stop before selecting a plan. Read agentGuidance in the result, explain the mismatch briefly, and ask the recipient "Should I ask [name]?" using the sender name from the conversation if they gave one. Wait for yes before calling showonce_request_helper.',
    inputSchema: objectSchema(),
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    scopes: ['recipient'],
  },
  {
    name: 'benefits_apply_safe_preferences',
    title: 'Apply safe preferences',
    description: 'Applies only safe preferences from the active handoff.',
    inputSchema: objectSchema(),
    annotations: { readOnlyHint: false },
    scopes: ['recipient'],
  },
  {
    name: 'benefits_set_renewal_period',
    title: 'Set renewal period',
    description:
      'Sets the recipient renewal frequency to monthly or annual. The connected WaitingRoom.gov page updates immediately.',
    inputSchema: objectSchema(
      { period: { type: 'string', enum: ['monthly', 'annual'] } },
      ['period'],
    ),
    annotations: { readOnlyHint: false },
    scopes: ['recipient'],
  },
  {
    name: 'benefits_set_paperless',
    title: 'Set paperless communication',
    description:
      'Turns paperless communication on or off. The connected WaitingRoom.gov page updates immediately.',
    inputSchema: objectSchema(
      { enabled: { type: 'boolean' } },
      ['enabled'],
    ),
    annotations: { readOnlyHint: false },
    scopes: ['recipient'],
  },
  {
    name: 'benefits_preview_renewal',
    title: 'Preview renewal',
    description: 'Runs a non-submitting renewal preview against current state.',
    inputSchema: objectSchema(),
    annotations: { readOnlyHint: false },
    scopes: ['recipient'],
  },
  {
    name: 'benefits_select_plan',
    title: 'Select a plan',
    description:
      'Selects the renewal plan for this recipient. Do not call when showonce_compare_to_handoff returned needsJudgment true until the recipient agreed to ask the sender and showonce_get_helper_decision returned a recommendation (or the recipient explicitly chose a plan themselves).',
    inputSchema: objectSchema({ planId: { type: 'string' } }, ['planId']),
    annotations: { readOnlyHint: false },
    scopes: ['recipient'],
  },
  {
    name: 'showonce_request_helper',
    title: 'Request helper decision',
    description:
      'Asks the person who recorded the procedure to decide when pricing or availability differs. Call only after the recipient agrees (for example, they said yes to "Should I ask Samuel?"). Then poll showonce_get_helper_decision before selecting a plan.',
    inputSchema: objectSchema(),
    annotations: { readOnlyHint: false },
    scopes: ['recipient'],
  },
  {
    name: 'showonce_get_helper_decision',
    title: 'Get helper decision',
    description:
      'Waits up to 2 minutes for the helper to respond, polling every 2 seconds. Returns their recommendation when ready. If still pending after waiting, call again to keep waiting — do not select a plan until a recommendation arrives.',
    inputSchema: objectSchema(),
    annotations: { readOnlyHint: true },
    scopes: ['recipient'],
  },
  {
    name: 'benefits_prepare_renewal',
    title: 'Prepare renewal for human approval',
    description:
      'Validates a plan is selected and opens the human approval dialog. This is the last step an agent can take — the recipient must personally approve and submit.',
    inputSchema: objectSchema(),
    annotations: { readOnlyHint: false },
    scopes: ['recipient'],
  },
  {
    name: 'showonce_request_human_approval',
    title: 'Request human approval',
    description:
      'Opens the ShowOnce approval dialog so the recipient can review and submit the prepared renewal. Call after selecting a plan and applying safe preferences.',
    inputSchema: objectSchema(),
    annotations: { readOnlyHint: false },
    scopes: ['recipient'],
  },
] as const satisfies readonly ShowOnceToolDescriptor[]
