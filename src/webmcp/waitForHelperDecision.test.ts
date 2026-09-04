import { describe, expect, it, vi } from 'vitest'

import { waitForHelperDecision } from './waitForHelperDecision'

describe('waitForHelperDecision', () => {
  it('returns the decision as soon as polling finds one', async () => {
    const poll = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'decision-1',
        requestId: 'request-1',
        outcome: 'recommend_plan' as const,
        recommendedPlanId: 'silver' as const,
        decidedAt: 2,
      })

    const result = await waitForHelperDecision(
      poll,
      new AbortController().signal,
      { timeoutMs: 10_000, intervalMs: 10 },
    )

    expect(result).toMatchObject({ recommendedPlanId: 'silver' })
    expect(poll).toHaveBeenCalledTimes(2)
  })

  it('returns pending when the timeout elapses with no decision', async () => {
    vi.useFakeTimers()
    const poll = vi.fn(async () => null)

    const pending = waitForHelperDecision(
      poll,
      new AbortController().signal,
      { timeoutMs: 100, intervalMs: 50 },
    )

    await vi.advanceTimersByTimeAsync(150)
    await expect(pending).resolves.toMatchObject({
      status: 'pending',
      message: expect.stringContaining('Call showonce_get_helper_decision again'),
    })
    vi.useRealTimers()
  })
})
