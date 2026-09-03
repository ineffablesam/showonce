import type {
  AccountState,
  ActivityEvent,
  Confirmation,
  Handoff,
  HandoffStatus,
  HelpRequest,
  HelperDecision,
  Procedure,
  ProcedureStep,
  RecipientWorkflowRun,
  RecordingSession,
} from '../model'

export interface Entity {
  id: string
}

export interface Repository<T extends Entity> {
  list: () => Promise<T[]>
  get: (id: string) => Promise<T | null>
  save: (value: T) => Promise<void>
  remove: (id: string) => Promise<void>
  replaceAll: (values: T[]) => Promise<void>
}

export interface DecisionRepository extends Repository<HelperDecision> {
  subscribe: (listener: (decision: HelperDecision) => void) => () => void
  pollByRequestToken: (
    publicToken: string,
    now?: number,
  ) => Promise<HelperDecision | null>
  saveForRequestToken: (
    publicToken: string,
    decision: HelperDecision,
    now?: number,
  ) => Promise<void>
}

export type PublicProcedureStep = Pick<
  ProcedureStep,
  'commandType' | 'policy' | 'input'
>

export interface PublicProcedure {
  title: string
  steps: PublicProcedureStep[]
}

export type PublicHandoff = Pick<
  Handoff,
  'title' | 'createdAt' | 'expiresAt' | 'status' | 'policy' | 'recipient'
> & {
  publicToken: string
  procedure: PublicProcedure
  policy: NonNullable<Handoff['policy']>
}

export type PublicHelpRequest = Pick<
  HelpRequest,
  'status' | 'detail' | 'options'
> & {
  publicToken: string
  expiresAt: number
}

export interface ProcedureRepository extends Repository<Procedure> {
  getByRecordingId: (recordingId: string) => Promise<Procedure | null>
}

export interface HandoffRepository extends Repository<Handoff> {
  getByPublicToken: (
    publicToken: string,
    now?: number,
  ) => Promise<PublicHandoff | null>
  markOpened: (publicToken: string, now?: number) => Promise<PublicHandoff>
  createConfirmation: (
    publicToken: string,
    now?: number,
  ) => Promise<Confirmation>
  complete: (
    publicToken: string,
    confirmationToken: string,
    now?: number,
  ) => Promise<PublicHandoff>
  transitionByPublicToken: (
    publicToken: string,
    status: HandoffStatus,
    now?: number,
  ) => Promise<PublicHandoff>
}

export interface HelpRequestRepository extends Repository<HelpRequest> {
  getByPublicToken: (
    publicToken: string,
    now?: number,
  ) => Promise<PublicHelpRequest | null>
  createForHandoffToken: (
    handoffToken: string,
    request: HelpRequest,
    now?: number,
  ) => Promise<void>
}

export interface ActivityRepository extends Repository<ActivityEvent> {
  appendForHandoffToken: (
    handoffToken: string,
    event: ActivityEvent,
  ) => Promise<void>
}

export interface ShowOnceRepositories {
  recordings: Repository<RecordingSession>
  procedures: ProcedureRepository
  handoffs: HandoffRepository
  activity: ActivityRepository
  decisions: DecisionRepository
  accounts: Repository<AccountState>
  helpRequests: HelpRequestRepository
  runs: Repository<RecipientWorkflowRun>
  dispose: () => void
}

export interface RepositorySeed {
  recordings?: RecordingSession[]
  procedures: Procedure[]
  handoffs: Handoff[]
  activity: ActivityEvent[]
  decisions: HelperDecision[]
  accounts?: AccountState[]
  helpRequests?: HelpRequest[]
  runs?: RecipientWorkflowRun[]
}

export interface DecisionChannel {
  postMessage: (value: HelperDecision) => void
  close: () => void
  onmessage: ((event: MessageEvent<HelperDecision>) => void) | null
}
