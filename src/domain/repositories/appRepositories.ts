import type {
  ActivityEvent,
  Handoff,
  HandoffStatus,
  HelperDecision,
  HelpRequest,
  Procedure,
} from '../model'
import {
  appendActivityServer,
  appendPublicActivityServer,
  completeRecipientHandoffServer,
  createRecipientConfirmationServer,
  createHandoffServer,
  createHelpRequestServer,
  createProcedureServer,
  deleteHandoffServer,
  deleteProcedureServer,
  ensureOwnerWorkspaceServer,
  getActivityServer,
  getDecisionServer,
  getHandoffServer,
  getHelpRequestServer,
  getProcedureServer,
  getPublicHandoffServer,
  getPublicHelpRequestServer,
  getSharedPersistenceMode,
  listActivityServer,
  listDecisionsServer,
  listHandoffsServer,
  listHelpRequestsServer,
  listProceduresServer,
  markHandoffOpenedServer,
  pollDecisionServer,
  recordDecisionServer,
  saveDecisionServer,
  saveHelpRequestServer,
  transitionHandoffServer,
} from '../../server/sharedServerFns'
import {
  createBrowserRepositories,
  createLocalDemoRepositories,
} from './browserRepositories'
import { DEMO_SEED } from './seed'
import { createLocalOnlySharedRepositories } from './sharedRepositories'
import type { SharedRepositories } from './sharedRepositories'
import {
  SupabaseActivityRepository,
  SupabaseDecisionRepository,
  SupabaseHandoffRepository,
  SupabaseHelpRequestRepository,
  SupabaseProcedureRepository,
} from './supabaseRepositories'
import type { SharedTransport } from './supabaseRepositories'
import type {
  PublicHandoff,
  PublicHelpRequest,
  ShowOnceRepositories,
} from './types'

const transport: SharedTransport = {
  createProcedure: (input) => createProcedureServer({ data: input }),
  listProcedures: () => listProceduresServer(),
  getProcedure: (input) => getProcedureServer({ data: input }),
  deleteProcedure: (input) => deleteProcedureServer({ data: input }),
  createHandoff: (input) => createHandoffServer({ data: input }),
  listHandoffs: () => listHandoffsServer(),
  getHandoff: (input) => getHandoffServer({ data: input }),
  deleteHandoff: (input) => deleteHandoffServer({ data: input }),
  getPublicHandoff: ({ publicToken }) =>
    getPublicHandoffServer({ data: { publicToken } }),
  markHandoffOpened: ({ publicToken }) =>
    markHandoffOpenedServer({ data: { publicToken } }),
  transitionHandoff: ({ publicToken, status }) =>
    transitionHandoffServer({ data: { publicToken, status } }),
  createConfirmation: ({ publicToken }) =>
    createRecipientConfirmationServer({ data: { publicToken } }),
  completeHandoff: ({ publicToken, confirmationToken }) =>
    completeRecipientHandoffServer({
      data: { publicToken, confirmationToken },
    }),
  saveHelpRequest: (input) => saveHelpRequestServer({ data: input }),
  createHelpRequest: ({ handoffToken, request }) =>
    createHelpRequestServer({ data: { handoffToken, request } }),
  listHelpRequests: () => listHelpRequestsServer(),
  getHelpRequest: (input) => getHelpRequestServer({ data: input }),
  getPublicHelpRequest: ({ publicToken }) =>
    getPublicHelpRequestServer({ data: { publicToken } }),
  saveDecision: (input) => saveDecisionServer({ data: input }),
  listDecisions: () => listDecisionsServer(),
  getDecision: (input) => getDecisionServer({ data: input }),
  recordDecision: ({ requestToken, decision }) =>
    recordDecisionServer({ data: { requestToken, decision } }),
  pollDecision: ({ requestToken }) =>
    pollDecisionServer({ data: { publicToken: requestToken } }),
  appendActivity: (input) => appendActivityServer({ data: input }),
  appendPublicActivity: ({ handoffToken, event }) =>
    appendPublicActivityServer({ data: { handoffToken, event } }),
  listActivity: () => listActivityServer(),
  getActivity: (input) => getActivityServer({ data: input }),
}

const testShared =
  import.meta.env.MODE === 'test'
    ? createLocalOnlySharedRepositories({ seed: DEMO_SEED })
    : undefined
const supabase: SharedRepositories = {
  procedures: new SupabaseProcedureRepository(transport),
  handoffs: new SupabaseHandoffRepository(transport),
  helpRequests: new SupabaseHelpRequestRepository(transport),
  decisions: new SupabaseDecisionRepository(transport),
  activity: new SupabaseActivityRepository(transport),
  mode: 'supabase',
}

let selected: Promise<SharedRepositories> | undefined =
  testShared ? Promise.resolve(testShared) : undefined

function createBrowserSharedRepositories(): SharedRepositories {
  const browser = createBrowserRepositories({ seed: DEMO_SEED })
  return {
    procedures: browser.procedures,
    handoffs: browser.handoffs,
    helpRequests: browser.helpRequests,
    decisions: browser.decisions,
    activity: browser.activity,
    mode: 'local-only',
  }
}

