import { useEffect, useState } from 'react'

import { Icon } from '../ui/Icon'
import type { WebMCPState } from '../../webmcp/useWebMCP'

export interface WebMCPInvocation {
  tool: string
  at: number
  source?: 'webmcp' | 'human'
}

/**
 * Collapsible panel showing which real WebMCP tools are registered on this
 * page, pulsing briefly whenever the browser's WebMCP client actually
 * invokes one, and — once the agent's prep work is done — a WAITING ON
 * HUMAN state that only clears once a human personally attests and submits.
 * This never simulates activity: with no WebMCP client present the log
 * stays empty.
 */
export function WebMCPLivePanel({
  webmcp,
  lastInvocation,
  waitingOnHuman = false,
}: {
  webmcp: WebMCPState
  lastInvocation: WebMCPInvocation | null
  waitingOnHuman?: boolean
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [log, setLog] = useState<WebMCPInvocation[]>([])
  const [pulsing, setPulsing] = useState(false)

  useEffect(() => {
    if (!lastInvocation) return
    setLog((current) => [lastInvocation, ...current].slice(0, 10))
    setPulsing(true)
    const timeout = window.setTimeout(() => setPulsing(false), 900)
    return () => window.clearTimeout(timeout)
  }, [lastInvocation])

  return (
    <section
      aria-label="WebMCP live"
      className={`webmcp-live t-acc${pulsing ? ' webmcp-live--pulsing' : ''}`}
      data-open={!collapsed}
    >
      <button
        aria-expanded={!collapsed}
        className="webmcp-live__header t-acc-head"
        onClick={() => setCollapsed((value) => !value)}
        type="button"
      >
        <span className={`webmcp-live__dot webmcp-live__dot--${webmcp.status}`} />
        <strong>WebMCP live</strong>
        <span className="webmcp-live__count">{webmcp.registeredToolNames.length}</span>
        <span className="t-icon-swap webmcp-live__chevron" data-state={collapsed ? 'a' : 'b'}>
          <span className="t-icon" data-icon="a"><Icon name="arrow" /></span>
          <span className="t-icon" data-icon="b"><Icon name="chevronLeft" /></span>
        </span>
      </button>
      <div className="t-acc-panel webmcp-live__panel">
        <div className="t-acc-panel-inner">
          <div className="webmcp-live__body">
            {webmcp.status !== 'available' ? (
              <p className="webmcp-live__empty">
                {webmcp.status === 'unavailable'
                  ? 'No WebMCP client connected. Nothing is simulated.'
                  : webmcp.status === 'error'
                    ? 'WebMCP registration failed.'
                    : 'Registering real browser tools…'}
              </p>
            ) : log.length === 0 ? (
              <p className="webmcp-live__empty">
                {webmcp.registeredToolNames.length} tools registered. Waiting for the
                agent to call one.
              </p>
            ) : (
              <>
                <ul className="webmcp-live__chips">
                  {log.map((entry, index) => (
                    <li
                      className={`${index === 0 ? 'webmcp-live__entry--new' : ''} ${entry.source === 'human' ? 'webmcp-live__entry--human' : ''}`}
                      key={`${entry.tool}-${entry.at}`}
                    >
                      <Icon name="check" />
                      {entry.source === 'human' ? (
                        <span className="webmcp-live__human-tag">HUMAN</span>
                      ) : null}
                      <code>{entry.tool}()</code>
                    </li>
                  ))}
                </ul>
                {waitingOnHuman ? (
                  <p className="webmcp-live__waiting" role="status">
                    <span className="webmcp-live__waiting-dot" />
                    WAITING ON HUMAN — only a personal attestation can submit
                  </p>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
