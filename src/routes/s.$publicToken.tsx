import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useCallback, useMemo, useRef, useState } from 'react'

import { WebMCPStatus } from '../app/TopBar'
import { AdaptationPanel } from '../components/adaptation/AdaptationPanel'
import { ConfirmationGate } from '../components/adaptation/ConfirmationGate'
import { NorthstarApp } from '../components/northstar/NorthstarApp'
import type { WebMCPInvocation } from '../components/northstar/WebMCPLivePanel'
import { WebMCPLivePanel } from '../components/northstar/WebMCPLivePanel'
import { Card, EmptyState } from '../components/ui/Card'
import { Icon } from '../components/ui/Icon'
import { compareProcedureToRecipient } from '../domain/adaptation/compareProcedureToRecipient'
import { executeCommand } from '../domain/commands/executeCommand'
import {
  applyRecipientCommand,
  attestAndSubmitRenewal,
  createDemoAccount,
  createHelpRequest,
  createRecipientAccount,
  createRecipientWorkflow,
  updateRecipientWorkflow,
} from '../domain/integration/productFlow'
import type {
  AccountState,
  ActivityEvent,
  Command,
  RecipientWorkflowRun,
} from '../domain/model'
import { repositories } from '../domain/repositories/appRepositories'
import type { PublicHandoff } from '../domain/repositories/types'
import { assertHandoffPolicyAllows } from '../domain/sharing/handoffPolicy'
import type { ShowOnceToolName } from '../webmcp/types'
import { useWebMCP } from '../webmcp/useWebMCP'

function submissionHintForPhase(
  phase: RecipientWorkflowRun['phase'],
): string {
  switch (phase) {
    case 'confirmation':
      return 'Awaiting your approval in the ShowOnce panel →'
    case 'complete':
      return 'Submitted and confirmed.'
    default:
      return 'Choose a plan in the ShowOnce panel to continue →'
  }
}

export const Route = createFileRoute('/s/$publicToken')({
  validateSearch: (search: Record<string, unknown>) => ({
    scenario:
      search.scenario === 'unavailable'
        ? ('unavailable' as const)
        : ('normal' as const),
    preview: search.preview === true || search.preview === 'true',
  }),
  component: RecipientRoute,
})

