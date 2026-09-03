import type {
  ActivityEvent,
  Confirmation,
  Handoff,
  HandoffStatus,
  HelperDecision,
  HelpRequest,
  Procedure,
} from '../model'
import {
  assertHandoffTransition,
  generatePublicToken,
  isExpired,
} from '../sharing/publicCapabilities'
import {
  assertPublicToken,
  validateActivity,
  validateDecision,
  validateHandoff,
  validateHelpRequest,
  validateProcedure,
} from '../sharing/validation'
import type {
  DecisionRepository,
  ActivityRepository,
  HandoffRepository,
  HelpRequestRepository,
  PublicHandoff,
  PublicHelpRequest,
  ProcedureRepository,
  Repository,
  RepositorySeed,
} from './types'

type SharedEntity =
  | Procedure
  | Handoff
  | HelpRequest
  | HelperDecision
  | ActivityEvent

export type SharedPersistenceMode = 'supabase' | 'local-only'

export interface SharedRepositories {
  procedures: ProcedureRepository
  handoffs: HandoffRepository
  helpRequests: HelpRequestRepository
  decisions: DecisionRepository
  activity: ActivityRepository
  mode: SharedPersistenceMode
}

export interface SharedEnvironment {
  SUPABASE_URL?: string
  SUPABASE_ANON_KEY?: string
}