async function shared(): Promise<SharedRepositories> {
  if (selected) return selected
  const resolveShared = getSharedPersistenceMode().then(async (mode) => {
    if (mode === 'supabase') {
      await ensureOwnerWorkspaceServer()
      return supabase
    }
    if (import.meta.env.DEV) {
      return createBrowserSharedRepositories()
    }
    throw new Error(
      'Shared persistence is unavailable. Configure the server environment.',
    )
  })
  if (typeof window !== 'undefined') selected = resolveShared
  return resolveShared
}

const procedures = {
  list: async () => (await shared()).procedures.list(),
  get: async (id: string) => (await shared()).procedures.get(id),
  save: async (value: Procedure) => (await shared()).procedures.save(value),
  remove: async (id: string) => (await shared()).procedures.remove(id),
  replaceAll: async (values: Procedure[]) =>
    (await shared()).procedures.replaceAll(values),
  getByRecordingId: async (recordingId: string) =>
    (await shared()).procedures.getByRecordingId(recordingId),
}

const handoffs = {
  list: async () => (await shared()).handoffs.list(),
  get: async (id: string) => (await shared()).handoffs.get(id),
  save: async (value: Handoff) => (await shared()).handoffs.save(value),
  remove: async (id: string) => (await shared()).handoffs.remove(id),
  replaceAll: async (values: Handoff[]) =>
    (await shared()).handoffs.replaceAll(values),
  getByPublicToken: async (
    publicToken: string,
    now?: number,
  ): Promise<PublicHandoff | null> =>
    (await shared()).handoffs.getByPublicToken(publicToken, now),
  markOpened: async (
    publicToken: string,
    now?: number,
  ): Promise<PublicHandoff> =>
    (await shared()).handoffs.markOpened(publicToken, now),
  transitionByPublicToken: async (
    publicToken: string,
    status: HandoffStatus,
    now?: number,
  ): Promise<PublicHandoff> =>
    (await shared()).handoffs.transitionByPublicToken(publicToken, status, now),
  createConfirmation: async (publicToken: string, now?: number) =>
    (await shared()).handoffs.createConfirmation(publicToken, now),
  complete: async (
    publicToken: string,
    confirmationToken: string,
    now?: number,
  ) => (await shared()).handoffs.complete(publicToken, confirmationToken, now),
}

const helpRequests = {
  list: async () => (await shared()).helpRequests.list(),
  get: async (id: string) => (await shared()).helpRequests.get(id),
  save: async (value: HelpRequest) => (await shared()).helpRequests.save(value),
  remove: async (id: string) => (await shared()).helpRequests.remove(id),
  replaceAll: async (values: HelpRequest[]) =>
    (await shared()).helpRequests.replaceAll(values),
  getByPublicToken: async (
    publicToken: string,
    now?: number,
  ): Promise<PublicHelpRequest | null> =>
    (await shared()).helpRequests.getByPublicToken(publicToken, now),
  createForHandoffToken: async (
    handoffToken: string,
    request: HelpRequest,
    now?: number,
  ): Promise<void> =>
    (await shared()).helpRequests.createForHandoffToken(
      handoffToken,
      request,
      now,
    ),
}

const decisions = {
  list: async () => (await shared()).decisions.list(),
  get: async (id: string) => (await shared()).decisions.get(id),
  save: async (value: HelperDecision) => (await shared()).decisions.save(value),
  remove: async (id: string) => (await shared()).decisions.remove(id),
  replaceAll: async (values: HelperDecision[]) =>
    (await shared()).decisions.replaceAll(values),
  subscribe: (listener: (decision: HelperDecision) => void) => {
    let unsubscribe: () => void = () => undefined
    void shared().then((repositories) => {
      unsubscribe = repositories.decisions.subscribe(listener)
    })
    return () => unsubscribe()
  },
  pollByRequestToken: async (publicToken: string, now?: number) =>
    (await shared()).decisions.pollByRequestToken(publicToken, now),
  saveForRequestToken: async (
    publicToken: string,
    decision: HelperDecision,
    now?: number,
  ) =>
    (await shared()).decisions.saveForRequestToken(publicToken, decision, now),
}

const activity = {
  list: async () => (await shared()).activity.list(),
  get: async (id: string) => (await shared()).activity.get(id),
  save: async (value: ActivityEvent) => (await shared()).activity.save(value),
  remove: async (id: string) => (await shared()).activity.remove(id),
  replaceAll: async (values: ActivityEvent[]) =>
    (await shared()).activity.replaceAll(values),
  appendForHandoffToken: async (
    handoffToken: string,
    event: ActivityEvent,
  ) => (await shared()).activity.appendForHandoffToken(handoffToken, event),
}

const localDemo = createLocalDemoRepositories()

export const repositories: ShowOnceRepositories = {
  recordings: localDemo.recordings,
  accounts: localDemo.accounts,
  runs: localDemo.runs,
  procedures,
  handoffs,
  helpRequests,
  decisions,
  activity,
  dispose: localDemo.dispose,
}
