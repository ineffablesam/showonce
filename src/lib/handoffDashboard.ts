import type { Handoff, HandoffStatus } from '../domain/model'

const TERMINAL_HANDOFF_STATUSES = new Set<HandoffStatus>(['completed', 'expired'])

export function isTerminalHandoffStatus(
  status: HandoffStatus | undefined,
): boolean {
  return TERMINAL_HANDOFF_STATUSES.has(status ?? 'created')
}

export function isActiveHandoff(handoff: Pick<Handoff, 'status'>): boolean {
  return !isTerminalHandoffStatus(handoff.status)
}

export function formatHandoffStatus(status: HandoffStatus | undefined): string {
  return (status ?? 'created').replaceAll('_', ' ')
}

export function handoffStatusPillClass(status: HandoffStatus | undefined): string {
  return status === 'completed' ? 'pill pill--ready' : 'pill'
}

export function sortHandoffsByRecency(handoffs: Handoff[]): Handoff[] {
  return [...handoffs].sort(
    (left, right) =>
      (right.updatedAt ?? right.createdAt) - (left.updatedAt ?? left.createdAt),
  )
}