export function selectSharedPersistence(
  environment: SharedEnvironment,
  nodeEnv: string,
): SharedPersistenceMode {
  if (environment.SUPABASE_URL && environment.SUPABASE_ANON_KEY) {
    return 'supabase'
  }
  void nodeEnv
  throw new Error(
    'Shared persistence is unavailable. Configure the server environment.',
  )
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

class LocalOnlyRepository<T extends SharedEntity> implements Repository<T> {
  constructor(
    protected readonly sharedState: Map<string, unknown>,
    protected readonly namespace: string,
  ) {}

  async list(): Promise<T[]> {
    return clone(this.values())
  }

  async get(id: string): Promise<T | null> {
    return clone(this.values().find((value) => value.id === id) ?? null)
  }

  async save(value: T): Promise<void> {
    const values = this.values()
    const index = values.findIndex((candidate) => candidate.id === value.id)
    if (index === -1) values.push(clone(value))
    else values[index] = clone(value)
    this.sharedState.set(this.namespace, values)
  }

  async remove(id: string): Promise<void> {
    this.sharedState.set(
      this.namespace,
      this.values().filter((value) => value.id !== id),
    )
  }

  async replaceAll(values: T[]): Promise<void> {
    this.sharedState.set(this.namespace, clone(values))
  }

  protected values(): T[] {
    return (this.sharedState.get(this.namespace) as T[] | undefined) ?? []
  }
}

interface LocalConfirmationRecord {
  handoffId: string
  recipientCapability: string
  token: string
  createdAt: number
  expiresAt: number
  consumedAt?: number
}

class LocalOnlyHandoffRepository
  extends LocalOnlyRepository<Handoff>
  implements HandoffRepository
{
  constructor(
    sharedState: Map<string, unknown>,
    namespace: string,
    private readonly recipientCapability: string,
  ) {
    super(sharedState, namespace)
  }

  private recipientBindings(): Map<string, string> {
    const existing = this.sharedState.get('recipientBindings') as
      | Map<string, string>
      | undefined
    if (existing) return existing
    const created = new Map<string, string>()
    this.sharedState.set('recipientBindings', created)
    return created
  }

  private confirmations(): LocalConfirmationRecord[] {
    const existing = this.sharedState.get('handoffConfirmations') as
      | LocalConfirmationRecord[]
      | undefined
    if (existing) return existing
    const created: LocalConfirmationRecord[] = []
    this.sharedState.set('handoffConfirmations', created)
    return created
  }

  override async save(value: Handoff): Promise<void> {
    await super.save(validateHandoff(value))
  }

  async getByPublicToken(
    publicToken: string,
    now = Date.now(),
  ): Promise<PublicHandoff | null> {
    const handoff = this.values().find((value) => value.publicToken === publicToken)
    if (!handoff) return null
    if (isExpired(handoff, now)) {
      if (handoff.status !== 'expired') {
        await super.save({ ...handoff, status: 'expired', updatedAt: now })
      }
      return null
    }
    return toPublicHandoff(handoff)
  }

  async markOpened(
    publicToken: string,
    now = Date.now(),
  ): Promise<PublicHandoff> {
    const handoff = this.values().find((value) => value.publicToken === publicToken)
    if (!handoff || isExpired(handoff, now)) {
      if (handoff && handoff.status !== 'expired') {
        await super.save({ ...handoff, status: 'expired', updatedAt: now })
      }
      throw new Error('Handoff is unavailable or expired')
    }
    const bindings = this.recipientBindings()
    const binding = bindings.get(handoff.id)
    if (binding && binding !== this.recipientCapability) {
      throw new Error('Handoff is bound to another recipient')
    }
    bindings.set(handoff.id, this.recipientCapability)
    if (handoff.status === 'opened') return toPublicHandoff(handoff)
    if ((handoff.status ?? 'created') !== 'created') {
      return toPublicHandoff(handoff)
    }
    const next = { ...handoff, status: 'opened' as const, updatedAt: now }
    await super.save(next)
    return toPublicHandoff(next)
  }

  async transitionByPublicToken(
    publicToken: string,
    status: HandoffStatus,
    now = Date.now(),
  ): Promise<PublicHandoff> {
    if (status === 'completed') {
      throw new Error('Completed requires recipient confirmation')
    }
    const handoff = this.values().find((value) => value.publicToken === publicToken)
    if (!handoff || isExpired(handoff, now)) {
      if (handoff && handoff.status !== 'expired') {
        await super.save({ ...handoff, status: 'expired', updatedAt: now })
      }
      throw new Error('Handoff is unavailable or expired')
    }
    if (handoff.status === status) return toPublicHandoff(handoff)
    assertHandoffTransition(handoff.status ?? 'created', status)
    const next = { ...handoff, status, updatedAt: now }
    await super.save(next)
    return toPublicHandoff(next)
  }

  async createConfirmation(
    publicToken: string,
    now = Date.now(),
  ): Promise<Confirmation> {
    const handoff = this.values().find((value) => value.publicToken === publicToken)
    if (!handoff || isExpired(handoff, now)) {
      throw new Error('Handoff is unavailable or expired')
    }
    if (this.recipientBindings().get(handoff.id) !== this.recipientCapability) {
      throw new Error('Handoff is bound to another recipient')
    }
    if (
      !['opened', 'running', 'needs_input', 'waiting_confirmation'].includes(
        handoff.status ?? 'created',
      )
    ) {
      throw new Error('Handoff cannot be confirmed in its current state')
    }
    const confirmation: Confirmation = {
      token: generatePublicToken(),
      createdAt: now,
      expiresAt: now + 120_000,
    }
    this.confirmations().push({
      handoffId: handoff.id,
      recipientCapability: this.recipientCapability,
      ...confirmation,
    })
    return clone(confirmation)
  }

  async complete(
    publicToken: string,
    confirmationToken: string,
    now = Date.now(),
  ): Promise<PublicHandoff> {
    const handoff = this.values().find((value) => value.publicToken === publicToken)
    if (!handoff || isExpired(handoff, now)) {
      throw new Error('Handoff is unavailable or expired')
    }
    if (this.recipientBindings().get(handoff.id) !== this.recipientCapability) {
      throw new Error('Handoff is bound to another recipient')
    }
    const confirmation = this.confirmations().find(
      (candidate) =>
        candidate.handoffId === handoff.id &&
        candidate.recipientCapability === this.recipientCapability &&
        candidate.token === confirmationToken,
    )
    if (!confirmation) throw new Error('Recipient confirmation is invalid')
    if (confirmation.consumedAt !== undefined) {
      throw new Error('Recipient confirmation was already consumed')
    }
    if (confirmation.expiresAt <= now) {
      throw new Error('Recipient confirmation is expired')
    }
    if (!['running', 'waiting_confirmation'].includes(handoff.status ?? 'created')) {
      throw new Error('Handoff cannot be completed in its current state')
    }
    const next = { ...handoff, status: 'completed' as const, updatedAt: now }
    // Only a human attestation can ever reach this point now — there is no
    // WebMCP path to `.complete()` any more — so this atomic submission
    // activity is always sourced from a human.
    const submitActivity = validateActivity({
      id: `submit-${globalThis.crypto.randomUUID()}`,
      kind: 'command',
      timestamp: now,
      source: 'human',
      commandType: 'submit_renewal',
      policy: 'confirmation_required',
      outcome: 'applied',
    })
    confirmation.consumedAt = now
    await super.save(next)
    const activity =
      (this.sharedState.get('activity') as ActivityEvent[] | undefined) ?? []
    this.sharedState.set('activity', [...activity, submitActivity])
    return toPublicHandoff(next)
  }
}

class LocalOnlyProcedureRepository
  extends LocalOnlyRepository<Procedure>
  implements ProcedureRepository
{
  override async save(value: Procedure): Promise<void> {
    await super.save(validateProcedure(value))
  }

  async getByRecordingId(recordingId: string): Promise<Procedure | null> {
    return clone(
      this.values().find((value) => value.recordingId === recordingId) ?? null,
    )
  }

  override async remove(id: string): Promise<void> {
    const handoffs =
      (this.sharedState.get('handoffs') as Handoff[] | undefined) ?? []
    this.sharedState.set(
      'handoffs',
      handoffs.filter((handoff) => handoff.procedureId !== id),
    )
    await super.remove(id)
  }
}

function toPublicHandoff(handoff: Handoff): PublicHandoff {
  if (!handoff.publicToken) throw new Error('Handoff public token is missing')
  return clone({
    publicToken: handoff.publicToken,
    title: handoff.title,
    createdAt: handoff.createdAt,
    expiresAt: handoff.expiresAt,
    status: handoff.status,
    ...(handoff.recipient ? { recipient: handoff.recipient } : {}),
    procedure: {
      title: handoff.procedure?.title ?? handoff.title,
      steps: (handoff.procedure?.steps ?? []).map(
        ({ id: _id, ...step }) => step,
      ),
    },
    policy: handoff.policy ?? {
      allowSafePreferences: false,
      requireConfirmation: true,
      allowHelperEscalation: false,
    },
  })
}

class LocalOnlyHelpRequestRepository
  extends LocalOnlyRepository<HelpRequest>
  implements HelpRequestRepository
{
  override async save(value: HelpRequest): Promise<void> {
    await super.save(validateHelpRequest(value))
  }

  async getByPublicToken(
    publicToken: string,
    now = Date.now(),
  ): Promise<PublicHelpRequest | null> {
    assertPublicToken(publicToken)
    const request = this.values().find((value) => value.publicToken === publicToken)
    const handoffs =
      (this.sharedState.get('handoffs') as Handoff[] | undefined) ?? []
    const parent = request
      ? handoffs.find((handoff) => handoff.id === request.handoffId)
      : undefined
    if (
      !request?.publicToken ||
      request.expiresAt === undefined ||
      !parent ||
      isExpired(request, now) ||
      isExpired(parent, now) ||
      parent.status === 'completed' ||
      parent.status === 'expired'
    ) {
      return null
    }
    return {
      publicToken: request.publicToken,
      expiresAt: request.expiresAt,
      status: request.status,
      detail: request.detail,
      options: request.options,
    }
  }

  async createForHandoffToken(
    handoffToken: string,
    request: HelpRequest,
    now = Date.now(),
  ): Promise<void> {
    assertPublicToken(handoffToken)
    if (request.status !== 'open') {
      throw new Error('New helper request status must be open')
    }
    const handoffs =
      (this.sharedState.get('handoffs') as Handoff[] | undefined) ?? []
    const parent = handoffs.find(
      (handoff) => handoff.publicToken === handoffToken,
    )
    if (
      !parent ||
      isExpired(parent, now) ||
      parent.status === 'completed' ||
      parent.status === 'expired'
    ) {
      throw new Error('Handoff is unavailable or expired')
    }
    if (!parent.policy?.allowHelperEscalation) {
      throw new Error('Helper escalation is disabled by handoff policy')
    }
    await this.save({
      ...request,
      handoffId: parent.id,
      expiresAt: Math.min(
        request.expiresAt ?? now + 7 * 24 * 60 * 60 * 1000,
        parent.expiresAt ?? now,
      ),
    })
  }
}

class LocalOnlyDecisionRepository
  extends LocalOnlyRepository<HelperDecision>
  implements DecisionRepository
{
  private readonly listeners = new Set<(decision: HelperDecision) => void>()

  override async save(value: HelperDecision): Promise<void> {
    await super.save(validateDecision(value))
    for (const listener of this.listeners) listener(clone(value))
  }

  subscribe(listener: (decision: HelperDecision) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  async pollByRequestToken(
    publicToken: string,
    now = Date.now(),
  ): Promise<HelperDecision | null> {
    const requests =
      (this.sharedState.get('helpRequests') as HelpRequest[] | undefined) ?? []
    const request = requests.find((value) => value.publicToken === publicToken)
    const handoffs =
      (this.sharedState.get('handoffs') as Handoff[] | undefined) ?? []
    const parent = request
      ? handoffs.find((handoff) => handoff.id === request.handoffId)
      : undefined
    if (
      !request ||
      !parent ||
      isExpired(request, now) ||
      isExpired(parent, now) ||
      parent.status === 'completed' ||
      parent.status === 'expired'
    ) {
      return null
    }
    return clone(
      [...this.values()]
        .reverse()
        .find((decision) => decision.requestId === request.id) ?? null,
    )
  }

  async saveForRequestToken(
    publicToken: string,
    decision: HelperDecision,
    now = Date.now(),
  ): Promise<void> {
    const requests =
      (this.sharedState.get('helpRequests') as HelpRequest[] | undefined) ?? []
    const request = requests.find((value) => value.publicToken === publicToken)
    const handoffs =
      (this.sharedState.get('handoffs') as Handoff[] | undefined) ?? []
    const parent = request
      ? handoffs.find((handoff) => handoff.id === request.handoffId)
      : undefined
    if (
      !request ||
      !parent ||
      request.status !== 'open' ||
      isExpired(request, now) ||
      isExpired(parent, now) ||
      parent.status === 'completed' ||
      parent.status === 'expired'
    ) {
      throw new Error('Helper request is unavailable')
    }
    await this.save({ ...decision, requestId: request.id })
    this.sharedState.set(
      'helpRequests',
      requests.map((candidate) =>
        candidate.id === request.id
          ? {
              ...candidate,
              status: 'resolved' as const,
              updatedAt: decision.decidedAt,
            }
          : candidate,
      ),
    )
  }
}

class LocalOnlyActivityRepository
  extends LocalOnlyRepository<ActivityEvent>
  implements ActivityRepository
{
  override async save(value: ActivityEvent): Promise<void> {
    await super.save(validateActivity(value))
  }

  async appendForHandoffToken(
    handoffToken: string,
    event: ActivityEvent,
  ): Promise<void> {
    const handoffs =
      (this.sharedState.get('handoffs') as Handoff[] | undefined) ?? []
    const parent = handoffs.find(
      (handoff) => handoff.publicToken === handoffToken,
    )
    if (
      !parent ||
      isExpired(parent) ||
      parent.status === 'completed' ||
      parent.status === 'expired'
    ) {
      throw new Error('Handoff is unavailable or terminal')
    }
    if (
      event.commandType === 'set_preference' &&
      !parent.policy?.allowSafePreferences
    ) {
      throw new Error('Safe preference application is disabled by handoff policy')
    }
    await this.save(event)
  }
}

const processLocalState = new Map<string, unknown>()

export function createLocalOnlySharedRepositories(
  options: {
    sharedState?: Map<string, unknown>
    seed?: RepositorySeed
  } = {},
): SharedRepositories {
  const sharedState = options.sharedState ?? processLocalState
  const recipientCapability = generatePublicToken()
  if (options.seed) {
    sharedState.set('procedures', clone(options.seed.procedures))
    sharedState.set('handoffs', clone(options.seed.handoffs))
    sharedState.set('helpRequests', clone(options.seed.helpRequests ?? []))
    sharedState.set('decisions', clone(options.seed.decisions))
    sharedState.set('activity', clone(options.seed.activity))
  }
  return {
    procedures: new LocalOnlyProcedureRepository(sharedState, 'procedures'),
    handoffs: new LocalOnlyHandoffRepository(
      sharedState,
      'handoffs',
      recipientCapability,
    ),
    helpRequests: new LocalOnlyHelpRequestRepository(sharedState, 'helpRequests'),
    decisions: new LocalOnlyDecisionRepository(sharedState, 'decisions'),
    activity: new LocalOnlyActivityRepository(sharedState, 'activity'),
    mode: 'local-only',
  }
}
