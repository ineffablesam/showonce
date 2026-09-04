import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { RecipientApprovalModal } from '../components/adaptation/RecipientApprovalModal'
import { BrowserFrame } from '../components/browser/BrowserFrame'
import { NorthstarApp } from '../components/northstar/NorthstarApp'
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
import { handoffRecipientName } from '../lib/handoffRecipient'
import { useRecipientDecisionNotification } from '../hooks/useRecipientDecisionNotification'
import type { ShowOnceToolName } from '../webmcp/types'
import { useWebMCP } from '../webmcp/useWebMCP'

function submissionHintForPhase(
  phase: RecipientWorkflowRun['phase'],
  recipientName: string,
): string {
  switch (phase) {
    case 'confirmation':
      return 'Review the approval popup to submit your renewal.'
    case 'complete':
      return 'Your renewal is submitted.'
    default:
      return `${recipientName}, your assistant can help finish this on WaitingRoom.gov.`
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
  const [approvalOpen, setApprovalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [helperError, setHelperError] = useState<string>()
  const [submissionError, setSubmissionError] = useState<string>()
  const [addressConfirmed, setAddressConfirmed] = useState(true)
  const accountId =
    scenario === 'normal' ? 'recipient-normal' : 'recipient-unavailable'

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
  const workflow = useQuery<RecipientWorkflowRun>({
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
    setHelperError(undefined)
    try {
      assertHandoffPolicyAllows(handoff.data.policy, 'request_helper')
      const helpDetail: 'plan_unavailable' | 'material_price_change' =
        scenario === 'unavailable' ? 'plan_unavailable' : 'material_price_change'
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
        : await createHelpRequest(repositories, publicToken, {}, helpDetail)
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
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Could not send a request to the sender.'
      setHelperError(message)
      throw error
    }
  }, [
    handoff.data?.policy,
    preview,
    publicToken,
    queryClient,
    scenario,
    workflow.data,
  ])

  const openApproval = useCallback(
    async (planId?: string) => {
      if (preview || !workflow.data || !account.data) return
      const selectedPlanId = planId ?? account.data.selectedPlanId
      if (!selectedPlanId) return
      await repositories.handoffs
        .transitionByPublicToken(publicToken, 'waiting_confirmation')
        .catch(() => undefined)
      setRun({
        phase: 'confirmation',
        selectedPlanId,
        lastOutcome: 'human',
      })
      setApprovalOpen(true)
    },
    [account.data, preview, publicToken, setRun, workflow.data],
  )

  const onRequestHumanApproval = useCallback(() => {
    void openApproval()
  }, [openApproval])

  const webmcp = useRecipientWebMCP({
    publicToken,
    handoff: handoff.data ?? null,
    account: account.data ?? null,
    run: workflow.data ?? null,
    preview,
    onAccount: setAccount,
    onRun: setRun,
    onRequestHelper: askHelper,
    onRequestHumanApproval,
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
      if (result.ok && command.type === 'select_plan') {
        await openApproval(command.planId)
      }
      return result
    },
    [account.data, handoff.data?.policy, openApproval, publicToken, setAccount],
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
  const recipientName = handoffRecipientName(handoff.data?.recipient)
  const selectedPlan =
    account.data?.availablePlans.find(
      (plan) => plan.id === (account.data?.selectedPlanId ?? workflow.data?.selectedPlanId),
    ) ?? null

  useRecipientDecisionNotification(
    decision.data,
    workflow.data?.phase === 'awaiting_helper',
    helperToken,
  )

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

  const appliedDecisionRef = useRef<string | null>(null)

  const choosePlan = useCallback(
    async (planId: string, source: 'human' | 'helper' = 'human') => {
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
      setRun({
        phase: 'confirmation',
        selectedPlanId: planId,
        lastOutcome: source,
      })
      await openApproval(planId)
    },
    [
      account.data,
      handoff.data?.policy,
      openApproval,
      preview,
      publicToken,
      setAccount,
      setRun,
      workflow.data,
    ],
  )

  const continueFromDecision = useCallback(async () => {
    if (preview) return
    if (
      decision.data?.outcome === 'recommend_plan' &&
      decision.data.recommendedPlanId
    ) {
      await choosePlan(decision.data.recommendedPlanId, 'helper')
    } else if (decision.data?.outcome === 'let_recipient_decide') {
      setRun({ phase: 'adapted', lastOutcome: 'human_choice_requested' })
    }
  }, [choosePlan, decision.data, preview, setRun])

  useEffect(() => {
    if (preview || workflow.data?.phase !== 'awaiting_helper' || !decision.data) {
      return
    }
    if (appliedDecisionRef.current === decision.data.id) return
    appliedDecisionRef.current = decision.data.id
    void continueFromDecision()
  }, [continueFromDecision, decision.data, preview, workflow.data?.phase])

  // Registers WebMCP tools for this page.
  void webmcp

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
      if (result.ok) {
        queryClient.setQueryData(['account', accountId], result.account)
        queryClient.setQueryData(
          ['recipient-run', publicToken, scenario, preview],
          result.run,
        )
        setApprovalOpen(false)
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

  const loading = handoff.isPending || account.isPending || workflow.isPending
  if (loading) {
    return <div aria-label="Loading recipient handoff" className="page-loading" />
  }

  return (
    <div className="recipient-page recipient-page--focused">
      <header className="recipient-header recipient-header--minimal">
        <Link className="recipient-header__brand" to="/">
          <img
            alt="ShowOnce"
            className="recipient-header__logo"
            height={26}
            src="/logo.svg"
            width={34}
          />
        </Link>
        {handoff.data?.title ? (
          <span className="recipient-header__task-chip">{handoff.data.title}</span>
        ) : null}
        <div className="recipient-header__end">
          {preview ? <span className="pill">Preview</span> : null}
        </div>
      </header>

      {submissionError ? (
        <div className="recipient-banner recipient-banner--error" role="alert">
          {submissionError}
        </div>
      ) : null}
      {helperError ? (
        <div className="recipient-banner recipient-banner--error" role="alert">
          {helperError}
        </div>
      ) : null}

      <main
        className={
          phase === 'explain'
            ? 'recipient-main'
            : 'recipient-main recipient-main--northstar'
        }
      >
        {!handoff.data || !procedure || !account.data || !adaptation ? (
          <Card>
            <EmptyState
              detail="Ask the sender for a current recipient link."
              icon="lock"
              title="This handoff is unavailable"
            />
          </Card>
        ) : !recipientName ? (
          <Card>
            <EmptyState
              detail="Ask the sender to recreate this link with a recipient name."
              icon="lock"
              title="Recipient name missing"
            />
          </Card>
        ) : phase === 'explain' ? (
          <div className="recipient-intro">
            <span className="eyebrow">Shared link for {recipientName}</span>
            <h1>{recipientName}, you have a shared task</h1>
            <p>{handoff.data.title}</p>
            <span className="recipient-intro__app">
              <Icon name="lock" /> WaitingRoom.gov
            </span>
            {preview ? (
              <Link
                className="button button--primary button--large"
                params={{ publicToken }}
                search={{ preview: false, scenario }}
                to="/s/$publicToken"
              >
                Start live task <Icon name="arrow" />
              </Link>
            ) : (
              <button
                className="button button--primary button--large"
                onClick={() => void adapt()}
                type="button"
              >
                Open WaitingRoom.gov <Icon name="arrow" />
              </button>
            )}
          </div>
        ) : (
          <BrowserFrame url="waitingroom.gov/benefits/enroll">
            <NorthstarApp
              account={account.data}
              addressConfirmed={addressConfirmed}
              memberName={recipientName}
              mode="recipient"
              onAddressConfirm={() => setAddressConfirmed(true)}
              runCommand={runNorthstarCommand}
              submissionHint={submissionHintForPhase(phase, recipientName)}
            />
          </BrowserFrame>
        )}
      </main>

      {account.data && adaptation && recipientName && selectedPlan ? (
        <RecipientApprovalModal
          account={account.data}
          differences={adaptation.differences}
          monthlyPrice={selectedPlan.monthlyPrice}
          onClose={() => setApprovalOpen(false)}
          onConfirmAndSubmit={attestAndSubmit}
          open={approvalOpen}
          planName={selectedPlan.name}
          recipientName={recipientName}
          submitting={submitting}
        />
      ) : null}
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
  onRequestHumanApproval,
}: {
  publicToken: string
  handoff: PublicHandoff | null
  account: AccountState | null
  run: RecipientWorkflowRun | null
  preview: boolean
  onAccount: (account: AccountState) => void
  onRun: (update: Partial<RecipientWorkflowRun>) => void
  onRequestHelper: () => Promise<ReturnType<typeof createHelpRequest> extends Promise<infer T> ? T : never>
  onRequestHumanApproval: () => void
}) {
  const accountRef = useRef(account)
  const handoffRef = useRef(handoff)
  const runRef = useRef(run)
  const onAccountRef = useRef(onAccount)
  const onRunRef = useRef(onRun)
  const onRequestHelperRef = useRef(onRequestHelper)
  const onRequestHumanApprovalRef = useRef(onRequestHumanApproval)
  const startedRef = useRef(false)
  const statusTransitionRef = useRef<Promise<void>>(Promise.resolve())
  accountRef.current = account
  handoffRef.current = handoff
  runRef.current = run
  onAccountRef.current = onAccount
  onRunRef.current = onRun
  onRequestHelperRef.current = onRequestHelper
  onRequestHumanApprovalRef.current = onRequestHumanApproval

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
      onAccountRef.current(result.state)
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
    [markRunning, publicToken],
  )

  const onToolResult = useCallback(
    (name: ShowOnceToolName, result: unknown) => {
      if (name === 'showonce_compare_to_handoff') {
        onRunRef.current({ phase: 'adapted' })
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
      if (
        name === 'benefits_select_plan' &&
        typeof result === 'object' &&
        result !== null &&
        'ok' in result &&
        result.ok === true &&
        'state' in result &&
        typeof result.state === 'object' &&
        result.state !== null &&
        'selectedPlanId' in result.state &&
        typeof result.state.selectedPlanId === 'string'
      ) {
        onRunRef.current({
          phase: 'confirmation',
          selectedPlanId: result.state.selectedPlanId,
        })
      }
    },
    [publicToken],
  )

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
      getActiveHandoff: () => handoffRef.current,
      requestHelper: () => onRequestHelperRef.current(),
      getActiveHelpRequestId: () => runRef.current?.helperRequestId,
      onRequestHumanApproval: () => onRequestHumanApprovalRef.current(),
      onToolStart: markRunning,
      onToolResult,
      now: Date.now,
      createId: () => crypto.randomUUID(),
    }),
    [execute, markRunning, onToolResult, preview, publicToken],
  )
  return useWebMCP('recipient', context, !preview)
}
