import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

import { handoffRecipientName } from '../lib/handoffRecipient'
import { showNeedsInputToast } from '../lib/inAppNotifications'
import { createSupabaseBrowser } from '../lib/supabaseBrowser'
import { handoffsQuery, helpRequestsQuery } from '../lib/queries'
import { getWorkspaceRealtimeServer } from '../server/sharedServerFns'

type HelpRequestBroadcast = {
  requestId?: string
  handoffId?: string
  detail?: 'plan_unavailable' | 'material_price_change'
  helpToken?: string
  recipient?: string
}

function readBroadcastPayload(payload: unknown): HelpRequestBroadcast | null {
  if (!payload || typeof payload !== 'object') return null
  const record = payload as Record<string, unknown>
  const nested =
    record.payload && typeof record.payload === 'object'
      ? (record.payload as Record<string, unknown>)
      : record
  if (typeof nested.requestId !== 'string') return null
  return {
    requestId: nested.requestId,
    handoffId:
      typeof nested.handoffId === 'string' ? nested.handoffId : undefined,
    detail:
      nested.detail === 'material_price_change'
        ? 'material_price_change'
        : 'plan_unavailable',
    helpToken:
      typeof nested.helpToken === 'string' ? nested.helpToken : undefined,
    recipient:
      typeof nested.recipient === 'string' ? nested.recipient : undefined,
  }
}

export function useWorkspaceNotifications(enabled = true) {
  const queryClient = useQueryClient()
  const notifiedRef = useRef<Set<string>>(new Set())
  const mountedAtRef = useRef(Date.now())

  const requests = useQuery({
    ...helpRequestsQuery,
    enabled,
    refetchInterval: enabled ? 8000 : false,
  })

  const handoffs = useQuery({
    ...handoffsQuery,
    enabled,
  })

  useEffect(() => {
    if (!enabled) return

    let cancelled = false
    const channelRef: { current?: ReturnType<
      ReturnType<typeof createSupabaseBrowser>['channel']
    > } = { current: undefined }

    void getWorkspaceRealtimeServer().then((config) => {
      if (cancelled || !config) return

      const supabase = createSupabaseBrowser(config.url, config.anonKey)
      channelRef.current = supabase
        .channel(`workspace:${config.channelKey}`)
        .on('broadcast', { event: 'help_request_opened' }, ({ payload }) => {
          const event = readBroadcastPayload(payload)
          if (!event?.requestId || notifiedRef.current.has(event.requestId)) {
            return
          }

          notifiedRef.current.add(event.requestId)
          showNeedsInputToast({
            requestId: event.requestId,
            detail: event.detail ?? 'plan_unavailable',
            helpToken: event.helpToken,
            recipient: event.recipient,
          })
          void queryClient.invalidateQueries({ queryKey: ['help-requests'] })
          void queryClient.invalidateQueries({ queryKey: ['handoffs'] })
        })
        .subscribe()
    })

    return () => {
      cancelled = true
      void channelRef.current?.unsubscribe()
    }
  }, [enabled, queryClient])

  useEffect(() => {
    if (!enabled || !requests.data || !handoffs.data) return

    for (const request of requests.data) {
      if (request.status !== 'open' || !request.publicToken) continue
      if (notifiedRef.current.has(request.id)) continue
      if (request.createdAt < mountedAtRef.current - 500) continue

      notifiedRef.current.add(request.id)
      const handoff = handoffs.data.find((item) => item.id === request.handoffId)
      showNeedsInputToast({
        requestId: request.id,
        detail: request.detail,
        helpToken: request.publicToken,
        recipient: handoffRecipientName(handoff?.recipient) ?? undefined,
      })
    }
  }, [enabled, handoffs.data, requests.data])
}
