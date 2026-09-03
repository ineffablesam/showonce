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
  assertPublicToken,
  validateActivity,
  validateDecision,
  validateHandoff,
  validateHelpRequest,
  validateProcedure,
  validatePublicHandoff,
  validatePublicHelpRequest,
} from '../sharing/validation'
import type {
  ActivityRepository,
  DecisionRepository,
  HandoffRepository,
  HelpRequestRepository,
  ProcedureRepository,
  PublicHandoff,
  PublicHelpRequest,
} from './types'

export type { PublicHandoff, PublicHelpRequest } from './types'

export interface SharedTransport {
  createProcedure: (input: {
    procedure: Procedure
  }) => Promise<void>
  listProcedures: () => Promise<Procedure[]>
  getProcedure: (input: {
    id?: string
    recordingId?: string
  }) => Promise<Procedure | null>
  deleteProcedure: (input: { id: string }) => Promise<void>
  createHandoff: (input: {
    handoff: Handoff
  }) => Promise<void>
  listHandoffs: () => Promise<Handoff[]>
  getHandoff: (input: {
    id: string
  }) => Promise<Handoff | null>
  deleteHandoff: (input: { id: string }) => Promise<void>
  getPublicHandoff: (input: {
    publicToken: string
    now?: number
  }) => Promise<PublicHandoff | null>
  markHandoffOpened: (input: {
    publicToken: string
    now?: number
  }) => Promise<PublicHandoff>
  transitionHandoff: (input: {
    publicToken: string
    status: HandoffStatus
    now?: number
  }) => Promise<PublicHandoff>
  createConfirmation: (input: {
    publicToken: string
    now?: number
  }) => Promise<Confirmation>
  completeHandoff: (input: {
    publicToken: string
    confirmationToken: string
    now?: number
  }) => Promise<PublicHandoff>
  saveHelpRequest: (input: {
    request: HelpRequest
  }) => Promise<void>
  createHelpRequest: (input: {
    handoffToken: string
    request: HelpRequest
    now?: number
  }) => Promise<void>
  listHelpRequests: () => Promise<HelpRequest[]>
  getHelpRequest: (input: {
    id: string
  }) => Promise<HelpRequest | null>
  getPublicHelpRequest: (input: {
    publicToken: string
    now?: number
  }) => Promise<PublicHelpRequest | null>
  saveDecision: (input: {
    decision: HelperDecision
  }) => Promise<void>
  listDecisions: () => Promise<HelperDecision[]>
  getDecision: (input: {
    id: string
  }) => Promise<HelperDecision | null>
  recordDecision: (input: {
    requestToken: string
    decision: HelperDecision
    now?: number
  }) => Promise<HelperDecision>
  pollDecision: (input: {
    requestToken: string
    now?: number
  }) => Promise<HelperDecision | null>
  appendActivity: (input: {
    event: ActivityEvent
  }) => Promise<void>
  appendPublicActivity: (input: {
    handoffToken: string
    event: ActivityEvent
    now?: number
  }) => Promise<void>
  listActivity: () => Promise<ActivityEvent[]>
  getActivity: (input: {
    id: string
  }) => Promise<ActivityEvent | null>
}

abstract class OwnerRepository<T extends { id: string }> {
  constructor(protected readonly transport: SharedTransport) {}

  abstract list(): Promise<T[]>
  abstract get(id: string): Promise<T | null>
  abstract save(value: T): Promise<void>

  async remove(_id: string): Promise<void> {
    throw new Error('Shared record deletion is not supported')
  }

  async replaceAll(_values: T[]): Promise<void> {
    throw new Error('Shared bulk replacement is not supported')
  }
}

export class SupabaseProcedureRepository
  extends OwnerRepository<Procedure>
  implements ProcedureRepository
{
  async list(): Promise<Procedure[]> {
    return this.transport.listProcedures()
  }

  async get(id: string): Promise<Procedure | null> {
    return this.transport.getProcedure({ id })
  }

  async save(value: Procedure): Promise<void> {
    await this.transport.createProcedure({
      procedure: validateProcedure(value),
    })
  }

  async getByRecordingId(recordingId: string): Promise<Procedure | null> {
    return this.transport.getProcedure({
      recordingId,
    })
  }

  override async remove(id: string): Promise<void> {
    await this.transport.deleteProcedure({ id })
  }
}

