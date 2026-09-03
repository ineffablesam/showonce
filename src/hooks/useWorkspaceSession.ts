import { useQuery } from '@tanstack/react-query'

import { getWorkspaceSessionServer } from '../server/sharedServerFns'

export function workspaceSessionQuery() {
  return {
    queryKey: ['workspace-session'] as const,
    queryFn: () => getWorkspaceSessionServer(),
    staleTime: 60_000,
  }
}

export function useWorkspaceSession() {
  return useQuery(workspaceSessionQuery())
}
