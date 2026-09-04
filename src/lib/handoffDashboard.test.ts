import { describe, expect, it } from 'vitest'

import type { Handoff } from '../domain/model'
import {
  formatHandoffStatus,
  isActiveHandoff,
  isTerminalHandoffStatus,
  sortHandoffsByRecency,
} from './handoffDashboard'

const baseHandoff: Handoff = {
  id: 'handoff-1',
  publicToken: 'A'.repeat(24),
  procedureId: 'procedure-1',
  title: 'Upgrade package',
  createdAt: 1,
  status: 'created',
}

describe('handoffDashboard', () => {
  it('treats completed and expired handoffs as terminal', () => {
    expect(isTerminalHandoffStatus('completed')).toBe(true)
    expect(isTerminalHandoffStatus('expired')).toBe(true)
    expect(isTerminalHandoffStatus('running')).toBe(false)
  })

  it('filters active handoffs for dashboard metrics', () => {
    expect(isActiveHandoff({ status: 'completed' })).toBe(false)
    expect(isActiveHandoff({ status: 'opened' })).toBe(true)
  })

  it('formats status labels for display', () => {
    expect(formatHandoffStatus('needs_input')).toBe('needs input')
  })

  it('sorts handoffs by most recent activity', () => {
    const sorted = sortHandoffsByRecency([
      { ...baseHandoff, id: 'older', updatedAt: 10 },
      { ...baseHandoff, id: 'newer', updatedAt: 20 },
    ])
    expect(sorted.map((handoff) => handoff.id)).toEqual(['newer', 'older'])
  })
})
