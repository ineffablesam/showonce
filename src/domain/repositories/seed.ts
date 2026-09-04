import type { RepositorySeed, ShowOnceRepositories } from './types'
import type { Procedure } from '../model'

const SEEDED_PROCEDURE = {
  id: 'procedure-benefits-renewal',
  recordingId: 'recording-benefits-renewal',
  title: 'Renew annual benefits',
  createdAt: 1_788_384_000_000,
  sourceEventIds: ['seed-annual', 'seed-paperless', 'seed-gold'],
  steps: [
    {
      id: 'step-seed-annual',
      commandType: 'set_preference',
      policy: 'safe_preference',
      input: {
        type: 'set_preference',
        key: 'renewalFrequency',
        value: 'annual',
      },
    },
    {
      id: 'step-seed-paperless',
      commandType: 'set_preference',
      policy: 'safe_preference',
      input: { type: 'set_preference', key: 'paperless', value: true },
    },
    {
      id: 'step-seed-gold',
      commandType: 'select_plan',
      policy: 'availability_checked',
      input: {
        type: 'select_plan',
        planId: 'gold',
        observedMonthlyPrice: 88,
      },
    },
  ],
} satisfies Procedure

export const DEMO_SEED: RepositorySeed = {
  recordings: [
    {
      id: 'recording-benefits-renewal',
      title: 'Renew annual benefits',
      createdAt: 1_788_384_000_000,
      status: 'finished',
      events: [],
    },
  ],
  procedures: [SEEDED_PROCEDURE],
  handoffs: [
    {
      id: 'handoff-benefits-renewal',
      publicToken: 'seedHandoffToken_1234567',
      procedureId: 'procedure-benefits-renewal',
      title: 'Annual benefits renewal',
      createdAt: 1_788_384_060_000,
      updatedAt: 1_788_384_060_000,
      status: 'created',
      procedure: SEEDED_PROCEDURE,
      recipient: '',
    },
  ],
  activity: [
    {
      id: 'activity-demo-procedure',
      kind: 'command',
      timestamp: 1_788_384_000_000,
      source: 'human',
      outcome: 'applied',
    },
  ],
  decisions: [],
  accounts: [
    {
      id: 'samuel',
      availablePlans: [
        { id: 'silver', name: 'Silver', monthlyPrice: 62 },
        { id: 'gold', name: 'Gold', monthlyPrice: 88 },
        { id: 'platinum', name: 'Platinum', monthlyPrice: 126 },
      ],
      selectedPlanId: null,
      preferences: {
        paperless: false,
        communication: 'mail',
        renewalFrequency: 'monthly',
      },
      address: '41 Market Street',
      dependents: ['Jordan'],
      submittedAt: null,
    },
    {
      id: 'recipient-normal',
      availablePlans: [
        { id: 'silver', name: 'Silver', monthlyPrice: 96 },
        { id: 'gold', name: 'Gold', monthlyPrice: 142 },
      ],
      selectedPlanId: null,
      preferences: {
        paperless: false,
        communication: 'mail',
        renewalFrequency: 'monthly',
      },
      address: '121 Lincoln Street',
      dependents: ['Avery', 'Casey'],
      submittedAt: null,
    },
    {
      id: 'recipient-unavailable',
      availablePlans: [
        { id: 'silver', name: 'Silver', monthlyPrice: 96 },
        { id: 'platinum', name: 'Platinum', monthlyPrice: 180 },
      ],
      selectedPlanId: null,
      preferences: {
        paperless: false,
        communication: 'mail',
        renewalFrequency: 'monthly',
      },
      address: '121 Lincoln Street',
      dependents: ['Avery', 'Casey'],
      submittedAt: null,
    },
  ],
  helpRequests: [],
  runs: [],
}

// The local sandbox (recordings/accounts/runs) backs the demonstrator's and
// recipient's live demo state and must always reset cleanly. The shared/cloud
// collections
// (procedures, handoffs, activity, decisions, helpRequests) hold real
// persisted records once Supabase is configured, and their repositories
// intentionally refuse bulk replacement there ("Shared bulk replacement is
// not supported"). Reset those on a best-effort basis so a rejection from
// one never blocks the sandbox reset the teaching UI actually depends on.
const LOCAL_SANDBOX_KEYS = new Set(['recordings', 'accounts', 'runs'])

export async function resetDemo(
  repositories: ShowOnceRepositories,
): Promise<void> {
  const tasks: Array<[string, Promise<void>]> = [
    ['recordings', repositories.recordings.replaceAll(DEMO_SEED.recordings ?? [])],
    ['procedures', repositories.procedures.replaceAll(DEMO_SEED.procedures)],
    ['handoffs', repositories.handoffs.replaceAll(DEMO_SEED.handoffs)],
    ['activity', repositories.activity.replaceAll(DEMO_SEED.activity)],
    ['decisions', repositories.decisions.replaceAll(DEMO_SEED.decisions)],
    ['accounts', repositories.accounts.replaceAll(DEMO_SEED.accounts ?? [])],
    [
      'helpRequests',
      repositories.helpRequests.replaceAll(DEMO_SEED.helpRequests ?? []),
    ],
    ['runs', repositories.runs.replaceAll(DEMO_SEED.runs ?? [])],
  ]
  const results = await Promise.allSettled(tasks.map(([, task]) => task))
  for (const [index, result] of results.entries()) {
    if (result.status !== 'rejected') continue
    const [key] = tasks[index]
    if (LOCAL_SANDBOX_KEYS.has(key)) throw result.reason
    console.warn(`Reset demo: skipped shared "${key}" reset`, result.reason)
  }
}
