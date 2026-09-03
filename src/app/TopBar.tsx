import { Link } from '@tanstack/react-router'
import type { RefObject } from 'react'

import { Icon } from '../components/ui/Icon'
import type { WebMCPState } from '../webmcp/useWebMCP'

export function getWebMCPPresentation(state: WebMCPState) {
  switch (state.status) {
    case 'available':
      return {
        label: 'WebMCP ready',
        shortLabel: 'Available',
        detail: `${state.registeredToolNames.length} real browser tools are registered for this page.`,
      }
    case 'registering':
      return {
        label: 'WebMCP registering',
        shortLabel: 'Registering',
        detail: 'Checking whether this browser exposes document.modelContext.',
      }
    case 'error':
      return {
        label: 'WebMCP error',
        shortLabel: 'Error',
        detail: `WebMCP registration failed: ${state.error?.message ?? 'Unknown error'}`,
      }
    case 'unavailable':
      return {
        label: 'WebMCP unavailable',
        shortLabel: 'Unavailable',
        detail:
          'This browser does not expose document.modelContext. Use Chrome 149+ with chrome://flags/#enable-webmcp-testing enabled, then relaunch. ShowOnce does not simulate tools.',
      }
  }
}

export function WebMCPStatus({ state }: { state: WebMCPState }) {
  const presentation = getWebMCPPresentation(state)

  return (
    <span
      aria-label={presentation.detail}
      className={`webmcp-status webmcp-status--${state.status}`}
      role="status"
      title={presentation.detail}
    >
      <span className="status-dot" />
      {presentation.label}
    </span>
  )
}

export function TopBar({
  onCreate,
  onOpenNavigation,
  webmcp,
  createButtonRef,
  navigationOpen,
  navigationButtonRef,
}: {
  onCreate: () => void
  onOpenNavigation: () => void
  webmcp: WebMCPState
  createButtonRef: RefObject<HTMLButtonElement | null>
  navigationOpen: boolean
  navigationButtonRef: RefObject<HTMLButtonElement | null>
}) {
  return (
    <header className="topbar">
      <button
        aria-controls="workspace-navigation"
        aria-expanded={navigationOpen}
        aria-label="Open navigation"
        className="mobile-menu"
        onClick={onOpenNavigation}
        ref={navigationButtonRef}
        type="button"
      >
        <Icon name="menu" />
      </button>
      <WebMCPStatus state={webmcp} />
      <Link className="topbar__help" to="/guide">
        <Icon name="help" />
        Guide
      </Link>
      <button
        className="button button--primary"
        onClick={onCreate}
        ref={createButtonRef}
        type="button"
      >
        <Icon name="plus" />
        New ShowOnce
      </button>
    </header>
  )
}
