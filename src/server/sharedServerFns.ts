import { createClient } from '@supabase/supabase-js'
import { createServerFn } from '@tanstack/react-start'

import type {
  ActivityEvent,
  Confirmation,
  Handoff,
  HandoffStatus,
  HelperDecision,
  HelpRequest,
  Procedure,
} from '../domain/model'
import { selectSharedPersistence } from '../domain/repositories/sharedRepositories'
import type {
  PublicHandoff,
  PublicHelpRequest,
} from '../domain/repositories/types'
import {
  assertPublicToken,
  validateActivity,
  validateDecision,
  validateHandoff,
  validateHelpRequest,
  validateProcedure,
} from '../domain/sharing/validation'
import { getOrCreateOwnerCapability } from './ownerCapability'
import {
  getOrCreateRecipientCapability,
  getRecipientCapability,
} from './recipientCapability'

function inputRecord(
  value: unknown,
  keys: readonly string[],
  requiredKeys: readonly string[] = keys,
): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Invalid server function input')
  }
  const record = value as Record<string, unknown>
  if (
    Object.keys(record).some((key) => !keys.includes(key)) ||
    requiredKeys.some((key) => !(key in record))
  ) {
    throw new Error('Invalid server function input shape')
  }
  return record
}

function optionalLookupInput(value: unknown): {
  id?: string
  recordingId?: string
} {
  const record = inputRecord(
    value,
    ['id', 'recordingId'],
    [],
  )
  const id = typeof record.id === 'string' ? record.id : undefined
  const recordingId =
    typeof record.recordingId === 'string' ? record.recordingId : undefined
  if ((!id && !recordingId) || (id && recordingId)) {
    throw new Error('Exactly one procedure lookup key is required')
  }
  return { id, recordingId }
}

function ownerIdInput(value: unknown): { id: string } {
  const record = inputRecord(value, ['id'])
  if (
    typeof record.id !== 'string' ||
    record.id.length === 0 ||
    record.id.length > 128
  ) {
    throw new Error('Invalid owner record lookup')
  }
  return { id: record.id }
}

function publicTokenInput(value: unknown): { publicToken: string } {
  const record = inputRecord(value, ['publicToken'])
  if (typeof record.publicToken !== 'string') throw new Error('Invalid public token')
  assertPublicToken(record.publicToken)
  return { publicToken: record.publicToken }
}

function confirmationInput(value: unknown): {
  publicToken: string
  confirmationToken: string
} {
  const record = inputRecord(value, ['publicToken', 'confirmationToken'])
  if (
    typeof record.publicToken !== 'string' ||
    typeof record.confirmationToken !== 'string'
  ) {
    throw new Error('Invalid confirmation input')
  }
  assertPublicToken(record.publicToken)
  if (!/^[A-Za-z0-9_-]{43}$/u.test(record.confirmationToken)) {
    throw new Error('Invalid confirmation token')
  }
  return {
    publicToken: record.publicToken,
    confirmationToken: record.confirmationToken,
  }
}

function rpcClient() {
  const url = process.env.SUPABASE_URL
  const anonKey = process.env.SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error(
      'Shared persistence is unavailable. Configure SUPABASE_URL and SUPABASE_ANON_KEY.',
    )
  }
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

async function unwrap<T>(
  operation: PromiseLike<{ data: T | null; error: { message: string } | null }>,
): Promise<T> {
  const { data, error } = await operation
  if (error) throw new Error(`Supabase RPC failed: ${error.message}`)
  return data as T
}

export const getSharedPersistenceMode = createServerFn({
  method: 'GET',
}).handler(() => {
  try {
    return selectSharedPersistence(
      {
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      },
      process.env.NODE_ENV ?? 'development',
    )
  } catch {
    return 'unavailable' as const
  }
})

export const ensureOwnerWorkspaceServer = createServerFn({
  method: 'POST',
}).handler(() => {
  getOrCreateOwnerCapability()
  return { ready: true as const }
})

