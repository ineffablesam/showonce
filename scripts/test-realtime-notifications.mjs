import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env.local')
  const text = readFileSync(envPath, 'utf8')
  const env = {}
  for (const line of text.split('\n')) {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) env[match[1].trim()] = match[2].trim()
  }
  return env
}

async function ownerTokenHashHex(token) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(token),
  )
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function randomToken(length) {
  const alphabet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
  let token = ''
  for (let index = 0; index < length; index += 1) {
    token += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return token
}

function randomOwnerToken() {
  return `own_${randomToken(32)}`
}

function wait(ms) {
  return new Promise((resolveWait) => setTimeout(resolveWait, ms))
}

async function subscribeTopic(supabase, topic, event, timeoutMs = 8000) {
  let payload = null
  const channel = supabase.channel(topic).on('broadcast', { event }, (message) => {
    payload = message.payload ?? message
  })

  await new Promise((resolveSubscribe, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timed out waiting for ${event} on ${topic}`))
    }, timeoutMs)

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') resolveSubscribe(undefined)
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        clearTimeout(timer)
        reject(new Error(`Failed to subscribe to ${topic}: ${status}`))
      }
    })
  })

  return {
    channel,
    waitForPayload: async () => {
      const started = Date.now()
      while (!payload && Date.now() - started < timeoutMs) {
        await wait(100)
      }
      if (!payload) {
        throw new Error(`Timed out waiting for ${event} payload on ${topic}`)
      }
      return payload
    },
  }
}

async function main() {
  const env = loadEnv()
  const url = env.SUPABASE_URL
  const anonKey = env.SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env.local')
    process.exit(1)
  }

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const suffix = Date.now().toString(36)
  const ownerToken = randomOwnerToken()
  const channelKey = await ownerTokenHashHex(ownerToken)
  const workspaceTopic = `workspace:${channelKey}`
  const handoffToken = randomToken(24)
  const helpToken = randomToken(24)
  const now = Date.now()
  const expiresAt = now + 7 * 24 * 60 * 60 * 1000

  console.log('Supabase URL:', url)
  console.log('Owner topic:', workspaceTopic)
  console.log('Handoff token:', handoffToken)

  const workspaceListener = await subscribeTopic(
    supabase,
    workspaceTopic,
    'help_request_opened',
  )

  const procedure = {
    id: `proc-${suffix}`,
    recordingId: `rec-${suffix}`,
    title: 'Realtime notification test',
    createdAt: now,
    sourceEventIds: ['evt-1'],
    steps: [
      {
        id: 'step-1',
        commandType: 'set_preference',
        policy: 'safe_preference',
        input: { type: 'set_preference', key: 'paperless', value: true },
      },
    ],
  }

  const handoff = {
    id: `handoff-${suffix}`,
    publicToken: handoffToken,
    procedureId: procedure.id,
    title: 'Realtime notification handoff',
    createdAt: now,
    expiresAt,
    status: 'created',
    recipient: 'Jordan',
    policy: {
      allowSafePreferences: true,
      requireConfirmation: true,
      allowHelperEscalation: true,
    },
  }

  const helpRequest = {
    id: `help-${suffix}`,
    publicToken: helpToken,
    handoffId: handoff.id,
    createdAt: now,
    expiresAt,
    status: 'open',
    detail: 'plan_unavailable',
    options: ['silver', 'platinum', 'let_recipient_decide'],
  }

  console.log('Creating procedure…')
  const { error: procedureError } = await supabase.rpc('create_procedure', {
    p_owner_token: ownerToken,
    p_payload: procedure,
  })
  if (procedureError) throw new Error(`create_procedure: ${procedureError.message}`)

  console.log('Creating handoff…')
  const { error: handoffError } = await supabase.rpc('create_handoff', {
    p_owner_token: ownerToken,
    p_payload: handoff,
  })
  if (handoffError) throw new Error(`create_handoff: ${handoffError.message}`)

  console.log('Creating helper request (should trigger DB broadcast)…')
  const { error: helpError } = await supabase.rpc('create_helper_request', {
    p_handoff_token: handoffToken,
    p_payload: helpRequest,
  })
  if (helpError) throw new Error(`create_helper_request: ${helpError.message}`)

  const helpPayload = await workspaceListener.waitForPayload()
  console.log('✓ DB help_request_opened broadcast:', JSON.stringify(helpPayload))

  const helpTopic = `help:${helpToken}`
  console.log('Subscribing for decision on topic:', helpTopic)
  const decisionListener = await subscribeTopic(
    supabase,
    helpTopic,
    'decision_ready',
  )

  console.log('Saving owner decision (should trigger DB broadcast)…')
  const { error: decisionError } = await supabase.rpc('save_owner_decision', {
    p_owner_token: ownerToken,
    p_payload: {
      id: `decision-${suffix}`,
      requestId: helpRequest.id,
      outcome: 'recommend_plan',
      recommendedPlanId: 'silver',
      decidedAt: Date.now(),
    },
  })
  if (decisionError) throw new Error(`save_owner_decision: ${decisionError.message}`)

  const decisionPayload = await decisionListener.waitForPayload()
  console.log('✓ DB decision_ready broadcast:', JSON.stringify(decisionPayload))

  await workspaceListener.channel.unsubscribe()
  await decisionListener.channel.unsubscribe()

  console.log('\nMigration 005 realtime triggers verified end-to-end.')
}

main().catch((error) => {
  console.error('✗', error.message ?? error)
  process.exit(1)
})
