import { queryOptions, useQuery } from '@tanstack/react-query'

import { repositories } from '../domain/repositories/appRepositories'

export const proceduresQuery = queryOptions({
  queryKey: ['procedures'],
  queryFn: () => repositories.procedures.list(),
  staleTime: 30_000,
})

export const handoffsQuery = queryOptions({
  queryKey: ['handoffs'],
  queryFn: () => repositories.handoffs.list(),
  staleTime: 30_000,
  refetchInterval: 10_000,
})

export const activityQuery = queryOptions({
  queryKey: ['activity'],
  queryFn: () => repositories.activity.list(),
  staleTime: 10_000,
})

export const recordingsQuery = queryOptions({
  queryKey: ['recordings'],
  queryFn: () => repositories.recordings.list(),
  staleTime: 10_000,
})

export const accountsQuery = queryOptions({
  queryKey: ['accounts'],
  queryFn: () => repositories.accounts.list(),
  staleTime: 5_000,
})

export const helpRequestsQuery = queryOptions({
  queryKey: ['help-requests'],
  queryFn: () => repositories.helpRequests.list(),
  staleTime: 5_000,
})

export function useWorkspaceOverview() {
  const procedures = useQuery(proceduresQuery)
  const handoffs = useQuery(handoffsQuery)
  const activity = useQuery(activityQuery)
  const recordings = useQuery(recordingsQuery)
  const helpRequests = useQuery(helpRequestsQuery)

  return {
    procedures,
    handoffs,
    activity,
    recordings,
    helpRequests,
    isPending:
      procedures.isPending ||
      handoffs.isPending ||
      activity.isPending ||
      recordings.isPending ||
      helpRequests.isPending,
    isError:
      procedures.isError ||
      handoffs.isError ||
      activity.isError ||
      recordings.isError ||
      helpRequests.isError,
  }
}
