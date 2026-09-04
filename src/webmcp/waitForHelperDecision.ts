import type { HelperDecision } from '../domain/model'

export interface WaitForHelperDecisionOptions {
  timeoutMs?: number
  intervalMs?: number
}

export interface HelperDecisionPending {
  status: 'pending'
  message: string
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('The WebMCP invocation was aborted', 'AbortError'))
      return
    }
    const timer = setTimeout(resolve, ms)
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(new DOMException('The WebMCP invocation was aborted', 'AbortError'))
      },
      { once: true },
    )
  })
}

export async function waitForHelperDecision(
  poll: () => Promise<HelperDecision | null>,
  signal: AbortSignal,
  options: WaitForHelperDecisionOptions = {},
): Promise<HelperDecision | HelperDecisionPending> {
  const timeoutMs = options.timeoutMs ?? 120_000
  const intervalMs = options.intervalMs ?? 2_000
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    if (signal.aborted) {
      throw new DOMException('The WebMCP invocation was aborted', 'AbortError')
    }
    const decision = await poll()
    if (decision) return decision
    const remaining = deadline - Date.now()
    if (remaining <= 0) break
    await sleep(Math.min(intervalMs, remaining), signal)
  }

  return {
    status: 'pending',
    message:
      'Still waiting for the helper. Call showonce_get_helper_decision again to keep waiting.',
  }
}
