import { useMemo } from 'react'

import { compareProcedureToRecipient } from '../domain/adaptation/compareProcedureToRecipient'
import { executeCommand } from '../domain/commands/executeCommand'
import type { AccountState, Command } from '../domain/model'
import { repositories } from '../domain/repositories/appRepositories'
import { useWebMCP } from './useWebMCP'
import type { WebMCPScope } from './types'

const baseState: AccountState = {
  id: 'workspace-account',
  availablePlans: [],
  selectedPlanId: null,
  preferences: { paperless: true, communication: 'email' },
  address: '',
  dependents: [],
  submittedAt: null,
}

let accountState = baseState

export function useWorkspaceWebMCP(scope: WebMCPScope = 'library') {
  const context = useMemo(
    () => ({
      document: typeof document === 'undefined' ? undefined : document,
      repositories: {
        ...repositories,
        activity: { append: repositories.activity.save },
      },
      execute: (command: Command) => {
        const result = executeCommand({
          state: accountState,
          source: 'webmcp',
          now: Date.now(),
          createId: () => crypto.randomUUID(),
        }, command)
        accountState = result.state
        return result
      },
      compare: compareProcedureToRecipient,
      getRecipientState: () => accountState,
      getInitialState: () => baseState,
      now: () => Date.now(),
      createId: () => crypto.randomUUID(),
    }),
    [],
  )

  return useWebMCP(scope, context)
}
