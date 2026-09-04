import type {
  AccountState,
  AdaptationResult,
  Command,
  CommandResult,
  Handoff,
  HelperDecision,
  HelpRequest,
  Procedure,
  ProcedureStep,
} from '../domain/model'
import type { PublicHandoff } from '../domain/repositories/types'

export type WebMCPScope = 'library' | 'recipient' | 'helper'

export type ShowOnceToolName =
  | 'showonce_get_handoff'
  | 'benefits_get_account_state'
  | 'benefits_get_current_plan'
  | 'benefits_get_available_plans'
  | 'showonce_compare_to_handoff'
  | 'benefits_apply_safe_preferences'
  | 'benefits_set_renewal_period'
  | 'benefits_set_paperless'
  | 'benefits_preview_renewal'
  | 'benefits_select_plan'
  | 'showonce_request_helper'
  | 'showonce_get_helper_decision'
  | 'benefits_prepare_renewal'
  | 'showonce_request_human_approval'

export interface ShowOnceToolDescriptor
  extends Omit<WebMCP.ModelContextTool, 'execute'> {
  name: ShowOnceToolName
  scopes: readonly WebMCPScope[]
}

interface ReadRepository<T> {
  list: () => Promise<T[]>
  get: (id: string) => Promise<T | null>
}

export interface WebMCPRepositories {
  procedures: ReadRepository<Procedure>
  handoffs: ReadRepository<Handoff>
  activity: {
    append: (value: {
      id: string
      kind: 'webmcp_invocation'
      timestamp: number
      source: 'webmcp'
      toolName: string
      outcome: 'applied' | 'refused' | 'read' | 'aborted' | 'error'
    }) => Promise<void>
  }
  decisions: ReadRepository<HelperDecision> & {
    save: (value: HelperDecision) => Promise<void>
    pollByRequestToken: (
      publicToken: string,
    ) => Promise<HelperDecision | null>
  }
  helpRequests: ReadRepository<HelpRequest> & {
    save: (value: HelpRequest) => Promise<void>
  }
}

export interface WebMCPRegistrationContext {
  document?: Pick<Document, 'modelContext'>
  scope: WebMCPScope
  repositories: WebMCPRepositories
  execute: (command: Command) => CommandResult
  compare: (
    procedure: { steps: Array<Pick<ProcedureStep, 'commandType' | 'input'>> },
    initial: AccountState,
    recipient: AccountState,
  ) => AdaptationResult
  getRecipientState: () => AccountState
  getInitialState?: () => AccountState
  now?: () => number
  createId?: () => string
  getActiveHandoff?: () => PublicHandoff | Handoff | null
  requestHelper?: () => Promise<HelpRequest>
  getActiveHelpRequestId?: () => string | undefined
  onRequestHumanApproval?: () => void
  onToolStart?: (toolName: ShowOnceToolName) => void | Promise<void>
  onToolResult?: (toolName: ShowOnceToolName, result: unknown) => void
}

export interface WebMCPRegistration {
  available: boolean
  registeredToolNames: ShowOnceToolName[]
  dispose: () => void
}

export interface WebMCPRegistrationOptions {
  signal?: AbortSignal
}
