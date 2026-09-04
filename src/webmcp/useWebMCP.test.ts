import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { WebMCPRegistrationContext } from './types'
import { useWebMCP } from './useWebMCP'

const harness = vi.hoisted(() => ({
  cleanups: [] as Array<() => void>,
  dependencies: [] as unknown[][],
  register: vi.fn(
    (
      _context: unknown,
      _options?: { signal?: AbortSignal },
    ) =>
      new Promise<{
        available: boolean
        registeredToolNames: []
        dispose: () => void
      }>(() => undefined),
  ),
}))

vi.mock('react', () => ({
  useState: <T>(initial: T) => [initial, vi.fn()] as const,
  useRef: <T>(initial: T) => ({ current: initial }),
  useEffect: (effect: () => void | (() => void), dependencies: unknown[]) => {
    harness.dependencies.push(dependencies)
    const cleanup = effect()
    if (cleanup) harness.cleanups.push(cleanup)
  },
}))

vi.mock('./registerTools', () => ({
  registerWebMCPTools: harness.register,
}))

const context = {
  repositories: {
    procedures: { list: vi.fn(), get: vi.fn() },
    handoffs: { list: vi.fn(), get: vi.fn() },
    activity: { append: vi.fn() },
    decisions: { get: vi.fn(), save: vi.fn() },
  },
  execute: vi.fn(),
  compare: vi.fn(),
  getRecipientState: vi.fn(),
} as unknown as Omit<WebMCPRegistrationContext, 'scope'>

describe('useWebMCP', () => {
  beforeEach(() => {
    harness.cleanups.length = 0
    harness.dependencies.length = 0
    harness.register.mockClear()
  })

  it('creates registration cancellation synchronously and avoids whole-context dependencies', () => {
    useWebMCP('recipient', context)

    const options = harness.register.mock.calls[0]?.[1]
    expect(options?.signal).toBeInstanceOf(AbortSignal)
    expect(options?.signal?.aborted).toBe(false)
    expect(harness.dependencies[0]).not.toContain(context)

    harness.cleanups[0]?.()
    expect(options?.signal?.aborted).toBe(true)
  })
})