export const createProcedureServer = createServerFn({ method: 'POST' })
  .validator((value: unknown) => {
    const record = inputRecord(value, ['procedure'])
    return {
      procedure: validateProcedure(record.procedure as Procedure),
    }
  })
  .handler(async ({ data }) => {
    await unwrap(
      rpcClient().rpc('create_procedure', {
        p_owner_token: getOrCreateOwnerCapability(),
        p_payload: data.procedure,
      }),
    )
  })

export const listProceduresServer = createServerFn({ method: 'GET' })
  .handler(() =>
    unwrap<Procedure[]>(
      rpcClient().rpc('list_owner_procedures', {
        p_owner_token: getOrCreateOwnerCapability(),
      }),
    ),
  )

export const getProcedureServer = createServerFn({ method: 'POST' })
  .validator(optionalLookupInput)
  .handler(({ data }) =>
    unwrap<Procedure | null>(
      rpcClient().rpc('get_owner_procedure', {
        p_owner_token: getOrCreateOwnerCapability(),
        p_external_id: data.id ?? null,
        p_recording_id: data.recordingId ?? null,
      }),
    ),
  )

export const deleteProcedureServer = createServerFn({ method: 'POST' })
  .validator(ownerIdInput)
  .handler(async ({ data }) => {
    await unwrap(
      rpcClient().rpc('delete_owner_procedure', {
        p_owner_token: getOrCreateOwnerCapability(),
        p_external_id: data.id,
      }),
    )
  })

export const createHandoffServer = createServerFn({ method: 'POST' })
  .validator((value: unknown) => {
    const record = inputRecord(value, ['handoff'])
    return {
      handoff: validateHandoff(record.handoff as Handoff),
    }
  })
  .handler(async ({ data }) => {
    await unwrap(
      rpcClient().rpc('create_handoff', {
        p_owner_token: getOrCreateOwnerCapability(),
        p_payload: data.handoff,
      }),
    )
  })

export const listHandoffsServer = createServerFn({ method: 'GET' })
  .handler(() =>
    unwrap<Handoff[]>(
      rpcClient().rpc('list_owner_handoffs', {
        p_owner_token: getOrCreateOwnerCapability(),
      }),
    ),
  )

export const getHandoffServer = createServerFn({ method: 'POST' })
  .validator(ownerIdInput)
  .handler(({ data }) =>
    unwrap<Handoff | null>(
      rpcClient().rpc('get_owner_handoff', {
        p_owner_token: getOrCreateOwnerCapability(),
        p_external_id: data.id,
      }),
    ),
  )

export const deleteHandoffServer = createServerFn({ method: 'POST' })
  .validator(ownerIdInput)
  .handler(async ({ data }) => {
    await unwrap(
      rpcClient().rpc('delete_owner_handoff', {
        p_owner_token: getOrCreateOwnerCapability(),
        p_external_id: data.id,
      }),
    )
  })

export const getPublicHandoffServer = createServerFn({ method: 'POST' })
  .validator(publicTokenInput)
  .handler(({ data }) =>
    unwrap<PublicHandoff | null>(
      rpcClient().rpc('get_public_handoff', {
        p_public_token: data.publicToken,
      }),
    ),
  )

export const markHandoffOpenedServer = createServerFn({ method: 'POST' })
  .validator(publicTokenInput)
  .handler(async ({ data }) => {
    const result = await unwrap<PublicHandoff | null>(
      rpcClient().rpc('mark_handoff_opened', {
        p_public_token: data.publicToken,
        p_recipient_token: getOrCreateRecipientCapability(),
      }),
    )
    if (!result) throw new Error('Handoff is unavailable or expired')
    return result
  })