function RecipientRoute() {
  const { publicToken } = Route.useParams()
  const { preview, scenario } = Route.useSearch()
  const queryClient = useQueryClient()
  const [choosing, setChoosing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState<string>()
  const [addressConfirmed, setAddressConfirmed] = useState(true)
  const [lastInvocation, setLastInvocation] = useState<WebMCPInvocation | null>(
    null,
  )
  const onInvocation = useCallback(
    (tool: string, source: 'webmcp' | 'human' = 'webmcp') => {
      setLastInvocation({ tool, at: Date.now(), source })
    },
    [],
  )
  const accountId = scenario === 'normal' ? 'mom-normal' : 'mom-unavailable'

  const handoff = useQuery({
    queryKey: ['public-handoff', publicToken, preview],
    queryFn: async () => {
      const available =
        await repositories.handoffs.getByPublicToken(publicToken)
      if (!available) return null
      if (preview) return available
      return repositories.handoffs.markOpened(publicToken)
    },
  })
  const account = useQuery({
    queryKey: ['account', accountId],
    queryFn: async () =>
      (await repositories.accounts.get(accountId)) ??
      createRecipientAccount(scenario),
  })
  const workflow = useQuery({
    queryKey: ['recipient-run', publicToken, scenario, preview],
    queryFn: () =>
      preview
        ? Promise.resolve({
            id: `preview-${publicToken}`,
            handoffId: publicToken,
            scenario,
            accountId,
            phase: 'explain' as const,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
        : createRecipientWorkflow(
            repositories,
            publicToken,
            scenario,
            accountId,
          ),
  })
  const helperToken = workflow.data?.helperRequestId
  const decision = useQuery({
    queryKey: ['helper-decision', helperToken],
    queryFn: () =>
      helperToken
        ? repositories.decisions.pollByRequestToken(helperToken)
        : Promise.resolve(null),
    enabled: Boolean(helperToken),
    refetchInterval: 2_500,
  })

  const setAccount = useCallback(
    (next: AccountState) => {
      queryClient.setQueryData(['account', accountId], next)
      void repositories.accounts.save(next)
    },
    [accountId, queryClient],
  )
  const setRun = useCallback(
    (update: Partial<RecipientWorkflowRun>) => {
      const key = ['recipient-run', publicToken, scenario, preview] as const
      const current = queryClient.getQueryData<RecipientWorkflowRun>(key)
      if (!current) return
      const next = { ...current, ...update, updatedAt: Date.now() }
      queryClient.setQueryData(key, next)
      void repositories.runs.save(next)
    },
    [preview, publicToken, queryClient, scenario],
  )

  const askHelper = useCallback(async () => {
    if (preview) throw new Error('Preview mode is read-only')
    if (!workflow.data) throw new Error('Workflow unavailable')
    if (!handoff.data?.policy) throw new Error('Handoff policy unavailable')
    assertHandoffPolicyAllows(handoff.data.policy, 'request_helper')
    const existing = workflow.data.helperRequestId
      ? await repositories.helpRequests.getByPublicToken(
          workflow.data.helperRequestId,
        )
      : null
    const request = existing
      ? {
          id: existing.publicToken,
          publicToken: existing.publicToken,
          handoffId: publicToken,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          expiresAt: existing.expiresAt,
          status: existing.status,
          detail: existing.detail,
          options: existing.options,
        }
      : await createHelpRequest(repositories, publicToken)
    const next = await updateRecipientWorkflow(repositories, workflow.data, {
      phase: 'awaiting_helper',
      helperRequestId: request.publicToken,
    })
    queryClient.setQueryData(
      ['recipient-run', publicToken, scenario, preview],
      next,
    )
    await repositories.handoffs.transitionByPublicToken(
      publicToken,
      'needs_input',
    )
    return request
  }, [
    handoff.data?.policy,
    preview,
    publicToken,
    queryClient,
    scenario,
    workflow.data,
  ])

  const webmcp = useRecipientWebMCP({
    publicToken,
    handoff: handoff.data ?? null,
    account: account.data ?? null,
    run: workflow.data ?? null,
    preview,
    onAccount: setAccount,
    onRun: setRun,
    onRequestHelper: askHelper,
    onInvocation,
  })

  const runNorthstarCommand = useCallback(
    async (command: Command) => {
      if (!account.data) throw new Error('Recipient account unavailable')
      const result = await applyRecipientCommand(
        repositories,
        account.data,
        command,
        {
          handoffToken: publicToken,
          policy: handoff.data?.policy,
        },
      )
      setAccount(result.state)
      return result
    },
    [account.data, handoff.data?.policy, publicToken, setAccount],
  )

  const procedure = handoff.data?.procedure
  const adaptation =
    procedure && account.data
      ? compareProcedureToRecipient(
          procedure,
          createDemoAccount(),
          account.data,
        )
      : null
  const phase = workflow.data?.phase ?? 'explain'
  // The recipient's name is a free-text story detail set when the sender
  // created the handoff — it is never a fixed persona in the product itself.
  const recipientName = handoff.data?.recipient ?? 'the recipient'

  const adapt = async () => {
    if (preview) return
    if (!adaptation || !account.data || !workflow.data) return
    await repositories.handoffs.transitionByPublicToken(publicToken, 'running')
    let current = account.data
    const safeCommands = handoff.data?.policy.allowSafePreferences
      ? adaptation.safeActions.filter(
          (candidate) => candidate.type === 'set_preference',
        )
      : []
    for (const command of safeCommands) {
      current = (
        await applyRecipientCommand(repositories, current, command, {
          handoffToken: publicToken,
          policy: handoff.data?.policy,
        })
      ).state
    }
    setAccount(current)
    if (adaptation.needsJudgment) {
      await repositories.handoffs.transitionByPublicToken(
        publicToken,
        'needs_input',
      )
    }
    const next = await updateRecipientWorkflow(repositories, workflow.data, {
      phase: 'adapted',
      lastOutcome: 'safe_preferences_applied',
    })
    queryClient.setQueryData(
      ['recipient-run', publicToken, scenario, preview],
      next,
    )
  }

  const choosePlan = async (
    planId: string,
    source: 'human' | 'helper' = 'human',
  ) => {
    if (preview) return
    if (!account.data || !workflow.data) return
    const result = await applyRecipientCommand(
      repositories,
      account.data,
      {
        type: 'select_plan',
        planId,
      },
      { handoffToken: publicToken, policy: handoff.data?.policy },
    )
    if (!result.ok) return
    setAccount(result.state)
    setChoosing(false)
    setRun({
      phase: 'confirmation',
      selectedPlanId: planId,
      lastOutcome: source,
    })
  }

  // The single atomic human action: check the attestation box, click once,
  // and — in one call — a HUMAN `recipient_attestation` event is recorded
  // and `submitRenewal()` runs through the exact same domain command layer
  // used everywhere else. No second WebMCP turn is required or possible.
  const attestAndSubmit = async () => {
    if (preview) return
    if (
      !account.data ||
      !workflow.data ||
      account.data.submittedAt !== null
    ) return
    setSubmitting(true)
    setSubmissionError(undefined)
    try {
      const result = await attestAndSubmitRenewal(
        repositories,
        account.data,
        workflow.data,
        { handoffToken: publicToken },
      )
      onInvocation('recipient_attestation', 'human')
      if (result.ok) {
        onInvocation('submit_renewal', 'human')
        queryClient.setQueryData(['account', accountId], result.account)
        queryClient.setQueryData(
          ['recipient-run', publicToken, scenario, preview],
          result.run,
        )
      } else {
        queryClient.setQueryData(
          ['recipient-run', publicToken, scenario, preview],
          result.run,
        )
        setSubmissionError(
          'Completion failed. Your renewal was not submitted; please retry.',
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  const continueFromDecision = async () => {
    if (preview) return
    if (
      decision.data?.outcome === 'recommend_plan' &&
      decision.data.recommendedPlanId
    ) {
      await choosePlan(decision.data.recommendedPlanId, 'helper')
    } else if (decision.data?.outcome === 'let_recipient_decide') {
      setChoosing(true)
      setRun({ phase: 'adapted', lastOutcome: 'human_choice_requested' })
    }
  }

  const loading = handoff.isPending || account.isPending || workflow.isPending
  if (loading) {
    return <div aria-label="Loading recipient handoff" className="page-loading" />
  }

  return (
    <div className="recipient-page">
      <header className="recipient-header">
        <Link className="brand" to="/">
          <span className="brand__mark"><Icon name="spark" /></span> ShowOnce
        </Link>
        {preview ? <span className="pill">DEMO PREVIEW</span> : null}
        {preview ? (
          <span
            aria-label="WebMCP tools are paused in read-only preview. Start the live adaptation to register them."
            className="webmcp-status webmcp-status--unavailable"
            role="status"
          >
            <span className="status-dot" />
            WebMCP paused in preview
          </span>
        ) : (
          <WebMCPStatus state={webmcp} />
        )}
      </header>
      <main className="recipient-main">
        {submissionError ? (
          <Card>
            <p role="alert">{submissionError}</p>
          </Card>
        ) : null}
        {!handoff.data || !procedure || !account.data || !adaptation ? (
          <Card>
            <EmptyState
              detail="Ask the sender for a current recipient link."
              title="This handoff is unavailable"
            />
          </Card>
        ) : phase === 'explain' ? (
          <div className="recipient-intro">
            <span className="eyebrow">Shared by Samuel</span>
            <h1>Samuel shared a task with you</h1>
            <p>{handoff.data.title}</p>
            <span className="recipient-intro__app">
              <Icon name="lock" /> Northstar Benefits
            </span>
            {preview ? (
              <Link
                className="button button--primary button--large"
                params={{ publicToken }}
                search={{ preview: false, scenario }}
                to="/s/$publicToken"
              >
                Start live adaptation <Icon name="arrow" />
              </Link>
            ) : (
              <button
                className="button button--primary button--large"
                onClick={() => void adapt()}
                type="button"
              >
                Open task <Icon name="arrow" />
              </button>
            )}
          </div>
        ) : (
          <div className="northstar-shell">
            <div className="northstar-shell__frame">
              <NorthstarApp
                account={account.data}
                addressConfirmed={addressConfirmed}
                memberName={recipientName}
                mode="recipient"
                onAddressConfirm={() => setAddressConfirmed(true)}
                runCommand={runNorthstarCommand}
                submissionHint={submissionHintForPhase(phase)}
              />
            </div>
            <aside className="northstar-shell__panel">
              <WebMCPLivePanel
                lastInvocation={lastInvocation}
                waitingOnHuman={phase === 'confirmation'}
                webmcp={webmcp}
              />
              {phase === 'adapted' ||
              phase === 'awaiting_helper' ||
              phase === 'helper_resolved' ? (
                <>
                  <AdaptationPanel
                    onAsk={() => void askHelper()}
                    onChoose={() => {
                      if (scenario === 'normal') void choosePlan('gold')
                      else setChoosing(true)
                    }}
                    recipient={account.data}
                    result={adaptation}
                    scenario={scenario}
                  />
                  {choosing ? (
                    <Card className="plan-choices">
                      {account.data.availablePlans.map((plan) => (
                        <button
                          key={plan.id}
                          onClick={() => void choosePlan(plan.id)}
                          type="button"
                        >
                          {plan.name} · ${plan.monthlyPrice}/month
                        </button>
                      ))}
                    </Card>
                  ) : null}
                  {helperToken ? (
                    <Card className="helper-request-card">
                      <h3>
                        {decision.data ? 'Decision received' : 'Waiting for helper'}
                      </h3>
                      <Link
                        params={{ publicToken: helperToken }}
                        to="/help/$publicToken"
                      >
                        Open minimum-information request
                      </Link>
                      {decision.data ? (
                        <button
                          className="button button--primary"
                          onClick={() => void continueFromDecision()}
                          type="button"
                        >
                          Continue
                        </button>
                      ) : null}
                    </Card>
                  ) : null}
                </>
              ) : phase === 'confirmation' ? (
                <ConfirmationGate
                  account={account.data}
                  differences={adaptation.differences}
                  monthlyPrice={
                    account.data.availablePlans.find(
                      (plan) => plan.id === account.data.selectedPlanId,
                    )?.monthlyPrice ?? 0
                  }
                  onConfirmAndSubmit={attestAndSubmit}
                  planName={
                    account.data.availablePlans.find(
                      (plan) => plan.id === account.data.selectedPlanId,
                    )?.name ?? 'Selected plan'
                  }
                  recipientName={recipientName}
                  submitting={submitting}
                />
              ) : (
                <Card className="completion-card completion-card--compact">
                  <span className="completion-card__mark" data-state="in">
                    <Icon name="check" />
                  </span>
                  <span className="eyebrow">Done</span>
                  <h1>{recipientName}’s plan is renewed.</h1>
                  <p>
                    {recipientName}’s benefits are submitted. The handoff
                    completed with recipient confirmation.
                  </p>
                  <div className="adaptation-facts">
                    <Card>
                      <strong>Original actions</strong>
                      <span>{procedure.steps.length}</span>
                    </Card>
                    <Card>
                      <strong>Reused</strong>
                      <span>{adaptation.matches.length}</span>
                    </Card>
                    <Card>
                      <strong>Adapted</strong>
                      <span>{adaptation.safeActions.length}</span>
                    </Card>
                    <Card>
                      <strong>Skipped</strong>
                      <span>{adaptation.skippedActions.length}</span>
                    </Card>
                    <Card>
                      <strong>Decision count</strong>
                      <span>{adaptation.needsJudgment ? 1 : 0}</span>
                    </Card>
                    <Card>
                      <strong>Credentials shared</strong>
                      <span>0</span>
                    </Card>
                  </div>
                  <div className="decision-card__actions">
                    <Link className="button button--primary" to="/activity">
                      View activity
                    </Link>
                    <Link className="button button--ghost" to="/app">
                      Back to dashboard
                    </Link>
                  </div>
                </Card>
              )}
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}

function useRecipientWebMCP({
  publicToken,
  handoff,
  account,
  run,
  preview,
  onAccount,
  onRun,
  onRequestHelper,
  onInvocation,
}: {
  publicToken: string
  handoff: PublicHandoff | null
  account: AccountState | null
  run: RecipientWorkflowRun | null
  preview: boolean
  onAccount: (account: AccountState) => void
  onRun: (update: Partial<RecipientWorkflowRun>) => void
  onRequestHelper: () => Promise<ReturnType<typeof createHelpRequest> extends Promise<infer T> ? T : never>
  onInvocation: (tool: string) => void
}) {
  const accountRef = useRef(account)
  const handoffRef = useRef(handoff)
  const runRef = useRef(run)
  const startedRef = useRef(false)
  const statusTransitionRef = useRef<Promise<void>>(Promise.resolve())
  accountRef.current = account
  handoffRef.current = handoff
  runRef.current = run

  const markRunning = useCallback(async () => {
    if (startedRef.current) {
      await statusTransitionRef.current
      return
    }
    startedRef.current = true
    statusTransitionRef.current = repositories.handoffs
      .transitionByPublicToken(publicToken, 'running')
      .then(() => undefined)
    await statusTransitionRef.current
  }, [publicToken])

  const execute = useCallback(
    (command: Command) => {
      const current = accountRef.current
      if (!current) throw new Error('Recipient state is still loading')
      if (!startedRef.current) {
        void markRunning()
      }
      // No WebMCP tool ever issues `submit_renewal` — that only happens
      // inside the human-only `attestAndSubmitRenewal` handler — so every
      // command executed here is a safe, reversible preparation step.
      const result = executeCommand(
        {
          state: current,
          source: 'webmcp',
          now: Date.now(),
          createId: () => crypto.randomUUID(),
        },
        command,
      )
      accountRef.current = result.state
      onAccount(result.state)
      void repositories.activity.appendForHandoffToken(publicToken, {
        id: `activity-${result.event.id}`,
        kind: 'command',
        timestamp: result.event.timestamp,
        source: 'webmcp',
        commandType: result.event.commandType,
        policy: result.event.policy,
        outcome: result.ok ? 'applied' : 'refused',
      })
      if (result.reason === 'judgment_required') {
        statusTransitionRef.current = statusTransitionRef.current.then(() =>
          repositories.handoffs
            .transitionByPublicToken(publicToken, 'needs_input')
            .then(() => undefined),
        )
      }
      return result
    },
    [markRunning, onAccount, publicToken],
  )

  const activeHandoff = handoff
  const context = useMemo(
    () => ({
      document:
        preview || typeof document === 'undefined' ? undefined : document,
      repositories: {
        ...repositories,
        activity: {
          append: (event: ActivityEvent) =>
            repositories.activity.appendForHandoffToken(publicToken, event),
        },
      },
      execute,
      compare: compareProcedureToRecipient,
      getRecipientState: () => {
        if (!accountRef.current) throw new Error('Recipient account unavailable')
        return accountRef.current
      },
      getInitialState: createDemoAccount,
      getActiveHandoff: () => activeHandoff,
      requestHelper: onRequestHelper,
      getActiveHelpRequestId: () => runRef.current?.helperRequestId,
      onToolStart: markRunning,
      onToolResult: (name: ShowOnceToolName, result: unknown) => {
        onInvocation(name)
        if (name === 'showonce_compare_to_handoff') {
          onRun({ phase: 'adapted' })
          if (
            typeof result === 'object' &&
            result !== null &&
            'needsJudgment' in result &&
            result.needsJudgment === true
          ) {
            statusTransitionRef.current = statusTransitionRef.current.then(() =>
              repositories.handoffs
                .transitionByPublicToken(publicToken, 'needs_input')
                .then(() => undefined),
            )
          }
        }
        // The agent's last possible step: once it has prepared a valid
        // renewal, the run is (already) in the AWAITING HUMAN APPROVAL
        // phase and there is nothing left for any WebMCP tool to do.
      },
      now: Date.now,
      createId: () => crypto.randomUUID(),
    }),
    [
      activeHandoff,
      execute,
      markRunning,
      onInvocation,
      onRequestHelper,
      onRun,
      preview,
      publicToken,
    ],
  )
  return useWebMCP('recipient', context, !preview)
}
