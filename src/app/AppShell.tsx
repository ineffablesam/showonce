import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'

import { useWorkspaceNotifications } from '../hooks/useWorkspaceNotifications'
import { useWorkspaceSession } from '../hooks/useWorkspaceSession'
import { CreateShowOnceDialog } from './CreateShowOnceDialog'
import {
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_WIDTH,
  Sidebar,
} from './Sidebar'
import { TopBar } from './TopBar'
import { useWorkspaceWebMCP } from '../webmcp/useWorkspaceWebMCP'
import type { WebMCPState } from '../webmcp/useWebMCP'
import { repositories } from '../domain/repositories/appRepositories'
import { startRecording } from '../domain/integration/productFlow'
import { formatUsernameLabel } from '../lib/workspaceUsername'

const WebMCPContext = createContext<WebMCPState | null>(null)

const sidebarTransition = {
  duration: 0.25,
  ease: [0.22, 1, 0.36, 1] as const,
}

const SIDEBAR_STORAGE_KEY = 'showonce:sidebar-collapsed'

export function useAppWebMCP() {
  const state = useContext(WebMCPContext)
  if (!state) throw new Error('useAppWebMCP must be used inside AppShell')
  return state
}

export function AppShell({ children }: { children: ReactNode }) {
  const [creating, setCreating] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const createButtonRef = useRef<HTMLButtonElement>(null)
  const navigationButtonRef = useRef<HTMLButtonElement>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const session = useWorkspaceSession()
  const webmcp = useWorkspaceWebMCP('library')
  useWorkspaceNotifications(Boolean(session.data?.username))

  useEffect(() => {
    if (session.isPending) return
    if (!session.data?.username) {
      void navigate({ to: '/' })
    }
  }, [navigate, session.data?.username, session.isPending])

  useEffect(() => {
    if (typeof window === 'undefined') return
    setSidebarCollapsed(
      window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true',
    )
  }, [])

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((value) => {
      const next = !value
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next))
      return next
    })
  }

  if (session.isPending || !session.data?.username) {
    return <div aria-label="Loading workspace" className="page-loading" />
  }

  const username = session.data.username
  const workspaceLabel = `${formatUsernameLabel(username)} workspace`

  return (
    <WebMCPContext.Provider value={webmcp}>
      <motion.div
        animate={{
          gridTemplateColumns: sidebarCollapsed
            ? `${SIDEBAR_COLLAPSED_WIDTH}px minmax(0, 1fr)`
            : `${SIDEBAR_WIDTH}px minmax(0, 1fr)`,
        }}
        className="app-shell"
        initial={false}
        transition={sidebarTransition}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          mobileOpen={mobileOpen}
          onClose={() => {
            setMobileOpen(false)
            requestAnimationFrame(() => navigationButtonRef.current?.focus())
          }}
          onToggleCollapsed={toggleSidebarCollapsed}
          username={username}
          workspaceLabel={workspaceLabel}
        />
        <div className="app-shell__main">
          <TopBar
            createButtonRef={createButtonRef}
            onCreate={() => setCreating(true)}
            onOpenNavigation={() => setMobileOpen(true)}
            navigationButtonRef={navigationButtonRef}
            navigationOpen={mobileOpen}
            webmcp={webmcp}
          />
          <main className="app-main">{children}</main>
        </div>
        <CreateShowOnceDialog
          onClose={() => setCreating(false)}
          onCreate={async ({ name, description, targetApp }) => {
            const recording = await startRecording(repositories, name, {
              description,
              targetApp,
            })
            await queryClient.invalidateQueries({ queryKey: ['recordings'] })
            setCreating(false)
            await navigate({
              to: '/demo/benefits/$section',
              params: { section: 'renewal' },
              search: { recording: recording.id },
            })
          }}
          open={creating}
          returnFocusRef={createButtonRef}
        />
      </motion.div>
    </WebMCPContext.Provider>
  )
}
