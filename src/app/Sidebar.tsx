import { Link } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

import { BrandMark } from '../components/ui/BrandMark'
import { Icon } from '../components/ui/Icon'
import type { IconName } from '../components/ui/Icon'
import {
  formatUsernameLabel,
  usernameInitials,
} from '../lib/workspaceUsername'

const SIDEBAR_WIDTH = 232
const SIDEBAR_COLLAPSED_WIDTH = 72

const sidebarTransition = {
  duration: 0.25,
  ease: [0.22, 1, 0.36, 1] as const,
}

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
  collapsed,
  items,
}: {
  collapsed: boolean
  items: typeof primaryNavigation
}) {
  return items.map((item) => (
    <Link
      activeOptions={{ exact: item.to === '/app' }}
      activeProps={{ className: 'sidebar__link sidebar__link--active' }}
      aria-label={collapsed ? item.label : undefined}
      className="sidebar__link"
      key={item.to}
      title={collapsed ? item.label : undefined}
      to={item.to}
    >
      <Icon name={item.icon} />
      <motion.span
        animate={{
          opacity: collapsed ? 0 : 1,
          width: collapsed ? 0 : 'auto',
        }}
        className="sidebar__link-label"
        initial={false}
        transition={sidebarTransition}
      >
        {item.label}
      </motion.span>
    </Link>
  ))
}

export function Sidebar({
  collapsed = false,
  mobileOpen = false,
  onClose,
  onToggleCollapsed,
  username,
  workspaceLabel,
}: {
  collapsed?: boolean
  mobileOpen?: boolean
  onClose?: () => void
  onToggleCollapsed?: () => void
  username: string
  workspaceLabel: string
}) {
  const [workspaceOpen, setWorkspaceOpen] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const sidebarRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (mobileOpen) closeButtonRef.current?.focus()
  }, [mobileOpen])

  useEffect(() => {
    if (collapsed) setWorkspaceOpen(false)
  }, [collapsed])

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
      <motion.aside
        animate={{
          width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        }}
        aria-label="Workspace navigation"
        aria-modal={mobileOpen ? true : undefined}
        className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''} ${mobileOpen ? 'sidebar--open' : ''}`}
        id="workspace-navigation"
        initial={false}
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
        transition={sidebarTransition}
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
        <Link aria-label="ShowOnce home" className="brand" to="/">
          <span className="brand__mark">
            <BrandMark height={14} width={18} />
          </span>
          <motion.span
            animate={{
              opacity: collapsed ? 0 : 1,
              width: collapsed ? 0 : 'auto',
            }}
            className="sidebar__brand-label"
            initial={false}
            transition={sidebarTransition}
          >
            ShowOnce
          </motion.span>
        </Link>

        <AnimatePresence initial={false}>
          {!collapsed ? (
            <motion.div
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              initial={{ opacity: 0, height: 0 }}
              transition={sidebarTransition}
            >
              <button
                aria-expanded={workspaceOpen}
                className="workspace-select"
                onClick={() => setWorkspaceOpen((value) => !value)}
                type="button"
              >
                <span className="workspace-select__avatar">
                  {usernameInitials(username)}
                </span>
                <span>
                  <small>Workspace</small>
                  <strong>{workspaceLabel}</strong>
                </span>
                <span className="workspace-select__chevron">⌄</span>
              </button>
              {workspaceOpen ? (
                <div className="workspace-menu" role="status">
                  <strong>{workspaceLabel}</strong>
                  <small>Signed in as {username}</small>
                </div>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <nav aria-label="Workspace" className="sidebar__nav">
          <NavItems collapsed={collapsed} items={primaryNavigation} />
        </nav>

        <nav aria-label="Resources" className="sidebar__nav sidebar__nav--bottom">
          <NavItems collapsed={collapsed} items={secondaryNavigation} />
        </nav>

        <div className="sidebar__profile">
          <span className="profile-avatar">{usernameInitials(username)}</span>
          <motion.span
            animate={{
              opacity: collapsed ? 0 : 1,
              width: collapsed ? 0 : 'auto',
            }}
            className="sidebar__profile-copy"
            initial={false}
            transition={sidebarTransition}
          >
            <strong>{formatUsernameLabel(username)}</strong>
            <small>{username}</small>
          </motion.span>
          <button
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="sidebar__collapse"
            onClick={onToggleCollapsed}
            type="button"
          >
            <motion.span
              animate={{ rotate: collapsed ? 180 : 0 }}
              className="sidebar__collapse-icon"
              initial={false}
              transition={sidebarTransition}
            >
              <Icon name={collapsed ? 'panelOpen' : 'panelClose'} />
            </motion.span>
          </button>
        </div>
      </motion.aside>
    </>
  )
}

export { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH }
