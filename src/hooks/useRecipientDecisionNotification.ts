import { useEffect, useRef } from 'react'

import type { HelperDecision } from '../domain/model'
import { showDecisionReadyToast } from '../lib/inAppNotifications'
import { createSupabaseBrowser } from '../lib/supabaseBrowser'
import { getPublicRealtimeServer } from '../server/sharedServerFns'

type DecisionBroadcast = {
  decisionId?: string
  requestId?: string
  outcome?: string
  recommendedPlanId?: string
}

function readDecisionPayload(payload: unknown): DecisionBroadcast | null {
  if (!payload || typeof payload !== 'object') return null
  const record = payload as Record<string, unknown>
  const nested =
    record.payload && typeof record.payload === 'object'
      ? (record.payload as Record<string, unknown>)
      : record

  return {
    decisionId:
      typeof nested.decisionId === 'string' ? nested.decisionId : undefined,
    requestId:
      typeof nested.requestId === 'string' ? nested.requestId : undefined,
    outcome: typeof nested.outcome === 'string' ? nested.outcome : undefined,
    recommendedPlanId:
      typeof nested.recommendedPlanId === 'string'
        ? nested.recommendedPlanId
        : undefined,
  }
}

function notifyDecision(
  notifiedRef: { current: string | null },
  input: {
    id: string
    requestId: string
    outcome: 'recommend_plan' | 'let_recipient_decide'
    recommendedPlanId?: string
  },
) {
  if (notifiedRef.current === input.id) return
  notifiedRef.current = input.id
  showDecisionReadyToast({
    requestId: input.requestId,
    outcome: input.outcome,
    planLabel: input.recommendedPlanId,
  })
}

export function useRecipientDecisionNotification(
  decision: HelperDecision | null | undefined,
  awaitingHelper: boolean,
  helpRequestToken?: string,
) {
  const notifiedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!awaitingHelper || !helpRequestToken) return

    let cancelled = false
    const channelRef: { current?: ReturnType<
      ReturnType<typeof createSupabaseBrowser>['channel']
    > } = { current: undefined }

    void getPublicRealtimeServer().then((config) => {
      if (cancelled || !config) return

      const supabase = createSupabaseBrowser(config.url, config.anonKey)
      channelRef.current = supabase
        .channel(`help:${helpRequestToken}`)
        .on('broadcast', { event: 'decision_ready' }, ({ payload }) => {
          const event = readDecisionPayload(payload)
          if (
            !event?.decisionId ||
            !event.requestId ||
            (event.outcome !== 'recommend_plan' &&
              event.outcome !== 'let_recipient_decide')
          ) {
            return
          }

          notifyDecision(notifiedRef, {
            id: event.decisionId,
            requestId: event.requestId,
            outcome: event.outcome,
            recommendedPlanId: event.recommendedPlanId,
          })
        })
        .subscribe()
    })

    return () => {
      cancelled = true
      void channelRef.current?.unsubscribe()
    }
  }, [awaitingHelper, helpRequestToken])

  useEffect(() => {
    if (!awaitingHelper || !decision) return
    if (
      decision.outcome !== 'recommend_plan' &&
      decision.outcome !== 'let_recipient_decide'
    ) {
      return
    }

    notifyDecision(notifiedRef, {
      id: decision.id,
      requestId: decision.requestId,
      outcome: decision.outcome,
      recommendedPlanId: decision.recommendedPlanId,
    })
  }, [awaitingHelper, decision])
}
