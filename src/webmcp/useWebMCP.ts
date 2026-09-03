import { useEffect, useState } from 'react'

import { registerWebMCPTools } from './registerTools'
import type {
  WebMCPRegistrationContext,
  WebMCPScope,
} from './types'

export interface WebMCPState {
  status: 'registering' | 'available' | 'unavailable' | 'error'
  registeredToolNames: string[]
  error?: Error
}

export function useWebMCP(
  scope: WebMCPScope,
  context: Omit<WebMCPRegistrationContext, 'scope'>,
  enabled = true,
): WebMCPState {
  const {
    document: contextDocument,
    repositories,
    execute,
    compare,
    getRecipientState,
    getInitialState,
    now,
    createId,
    getActiveHandoff,
    requestHelper,
    getActiveHelpRequestId,
    onToolStart,
    onToolResult,
  } = context
  const [state, setState] = useState<WebMCPState>({
    status: 'registering',
    registeredToolNames: [],
  })

  useEffect(() => {
    if (!enabled) {
      setState({ status: 'unavailable', registeredToolNames: [] })
      return
    }
    const controller = new AbortController()
    let cancelled = false
    let dispose: (() => void) | undefined
    setState({ status: 'registering', registeredToolNames: [] })

    void registerWebMCPTools(
      {
        document: contextDocument,
        scope,
        repositories,
        execute,
        compare,
        getRecipientState,
        getInitialState,
        now,
        createId,
        getActiveHandoff,
        requestHelper,
        getActiveHelpRequestId,
        onToolStart,
        onToolResult,
      },
      { signal: controller.signal },
    )
      .then((registration) => {
        dispose = registration.dispose
        if (cancelled) {
          registration.dispose()
          return
        }
        setState({
          status: registration.available ? 'available' : 'unavailable',
          registeredToolNames: registration.registeredToolNames,
        })
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            status: 'error',
            registeredToolNames: [],
            error: error instanceof Error ? error : new Error(String(error)),
          })
        }
      })

    return () => {
      cancelled = true
      controller.abort()
      dispose?.()
    }
  }, [
    contextDocument,
    repositories,
    execute,
    compare,
    getRecipientState,
    getInitialState,
    now,
    createId,
    getActiveHandoff,
    requestHelper,
    getActiveHelpRequestId,
    onToolStart,
    onToolResult,
    scope,
    enabled,
  ])

  return state
}
