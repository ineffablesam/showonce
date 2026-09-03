import type { ReactNode } from 'react'

import { Icon } from '../ui/Icon'

/**
 * Presentational browser-chrome wrapper. Renders in the same DOM as the
 * ShowOnce shell (no real iframe) so WebMCP tools registered on the
 * top-level document keep working, while visually communicating "this is a
 * separate website that ShowOnce is operating around."
 */
export function BrowserFrame({
  url,
  onRefresh,
  children,
}: {
  url: string
  onRefresh?: () => void
  children: ReactNode
}) {
  return (
    <div className="browser-frame">
      <div className="browser-frame__bar">
        <span className="browser-frame__dots">
          <span />
          <span />
          <span />
        </span>
        <span className="browser-frame__address">
          <Icon name="lock" />
          {url}
        </span>
        <span className="browser-frame__actions">
          <button
            aria-label="Refresh"
            className="browser-frame__icon-button"
            onClick={onRefresh}
            title="Refresh"
            type="button"
          >
            <Icon name="refresh" />
          </button>
          <button
            aria-label="Open in new tab (visual only in this demo)"
            className="browser-frame__icon-button"
            disabled
            title="Open externally"
            type="button"
          >
            <Icon name="external" />
          </button>
        </span>
      </div>
      <div className="browser-frame__viewport">{children}</div>
    </div>
  )
}