export const transitionHandoffServer = createServerFn({ method: 'POST' })
  .validator((value: unknown) => {
    const record = inputRecord(value, ['publicToken', 'status'])
    if (typeof record.publicToken !== 'string') throw new Error('Invalid token')
    assertPublicToken(record.publicToken)
    const statuses: HandoffStatus[] = [
      'running',
      'needs_input',
      'waiting_confirmation',
    ]
    if (!statuses.includes(record.status as HandoffStatus)) {
      throw new Error('Invalid handoff transition status')
    }
    return {
      publicToken: record.publicToken,
      status: record.status as HandoffStatus,
    }
  })
  .handler(async ({ data }) => {
    const result = await unwrap<PublicHandoff | null>(
      rpcClient().rpc('transition_public_handoff', {
        p_public_token: data.publicToken,
        p_status: data.status,
      }),
    )
    if (!result) throw new Error('Handoff is unavailable or expired')
    return result
  })

export const createRecipientConfirmationServer = createServerFn({
  method: 'POST',
})
  .validator(publicTokenInput)
  .handler(async ({ data }) => {
    const result = await unwrap<Confirmation | null>(
      rpcClient().rpc('create_recipient_confirmation', {
        p_public_token: data.publicToken,
        p_recipient_token: getRecipientCapability(),
      }),
    )
    if (!result) throw new Error('Recipient confirmation could not be created')
    return result
  })

export const completeRecipientHandoffServer = createServerFn({
  method: 'POST',
})
  .validator(confirmationInput)
  .handler(async ({ data }) => {
    const result = await unwrap<PublicHandoff | null>(
      rpcClient().rpc('complete_recipient_handoff', {
        p_public_token: data.publicToken,
        p_recipient_token: getRecipientCapability(),
        p_confirmation_token: data.confirmationToken,
      }),
    )
    if (!result) throw new Error('Recipient handoff could not be completed')
    return result
  })

export const saveHelpRequestServer = createServerFn({ method: 'POST' })
  .validator((value: unknown) => {
    const record = inputRecord(value, ['request'])
    return {
      request: validateHelpRequest(record.request as HelpRequest),
    }
  })
  .handler(async ({ data }) => {
    await unwrap(
      rpcClient().rpc('save_owner_helper_request', {
        p_owner_token: getOrCreateOwnerCapability(),
        p_payload: data.request,
      }),
    )
  })

export const createHelpRequestServer = createServerFn({ method: 'POST' })
  .validator((value: unknown) => {
    const record = inputRecord(value, ['handoffToken', 'request'])
    if (typeof record.handoffToken !== 'string') throw new Error('Invalid token')
    assertPublicToken(record.handoffToken)
    const request = validateHelpRequest(record.request as HelpRequest)
    if (request.status !== 'open') {
      throw new Error('New helper request status must be open')
    }
    return {
      handoffToken: record.handoffToken,
      request,
    }
  })
  .handler(async ({ data }) => {
    await unwrap(
      rpcClient().rpc('create_helper_request', {
        p_handoff_token: data.handoffToken,
        p_payload: data.request,
      }),
    )
  })

export const listHelpRequestsServer = createServerFn({ method: 'GET' })
  .handler(() =>
    unwrap<HelpRequest[]>(
      rpcClient().rpc('list_owner_helper_requests', {
        p_owner_token: getOrCreateOwnerCapability(),
      }),
    ),
  )

export const getHelpRequestServer = createServerFn({ method: 'POST' })
  .validator(ownerIdInput)
  .handler(({ data }) =>
    unwrap<HelpRequest | null>(
      rpcClient().rpc('get_owner_helper_request', {
        p_owner_token: getOrCreateOwnerCapability(),
        p_external_id: data.id,
      }),
    ),
  )

export const getPublicHelpRequestServer = createServerFn({ method: 'POST' })
  .validator(publicTokenInput)
  .handler(({ data }) =>
    unwrap<PublicHelpRequest | null>(
      rpcClient().rpc('get_public_helper_request', {
        p_public_token: data.publicToken,
      }),
    ),
  )

