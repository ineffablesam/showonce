import { createContext, useContext, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import { CreateShowOnceDialog } from './CreateShowOnceDialog'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { useWorkspaceWebMCP } from '../webmcp/useWorkspaceWebMCP'
import type { WebMCPState } from '../webmcp/useWebMCP'
import { repositories } from '../domain/repositories/appRepositories'
import { startRecording } from '../domain/integration/productFlow'

const WebMCPContext = createContext<WebMCPState | null>(null)

export function useAppWebMCP() {
  const state = useContext(WebMCPContext)
  if (!state) throw new Error('useAppWebMCP must be used inside AppShell')
  return state
}

export function AppShell({ children }: { children: ReactNode }) {
  const [creating, setCreating] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const createButtonRef = useRef<HTMLButtonElement>(null)
  const navigationButtonRef = useRef<HTMLButtonElement>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const webmcp = useWorkspaceWebMCP('library')

  return (
    <WebMCPContext.Provider value={webmcp}>
      <div className="app-shell">
        <Sidebar
          mobileOpen={mobileOpen}
          onClose={() => {
            setMobileOpen(false)
            requestAnimationFrame(() => navigationButtonRef.current?.focus())
          }}
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
      </div>
    </WebMCPContext.Provider>
  )
}
