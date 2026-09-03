import { describe, expect, it, vi } from 'vitest'

import type { Handoff, HelperDecision, Procedure } from '../model'
import {
  createBrowserRepositories,
  decodeHandoff,
  encodeHandoff,
} from './browserRepositories'
import { DEMO_SEED, resetDemo } from './seed'

class MemoryStorage implements Storage {
  readonly values = new Map<string, string>()

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

const procedure: Procedure = {
  id: 'procedure-1',
  recordingId: 'recording-1',
  title: 'Renew benefits',
  createdAt: 1,
  sourceEventIds: [],
  steps: [],
}

const handoff: Handoff = {
  id: 'handoff-1',
  procedureId: procedure.id,
  title: 'Benefits renewal',
  createdAt: 2,
}

const encodeRaw = (value: unknown) => {
  const bytes = new TextEncoder().encode(JSON.stringify(value))
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/u, '')
}

describe('browser repositories', () => {
  it('supports deterministic CRUD through repository abstractions', async () => {
    const repositories = createBrowserRepositories({
      storage: new MemoryStorage(),
      channelFactory: () => undefined,
      seed: { procedures: [], handoffs: [], activity: [], decisions: [] },
    })

    await repositories.procedures.save(procedure)
    await repositories.handoffs.save(handoff)

    expect(await repositories.procedures.get(procedure.id)).toEqual(procedure)
    expect(await repositories.handoffs.list()).toEqual([handoff])

    await repositories.handoffs.remove(handoff.id)
    expect(await repositories.handoffs.get(handoff.id)).toBeNull()
  })

  it('resets all stores to the same demo seed', async () => {
    const storage = new MemoryStorage()
    const repositories = createBrowserRepositories({
      storage,
      channelFactory: () => undefined,
      seed: { procedures: [], handoffs: [], activity: [], decisions: [] },
    })
    await repositories.procedures.save(procedure)

    await resetDemo(repositories)

    expect(await repositories.procedures.list()).toEqual(DEMO_SEED.procedures)
    expect(await repositories.handoffs.list()).toEqual(DEMO_SEED.handoffs)
    expect(await repositories.activity.list()).toEqual(DEMO_SEED.activity)
    expect(await repositories.decisions.list()).toEqual(DEMO_SEED.decisions)
  })

  it('round-trips a URL-safe handoff without sensitive values', () => {
    const encoded = encodeHandoff({
      ...handoff,
      procedure,
      password: 'must-not-serialize',
      recipientAddress: 'must-not-serialize',
    })

    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(decodeHandoff(encoded)).toEqual({ ...handoff, procedure })
  })

  it('strictly rejects malformed, additional, sensitive, and invalid nested handoff data', () => {
    const invalidPayloads = [
      { ...handoff, extra: true },
      { ...handoff, password: 'secret' },
      { ...handoff, procedure: { ...procedure, steps: [{ nope: true }] } },
      {
        ...handoff,
        procedure: {
          ...procedure,
          steps: [
            {
              id: 'step-1',
              commandType: 'set_preference',
              policy: 'safe_preference',
              input: { type: 'set_preference', key: 'paperless', value: 'email' },
            },
          ],
        },
      },
    ]

    for (const payload of invalidPayloads) {
      expect(() => decodeHandoff(encodeRaw(payload))).toThrow('Invalid handoff payload')
    }
  })

  it('does not create BroadcastChannel during server rendering', () => {
    const channel = vi.fn()
    vi.stubGlobal('window', undefined)
    vi.stubGlobal('BroadcastChannel', channel)

    const repositories = createBrowserRepositories()

    expect(channel).not.toHaveBeenCalled()
    repositories.dispose()
    vi.unstubAllGlobals()
  })

  it('notifies decision subscribers locally and over BroadcastChannel', async () => {
    const posted: unknown[] = []
    const channel: {
      postMessage: (value: HelperDecision) => void
      close: () => void
      onmessage: ((event: MessageEvent<HelperDecision>) => void) | null
    } = {
      postMessage: (value) => posted.push(value),
      close: vi.fn(),
      onmessage: null,
    }
    const repositories = createBrowserRepositories({
      storage: new MemoryStorage(),
      seed: { procedures: [], handoffs: [], activity: [], decisions: [] },
      channelFactory: () => channel,
    })
    const listener = vi.fn()
    const unsubscribe = repositories.decisions.subscribe(listener)
    const decision: HelperDecision = {
      id: 'decision-1',
      requestId: 'request-1',
      outcome: 'choose_demonstrated',
      decidedAt: 3,
    }

    await repositories.decisions.save(decision)
    expect(listener).toHaveBeenCalledWith(decision)
    expect(posted).toEqual([decision])

    const remote = { ...decision, id: 'decision-2' }
    const inbound = channel.onmessage
    inbound?.({ data: remote } as MessageEvent<HelperDecision>)
    expect(listener).toHaveBeenLastCalledWith(remote)

    unsubscribe()
    repositories.dispose()
    expect(channel.close).toHaveBeenCalledOnce()
  })
})