export const saveDecisionServer = createServerFn({ method: 'POST' })
  .validator((value: unknown) => {
    const record = inputRecord(value, ['decision'])
    return {
      decision: validateDecision(record.decision as HelperDecision),
    }
  })
  .handler(async ({ data }) => {
    await unwrap(
      rpcClient().rpc('save_owner_decision', {
        p_owner_token: getOrCreateOwnerCapability(),
        p_payload: data.decision,
      }),
    )
  })

export const listDecisionsServer = createServerFn({ method: 'GET' })
  .handler(() =>
    unwrap<HelperDecision[]>(
      rpcClient().rpc('list_owner_decisions', {
        p_owner_token: getOrCreateOwnerCapability(),
      }),
    ),
  )

export const getDecisionServer = createServerFn({ method: 'POST' })
  .validator(ownerIdInput)
  .handler(({ data }) =>
    unwrap<HelperDecision | null>(
      rpcClient().rpc('get_owner_decision', {
        p_owner_token: getOrCreateOwnerCapability(),
        p_external_id: data.id,
      }),
    ),
  )

export const recordDecisionServer = createServerFn({ method: 'POST' })
  .validator((value: unknown) => {
    const record = inputRecord(value, ['requestToken', 'decision'])
    if (typeof record.requestToken !== 'string') throw new Error('Invalid token')
    assertPublicToken(record.requestToken)
    return {
      requestToken: record.requestToken,
      decision: validateDecision(record.decision as HelperDecision),
    }
  })
  .handler(({ data }) =>
    unwrap<HelperDecision>(
      rpcClient().rpc('record_helper_decision', {
        p_request_token: data.requestToken,
        p_payload: data.decision,
      }),
    ),
  )

export const pollDecisionServer = createServerFn({ method: 'POST' })
  .validator((value: unknown) => {
    const { publicToken } = publicTokenInput(value)
    return { requestToken: publicToken }
  })
  .handler(({ data }) =>
    unwrap<HelperDecision | null>(
      rpcClient().rpc('poll_helper_decision', {
        p_request_token: data.requestToken,
      }),
    ),
  )

export const appendActivityServer = createServerFn({ method: 'POST' })
  .validator((value: unknown) => {
    const record = inputRecord(value, ['event'])
    return {
      event: validateActivity(record.event as ActivityEvent),
    }
  })
  .handler(async ({ data }) => {
    await unwrap(
      rpcClient().rpc('append_owner_activity', {
        p_owner_token: getOrCreateOwnerCapability(),
        p_payload: data.event,
      }),
    )
  })

export const appendPublicActivityServer = createServerFn({ method: 'POST' })
  .validator((value: unknown) => {
    const record = inputRecord(value, ['handoffToken', 'event'])
    if (typeof record.handoffToken !== 'string') throw new Error('Invalid token')
    assertPublicToken(record.handoffToken)
    return {
      handoffToken: record.handoffToken,
      event: validateActivity(record.event as ActivityEvent),
    }
  })
  .handler(async ({ data }) => {
    await unwrap(
      rpcClient().rpc('append_public_activity', {
        p_handoff_token: data.handoffToken,
        p_payload: data.event,
      }),
    )
  })

export const listActivityServer = createServerFn({ method: 'GET' })
  .handler(() =>
    unwrap<ActivityEvent[]>(
      rpcClient().rpc('list_owner_activity', {
        p_owner_token: getOrCreateOwnerCapability(),
      }),
    ),
  )

export const getActivityServer = createServerFn({ method: 'POST' })
  .validator(ownerIdInput)
  .handler(({ data }) =>
    unwrap<ActivityEvent | null>(
      rpcClient().rpc('get_owner_activity', {
        p_owner_token: getOrCreateOwnerCapability(),
        p_external_id: data.id,
      }),
    ),
  )
