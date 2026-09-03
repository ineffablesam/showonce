import { describe, expect, it, vi, beforeEach } from 'vitest'

const sileoMock = vi.hoisted(() => ({
  warning: vi.fn(() => 'toast-1'),
  success: vi.fn(() => 'toast-2'),
}))

vi.mock('sileo', () => ({
  sileo: sileoMock,
}))

vi.mock('../browserNotifications', () => ({
  notificationPermission: vi.fn(() => 'denied'),
  notifySenderNeedsInput: vi.fn(),
  notifyRecipientDecisionReady: vi.fn(),
}))

import { showDecisionReadyToast, showNeedsInputToast } from './inAppNotifications'

describe('inAppNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows a sileo warning with review action for needs input', () => {
    showNeedsInputToast({
      requestId: 'req-1',
      detail: 'material_price_change',
      helpToken: 'helpToken_1234567890123456',
      recipient: 'Jordan',
    })

    expect(sileoMock.warning).toHaveBeenCalledOnce()
    const options = sileoMock.warning.mock.calls[0]?.[0]
    expect(options?.title).toMatch(/regional pricing/i)
    expect(options?.button?.title).toBe('Review')
    expect(options?.duration).toBeNull()
  })

  it('shows a sileo success toast when a decision is ready', () => {
    showDecisionReadyToast({
      requestId: 'req-1',
      outcome: 'recommend_plan',
      planLabel: 'gold',
    })

    expect(sileoMock.success).toHaveBeenCalledOnce()
    expect(sileoMock.success.mock.calls[0]?.[0]?.title).toMatch(/decision ready/i)
  })
})