export class SupabaseHandoffRepository
  extends OwnerRepository<Handoff>
  implements HandoffRepository
{
  async list(): Promise<Handoff[]> {
    return this.transport.listHandoffs()
  }

  async get(id: string): Promise<Handoff | null> {
    return this.transport.getHandoff({ id })
  }

  async save(value: Handoff): Promise<void> {
    await this.transport.createHandoff({
      handoff: validateHandoff({
        ...value,
        policy: value.policy ?? {
          allowSafePreferences: false,
          requireConfirmation: true,
          allowHelperEscalation: false,
        },
      }),
    })
  }

  async getByPublicToken(
    publicToken: string,
    now = Date.now(),
  ): Promise<PublicHandoff | null> {
    assertPublicToken(publicToken)
    const value = await this.transport.getPublicHandoff({ publicToken, now })
    return value === null ? null : validatePublicHandoff(value)
  }

  async markOpened(
    publicToken: string,
    now = Date.now(),
  ): Promise<PublicHandoff> {
    assertPublicToken(publicToken)
    return validatePublicHandoff(
      await this.transport.markHandoffOpened({ publicToken, now }),
    )
  }

  async transitionByPublicToken(
    publicToken: string,
    status: HandoffStatus,
    now = Date.now(),
  ): Promise<PublicHandoff> {
    assertPublicToken(publicToken)
    if (status === 'completed') {
      throw new Error('Completed requires recipient confirmation')
    }
    return validatePublicHandoff(
      await this.transport.transitionHandoff({ publicToken, status, now }),
    )
  }

  async createConfirmation(
    publicToken: string,
    now = Date.now(),
  ): Promise<Confirmation> {
    assertPublicToken(publicToken)
    return this.transport.createConfirmation({ publicToken, now })
  }

  async complete(
    publicToken: string,
    confirmationToken: string,
    now = Date.now(),
  ): Promise<PublicHandoff> {
    assertPublicToken(publicToken)
    return validatePublicHandoff(
      await this.transport.completeHandoff({
        publicToken,
        confirmationToken,
        now,
      }),
    )
  }

  override async remove(id: string): Promise<void> {
    await this.transport.deleteHandoff({ id })
  }
}

export class SupabaseHelpRequestRepository
  extends OwnerRepository<HelpRequest>
  implements HelpRequestRepository
{
  async list(): Promise<HelpRequest[]> {
    return this.transport.listHelpRequests()
  }

  async get(id: string): Promise<HelpRequest | null> {
    return this.transport.getHelpRequest({ id })
  }

  async save(value: HelpRequest): Promise<void> {
    await this.transport.saveHelpRequest({
      request: validateHelpRequest(value),
    })
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
    await this.transport.createHelpRequest({
      handoffToken,
      request: validateHelpRequest(request),
      now,
    })
  }

  async getByPublicToken(
    publicToken: string,
    now = Date.now(),
  ): Promise<PublicHelpRequest | null> {
    assertPublicToken(publicToken)
    const value = await this.transport.getPublicHelpRequest({ publicToken, now })
    return value === null ? null : validatePublicHelpRequest(value)
  }
}

export class SupabaseDecisionRepository
  extends OwnerRepository<HelperDecision>
  implements DecisionRepository
{
  private readonly listeners = new Set<(decision: HelperDecision) => void>()

  async list(): Promise<HelperDecision[]> {
    return this.transport.listDecisions()
  }

  async get(id: string): Promise<HelperDecision | null> {
    return this.transport.getDecision({ id })
  }

  async save(value: HelperDecision): Promise<void> {
    await this.transport.saveDecision({
      decision: validateDecision(value),
    })
  }

  async saveForRequestToken(
    publicToken: string,
    decision: HelperDecision,
    now = Date.now(),
  ): Promise<void> {
    assertPublicToken(publicToken)
    const saved = await this.transport.recordDecision({
      requestToken: publicToken,
      decision: validateDecision(decision),
      now,
    })
    for (const listener of this.listeners) listener(saved)
  }

  async pollByRequestToken(
    publicToken: string,
    now = Date.now(),
  ): Promise<HelperDecision | null> {
    assertPublicToken(publicToken)
    return this.transport.pollDecision({ requestToken: publicToken, now })
  }

  subscribe(listener: (decision: HelperDecision) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
}

export class SupabaseActivityRepository
  extends OwnerRepository<ActivityEvent>
  implements ActivityRepository
{
  async list(): Promise<ActivityEvent[]> {
    return this.transport.listActivity()
  }

  async get(id: string): Promise<ActivityEvent | null> {
    return this.transport.getActivity({ id })
  }

  async save(value: ActivityEvent): Promise<void> {
    await this.transport.appendActivity({
      event: validateActivity(value),
    })
  }

  async appendForHandoffToken(
    handoffToken: string,
    event: ActivityEvent,
  ): Promise<void> {
    assertPublicToken(handoffToken)
    await this.transport.appendPublicActivity({
      handoffToken,
      event: validateActivity(event),
    })
  }
}
