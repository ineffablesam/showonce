import { Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

import { Icon } from '../components/ui/Icon'
import type { IconName } from '../components/ui/Icon'

const primaryNavigation: Array<{
  label: string
  to: string
  icon: IconName
}> = [
  { label: 'Overview', to: '/app', icon: 'home' },
  { label: 'Recordings', to: '/recordings', icon: 'record' },
  { label: 'Handoffs', to: '/handoffs', icon: 'share' },
  { label: 'Needs input', to: '/needs-input', icon: 'help' },
  { label: 'Activity', to: '/activity', icon: 'activity' },
]

const secondaryNavigation: Array<{
  label: string
  to: string
  icon: IconName
}> = [
  { label: 'Shared library', to: '/shared', icon: 'archive' },
  { label: 'WebMCP', to: '/webmcp', icon: 'bolt' },
  { label: 'Settings', to: '/settings', icon: 'settings' },
]

function NavItems({
  items,
}: {
  items: typeof primaryNavigation
}) {
  return items.map((item) => (
    <Link
      activeOptions={{ exact: item.to === '/app' }}
      activeProps={{ className: 'sidebar__link sidebar__link--active' }}
      className="sidebar__link"
      key={item.to}
      to={item.to}
    >
      <Icon name={item.icon} />
      <span>{item.label}</span>
    </Link>
  ))
}

export function Sidebar({
  mobileOpen = false,
  onClose,
}: {
  mobileOpen?: boolean
  onClose?: () => void
}) {
  const [workspaceOpen, setWorkspaceOpen] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const sidebarRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (mobileOpen) closeButtonRef.current?.focus()
  }, [mobileOpen])

  return (
    <>
      {mobileOpen ? (
        <button
          aria-label="Close navigation"
          className="nav-scrim"
          onClick={onClose}
          type="button"
        />
      ) : null}
      <aside
        aria-label="Workspace navigation"
        aria-modal={mobileOpen ? true : undefined}
        className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}
        id="workspace-navigation"
        onKeyDown={(event) => {
          if (event.key === 'Escape') onClose?.()
          if (mobileOpen && event.key === 'Tab') {
            const focusable = [
              ...(sidebarRef.current?.querySelectorAll<HTMLElement>(
                'button:not([disabled]), a[href], input:not([disabled])',
              ) ?? []),
            ].filter((element) => element.offsetParent !== null)
            const first = focusable[0]
            const last = focusable.at(-1)
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault()
              last?.focus()
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault()
              first.focus()
            }
          }
        }}
        ref={sidebarRef}
        role={mobileOpen ? 'dialog' : undefined}
      >
      <button
        aria-label="Close navigation"
        className="sidebar__close"
        onClick={onClose}
        ref={closeButtonRef}
        type="button"
      >
        ×
      </button>
      <Link className="brand" to="/">
        <span className="brand__mark">
          <Icon name="spark" />
        </span>
        <span>ShowOnce</span>
      </Link>

      <button
        aria-expanded={workspaceOpen}
        className="workspace-select"
        onClick={() => setWorkspaceOpen((value) => !value)}
        type="button"
      >
        <span className="workspace-select__avatar">AS</span>
        <span>
          <small>Workspace</small>
          <strong>Acme Studio</strong>
        </span>
        <span className="workspace-select__chevron">⌄</span>
      </button>
      {workspaceOpen ? (
        <div className="workspace-menu" role="status">
          <strong>Acme Studio</strong>
          <small>Local demo workspace · selected</small>
        </div>
      ) : null}

      <nav aria-label="Workspace" className="sidebar__nav">
        <NavItems items={primaryNavigation} />
      </nav>

      <nav aria-label="Resources" className="sidebar__nav sidebar__nav--bottom">
        <NavItems items={secondaryNavigation} />
      </nav>

      <div className="sidebar__profile">
        <span className="profile-avatar">AM</span>
        <span>
          <strong>Alex Morgan</strong>
          <small>alex@acme.studio</small>
        </span>
        <span aria-hidden="true">•••</span>
      </div>
      </aside>
    </>
  )
}
