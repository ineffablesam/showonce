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
import { sanitizeSensitive } from '../security/sanitize'
import { DEMO_SEED } from './seed'
import type {
  DecisionChannel,
  DecisionRepository,
  Entity,
  ActivityRepository,
  HandoffRepository,
  HelpRequestRepository,
  PublicHandoff,
  PublicHelpRequest,
  ProcedureRepository,
  Repository,
  RepositorySeed,
  ShowOnceRepositories,
} from './types'

const STORAGE_PREFIX = 'showonce:v1'

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>()

  get length() {
    return this.values.size
  }

  clear() {
    this.values.clear()
  }

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null
  }

  removeItem(key: string) {
    this.values.delete(key)
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

class BrowserRepository<T extends Entity> implements Repository<T> {
  constructor(
    private readonly storage: Storage,
    private readonly key: string,
    initialValues: T[],
  ) {
    if (this.storage.getItem(this.key) === null) {
      this.write(initialValues)
    }
  }

  async list(): Promise<T[]> {
    return clone(this.read())
  }

  async get(id: string): Promise<T | null> {
    return clone(this.read().find((value) => value.id === id) ?? null)
  }

  async save(value: T): Promise<void> {
    const values = this.read()
    const index = values.findIndex(({ id }) => id === value.id)
    if (index === -1) {
      values.push(clone(value))
    } else {
      values[index] = clone(value)
    }
    this.write(values)
  }

  async remove(id: string): Promise<void> {
    this.write(this.read().filter((value) => value.id !== id))
  }

  async replaceAll(values: T[]): Promise<void> {
    this.write(values)
  }

  protected read(): T[] {
    try {
      const raw = this.storage.getItem(this.key)
      const parsed: unknown = raw === null ? [] : JSON.parse(raw)
      return Array.isArray(parsed) ? (parsed as T[]) : []
    } catch {
      return []
    }
  }

  protected write(values: T[]): void {
    try {
      this.storage.setItem(this.key, JSON.stringify(values))
    } catch {
      // Storage may be disabled or full. The repository remains safe to read.
    }
  }
}

class BrowserHandoffRepository
  extends BrowserRepository<Handoff>
  implements HandoffRepository
{
  async getByPublicToken(
    publicToken: string,
    now = Date.now(),
  ): Promise<PublicHandoff | null> {
    const handoff = this.read().find((value) => value.publicToken === publicToken)
    if (!handoff || isExpired(handoff, now)) return null
    return this.toPublic(handoff)
  }

  async markOpened(
    publicToken: string,
    now = Date.now(),
  ): Promise<PublicHandoff> {
    const handoff = this.read().find((value) => value.publicToken === publicToken)
    if (!handoff || isExpired(handoff, now)) {
      throw new Error('Handoff is unavailable or expired')
    }
    const status = handoff.status ?? 'created'
    if (status === 'opened' || status !== 'created') {
      return this.toPublic(handoff)
    }
    const next = { ...handoff, status: 'opened' as const, updatedAt: now }
    await this.save(next)
    return this.toPublic(next)
  }

  async transitionByPublicToken(
    publicToken: string,
    status: HandoffStatus,
    now = Date.now(),
  ): Promise<PublicHandoff> {
    if (status === 'completed') {
      throw new Error('Completed requires recipient confirmation')
    }
    const handoff = this.read().find((value) => value.publicToken === publicToken)
    if (!handoff || isExpired(handoff, now)) {
      throw new Error('Handoff is unavailable or expired')
    }
    if (handoff.status === status) return this.toPublic(handoff)
    assertHandoffTransition(handoff.status ?? 'created', status)
    const next = { ...handoff, status, updatedAt: now }
    await this.save(next)
    return this.toPublic(next)
  }

  private readonly confirmations = new Map<string, Confirmation & {
    consumedAt?: number
  }>()

  async createConfirmation(
    publicToken: string,
    now = Date.now(),
  ): Promise<Confirmation> {
    const handoff = this.read().find((value) => value.publicToken === publicToken)
    if (!handoff || isExpired(handoff, now)) {
      throw new Error('Handoff is unavailable or expired')
    }
    const confirmation = {
      token: generatePublicToken(),
      createdAt: now,
      expiresAt: now + 120_000,
    }
    this.confirmations.set(publicToken, confirmation)
    return clone(confirmation)
  }

  async complete(
    publicToken: string,
    confirmationToken: string,
    now = Date.now(),
  ): Promise<PublicHandoff> {
    const handoff = this.read().find((value) => value.publicToken === publicToken)
    const confirmation = this.confirmations.get(publicToken)
    if (!handoff || isExpired(handoff, now)) {
      throw new Error('Handoff is unavailable or expired')
    }
    if (!confirmation || confirmation.token !== confirmationToken) {
      throw new Error('Recipient confirmation is invalid')
    }
    if (confirmation.consumedAt !== undefined) {
      throw new Error('Recipient confirmation was already consumed')
    }
    if (confirmation.expiresAt <= now) {
      throw new Error('Recipient confirmation is expired')
    }
    confirmation.consumedAt = now
    const next = { ...handoff, status: 'completed' as const, updatedAt: now }
    await this.save(next)
    return this.toPublic(next)
  }

  private toPublic(handoff: Handoff): PublicHandoff {
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
}

class BrowserProcedureRepository
  extends BrowserRepository<Procedure>
  implements ProcedureRepository
{
  async getByRecordingId(
    recordingId: string,
  ): Promise<Procedure | null> {
    return clone(
      this.read().find((value) => value.recordingId === recordingId) ?? null,
    )
  }
}

class BrowserHelpRequestRepository
  extends BrowserRepository<HelpRequest>
  implements HelpRequestRepository
{
  async getByPublicToken(
    publicToken: string,
    now = Date.now(),
  ): Promise<PublicHelpRequest | null> {
    const request = this.read().find((value) => value.publicToken === publicToken)
    if (
      !request?.publicToken ||
      request.expiresAt === undefined ||
      isExpired(request, now)
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
    _handoffToken: string,
    request: HelpRequest,
  ): Promise<void> {
    await this.save(request)
  }
}

class BrowserDecisionRepository
  extends BrowserRepository<HelperDecision>
  implements DecisionRepository
{
  private readonly listeners = new Set<(decision: HelperDecision) => void>()

  constructor(
    storage: Storage,
    key: string,
    initialValues: HelperDecision[],
    private readonly channel?: DecisionChannel,
  ) {
    super(storage, key, initialValues)
    if (this.channel) {
      this.channel.onmessage = (event) => {
        void super.save(event.data)
        this.notify(event.data)
      }
    }
  }

  override async save(value: HelperDecision): Promise<void> {
    await super.save(value)
    this.notify(value)
    this.channel?.postMessage(clone(value))
  }

  subscribe(listener: (decision: HelperDecision) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  async pollByRequestToken(publicToken: string): Promise<HelperDecision | null> {
    return (
      [...this.read()].reverse().find(({ requestId }) => requestId === publicToken) ??
      null
    )
  }

  async saveForRequestToken(
    _publicToken: string,
    decision: HelperDecision,
  ): Promise<void> {
    await this.save(decision)
  }

  private notify(decision: HelperDecision): void {
    for (const listener of this.listeners) {
      listener(clone(decision))
    }
  }
}

class BrowserActivityRepository
  extends BrowserRepository<ActivityEvent>
  implements ActivityRepository
{
  async appendForHandoffToken(
    _handoffToken: string,
    event: ActivityEvent,
  ): Promise<void> {
    await this.save(event)
  }
}

export interface BrowserRepositoryOptions {
  storage?: Storage
  seed?: RepositorySeed
  channelFactory?: () => DecisionChannel | undefined
}

function browserStorage(): Storage {
  if (typeof window !== 'undefined') {
    try {
      return window.localStorage
    } catch {
      return new MemoryStorage()
    }
  }
  return new MemoryStorage()
}

function browserChannel(): DecisionChannel | undefined {
  if (
    typeof window === 'undefined' ||
    typeof window.BroadcastChannel === 'undefined'
  ) {
    return undefined
  }
  return new window.BroadcastChannel('showonce:decisions')
}

export function createBrowserRepositories(
  options: BrowserRepositoryOptions = {},
): ShowOnceRepositories {
  const storage = options.storage ?? browserStorage()
  const seed = options.seed ?? DEMO_SEED
  const channel =
    options.channelFactory === undefined
      ? browserChannel()
      : options.channelFactory()

  return {
    recordings: new BrowserRepository(
      storage,
      `${STORAGE_PREFIX}:recordings`,
      seed.recordings ?? [],
    ),
    procedures: new BrowserProcedureRepository(
      storage,
      `${STORAGE_PREFIX}:procedures`,
      seed.procedures,
    ),
    handoffs: new BrowserHandoffRepository(
      storage,
      `${STORAGE_PREFIX}:handoffs`,
      seed.handoffs,
    ),
    activity: new BrowserActivityRepository(
      storage,
      `${STORAGE_PREFIX}:activity`,
      seed.activity,
    ),
    decisions: new BrowserDecisionRepository(
      storage,
      `${STORAGE_PREFIX}:decisions`,
      seed.decisions,
      channel,
    ),
    accounts: new BrowserRepository(
      storage,
      `${STORAGE_PREFIX}:accounts`,
      seed.accounts ?? [],
    ),
    helpRequests: new BrowserHelpRequestRepository(
      storage,
      `${STORAGE_PREFIX}:help-requests`,
      seed.helpRequests ?? [],
    ),
    runs: new BrowserRepository(
      storage,
      `${STORAGE_PREFIX}:runs`,
      seed.runs ?? [],
    ),
    dispose: () => {
      if (channel) {
        channel.onmessage = null
        channel.close()
      }
    },
  }
}

export function createLocalDemoRepositories(
  options: Pick<BrowserRepositoryOptions, 'storage' | 'seed'> = {},
): Pick<ShowOnceRepositories, 'recordings' | 'accounts' | 'runs' | 'dispose'> {
  const storage = options.storage ?? browserStorage()
  const seed = options.seed ?? DEMO_SEED
  return {
    recordings: new BrowserRepository(
      storage,
      `${STORAGE_PREFIX}:recordings`,
      seed.recordings ?? [],
    ),
    accounts: new BrowserRepository(
      storage,
      `${STORAGE_PREFIX}:accounts`,
      seed.accounts ?? [],
    ),
    runs: new BrowserRepository(
      storage,
      `${STORAGE_PREFIX}:runs`,
      seed.runs ?? [],
    ),
    dispose: () => undefined,
  }
}

function toBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/u, '')
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(
    Math.ceil(value.length / 4) * 4,
    '=',
  )
  const binary = atob(padded)
  return new TextDecoder().decode(
    Uint8Array.from(binary, (character) => character.charCodeAt(0)),
  )
}

export function encodeHandoff<T extends Handoff>(handoff: T): string {
  return toBase64Url(JSON.stringify(sanitizeSensitive(handoff)))
}

export function decodeHandoff(value: string): Handoff {
  try {
    const decoded: unknown = JSON.parse(fromBase64Url(value))
    if (!isHandoff(decoded)) {
      throw new Error('Invalid handoff payload')
    }
    return decoded
  } catch {
    throw new Error('Invalid handoff payload')
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function hasExactKeys(
  value: Record<string, unknown>,
  required: string[],
  optional: string[] = [],
): boolean {
  const keys = Object.keys(value)
  return (
    required.every((key) => keys.includes(key)) &&
    keys.every((key) => required.includes(key) || optional.includes(key))
  )
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== ''
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isProcedureStep(value: unknown): boolean {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, ['id', 'commandType', 'policy', 'input']) ||
    !isNonEmptyString(value.id) ||
    !isRecord(value.input)
  ) {
    return false
  }

  if (
    value.commandType === 'set_preference' &&
    value.policy === 'safe_preference' &&
    hasExactKeys(value.input, ['type', 'key', 'value']) &&
    value.input.type === 'set_preference'
  ) {
    return (
      (value.input.key === 'paperless' &&
        typeof value.input.value === 'boolean') ||
      (value.input.key === 'communication' &&
        (value.input.value === 'email' || value.input.value === 'mail')) ||
      (value.input.key === 'renewalFrequency' &&
        (value.input.value === 'annual' || value.input.value === 'monthly'))
    )
  }

  if (
    value.commandType === 'review_recipient_details' &&
    value.policy === 'recipient_specific' &&
    hasExactKeys(value.input, ['type']) &&
    value.input.type === 'review_recipient_details'
  ) {
    return true
  }

  if (
    value.commandType === 'preview_renewal' &&
    value.policy === 'state_check' &&
    hasExactKeys(value.input, ['type']) &&
    value.input.type === 'preview_renewal'
  ) {
    return true
  }

  if (
    (value.commandType === 'create_confirmation' ||
      value.commandType === 'submit_renewal') &&
    value.policy === 'confirmation_required' &&
    hasExactKeys(value.input, ['type']) &&
    value.input.type === value.commandType
  ) {
    return true
  }

  return (
    value.commandType === 'select_plan' &&
    value.policy === 'availability_checked' &&
    hasExactKeys(value.input, ['type', 'planId'], ['observedMonthlyPrice']) &&
    value.input.type === 'select_plan' &&
    isNonEmptyString(value.input.planId) &&
    (value.input.observedMonthlyPrice === undefined ||
      (isFiniteNumber(value.input.observedMonthlyPrice) &&
        value.input.observedMonthlyPrice >= 0))
  )
}

function isProcedure(value: unknown): value is NonNullable<Handoff['procedure']> {
  return (
    isRecord(value) &&
    hasExactKeys(value, [
      'id',
      'recordingId',
      'title',
      'createdAt',
      'sourceEventIds',
      'steps',
    ]) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.recordingId) &&
    isNonEmptyString(value.title) &&
    isFiniteNumber(value.createdAt) &&
    Array.isArray(value.sourceEventIds) &&
    value.sourceEventIds.every(isNonEmptyString) &&
    Array.isArray(value.steps) &&
    value.steps.every(isProcedureStep)
  )
}

function isHandoff(value: unknown): value is Handoff {
  if (
    !isRecord(value) ||
    !hasExactKeys(
      value,
      ['id', 'procedureId', 'title', 'createdAt'],
      ['procedure', 'recipient', 'note', 'expiresAt', 'policy'],
    ) ||
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.procedureId) ||
    !isNonEmptyString(value.title) ||
    !isFiniteNumber(value.createdAt)
  ) {
    return false
  }
  if (
    (value.recipient !== undefined &&
      (!isNonEmptyString(value.recipient) || value.recipient.length > 80)) ||
    (value.note !== undefined && typeof value.note !== 'string') ||
    (value.expiresAt !== undefined && !isFiniteNumber(value.expiresAt)) ||
    (value.policy !== undefined &&
      (!isRecord(value.policy) ||
        !hasExactKeys(value.policy, [
          'allowSafePreferences',
          'requireConfirmation',
          'allowHelperEscalation',
        ]) ||
        typeof value.policy.allowSafePreferences !== 'boolean' ||
        typeof value.policy.requireConfirmation !== 'boolean' ||
        typeof value.policy.allowHelperEscalation !== 'boolean'))
  ) {
    return false
  }
  return (
    value.procedure === undefined ||
    (isProcedure(value.procedure) && value.procedure.id === value.procedureId)
  )
}

export const repositories = createBrowserRepositories()
