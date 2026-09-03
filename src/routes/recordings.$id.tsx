import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { AppShell } from '../app/AppShell'
import { CreateHandoffDialog } from '../components/handoffs/CreateHandoffDialog'
import type { HandoffFormValues } from '../components/handoffs/CreateHandoffDialog'
import { Button } from '../components/ui/Button'
import { Card, EmptyState } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Icon } from '../components/ui/Icon'
import { describeCommand } from '../domain/presentation/describeCommand'
import { createHandoff } from '../domain/integration/productFlow'
import type { ProcedureStep } from '../domain/model'
import { repositories } from '../domain/repositories/appRepositories'

const NEVER_TRANSFER = [
  'Credentials',
  'Session data',
  'Screen selectors or coordinates',
]

function bucketSteps(steps: ProcedureStep[]) {
  return {
    carryOver: steps.filter(
      (step) => step.policy === 'safe_preference' || step.policy === 'availability_checked',
    ),
    adapt: steps.filter((step) => step.policy === 'recipient_specific'),
    alwaysAsk: steps.filter(
      (step) => step.policy === 'confirmation_required' || step.policy === 'state_check',
    ),
  }
}

export const Route = createFileRoute('/recordings/$id')({
  component: RecordingDetail,
})

const tabs = ['Overview', 'Steps', 'Rules', 'Runs', 'Activity'] as const

function RecordingDetail() {
  const { id } = Route.useParams()
  const [tab, setTab] = useState<(typeof tabs)[number]>('Overview')
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const recording = useQuery({
    queryKey: ['recording', id],
    queryFn: () => repositories.recordings.get(id),
  })
  const procedure = useQuery({
    queryKey: ['procedure-by-recording', id],
    queryFn: () => repositories.procedures.getByRecordingId(id),
  })
  const handoff = useMutation({
    mutationFn: async (value: HandoffFormValues) => {
      if (!procedure.data) throw new Error('Procedure not ready')
      return createHandoff(repositories, procedure.data, value.title, {
        recipient: value.recipient,
        note: value.note || undefined,
        expiresAt: Date.now() + value.expirationDays * 24 * 60 * 60 * 1000,
        policy: {
          allowSafePreferences: value.allowSafePreferences,
          requireConfirmation: value.requireConfirmation,
          allowHelperEscalation: value.allowHelperEscalation,
        },
      })
    },
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: ['handoffs'] })
      if (!created.publicToken) throw new Error('Share token was not created')
      await navigate({
        to: '/handoffs/$id',
        params: { id: created.publicToken },
      })
    },
  })
  const deleteRecording = useMutation({
    mutationFn: async () => {
      if (procedure.data) await repositories.procedures.remove(procedure.data.id)
      await repositories.recordings.remove(id)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries()
      await navigate({ to: '/recordings' })
    },
  })

  return (
    <AppShell>
      {recording.isPending || procedure.isPending ? (
        <div aria-label="Loading procedure" className="page-loading">
          <span />
          <span />
        </div>
      ) : !recording.data || !procedure.data ? (
        <Card>
          <EmptyState
            detail="Finish a connected recording to compile its reusable procedure."
            icon="file"
            title="Procedure not found"
          />
        </Card>
      ) : (
        <div className="procedure-page">
          <header className="procedure-hero">
            <div>
              <span className="pill pill--ready">Ready to share</span>
              <h1>{procedure.data.title}</h1>
              <p>
                {procedure.data.steps.length} meaningful actions captured from{' '}
                Northstar Benefits — automatically, with no manual step
                selection.
              </p>
            </div>
            <span className="procedure-score">
              <small>Transfer safety</small>
              <strong>Explicit</strong>
            </span>
            <Button
              icon={<Icon name="trash" />}
              onClick={() => setConfirmingDelete(true)}
              type="button"
              variant="ghost"
            >
              Delete
            </Button>
          </header>

          <nav aria-label="Procedure sections" className="procedure-tabs">
            {tabs.map((item) => (
              <button
                className={tab === item ? 'procedure-tabs__active' : ''}
                key={item}
                onClick={() => setTab(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </nav>

          {tab === 'Overview' ? (
            <div className="procedure-grid">
              <Card className="policy-card">
                <span className="policy-card__icon policy-card__icon--carry">
                  <Icon name="check" />
                </span>
                <h2>Carry over</h2>
                <ul className="policy-card__steps">
                  {bucketSteps(procedure.data.steps).carryOver.map((step) => (
                    <li key={step.id}>{describeCommand(step.input)}</li>
                  ))}
                </ul>
                <strong>Safe preferences &amp; checked availability</strong>
              </Card>
              <Card className="policy-card">
                <span className="policy-card__icon">
                  <Icon name="spark" />
                </span>
                <h2>Adapt</h2>
                <ul className="policy-card__steps">
                  {bucketSteps(procedure.data.steps).adapt.map((step) => (
                    <li key={step.id}>{describeCommand(step.input)}</li>
                  ))}
                </ul>
                <strong>Recipient-specific</strong>
              </Card>
              <Card className="policy-card">
                <span className="policy-card__icon policy-card__icon--ask">
                  <Icon name="help" />
                </span>
                <h2>Always ask</h2>
                <ul className="policy-card__steps">
                  {bucketSteps(procedure.data.steps).alwaysAsk.map((step) => (
                    <li key={step.id}>{describeCommand(step.input)}</li>
                  ))}
                </ul>
                <strong>Plan substitution &amp; final submission</strong>
              </Card>
              <Card className="policy-card">
                <span className="policy-card__icon policy-card__icon--never">×</span>
                <h2>Never transfer</h2>
                <ul className="policy-card__steps">
                  {NEVER_TRANSFER.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <strong>Never captured, never shared</strong>
              </Card>
            </div>
          ) : tab === 'Steps' || tab === 'Rules' ? (
            <Card className="procedure-steps">
              {procedure.data.steps.map((step, index) => (
                <div className="procedure-step" key={step.id}>
                  <span>{index + 1}</span>
                  <div>
                    <strong>{describeCommand(step.input)}</strong>
                    <small>{JSON.stringify(step.input)}</small>
                  </div>
                  <span className="pill">{step.policy.replaceAll('_', ' ')}</span>
                </div>
              ))}
            </Card>
          ) : (
            <Card>
              <EmptyState
                detail={
                  tab === 'Runs'
                    ? 'Recipient runs will appear after a shared handoff opens.'
                    : 'Human and WebMCP activity is available in the audit trail.'
                }
                icon={tab === 'Runs' ? 'share' : 'activity'}
                iconTone={tab === 'Runs' ? 'green' : 'blue'}
                title={`No ${tab.toLowerCase()} yet`}
              />
            </Card>
          )}

          <Card className="create-handoff-card">
            <CreateHandoffDialog
              onCreate={async (value) => {
                await handoff.mutateAsync(value)
              }}
              procedure={procedure.data}
            />
          </Card>
        </div>
      )}
      <ConfirmDialog
        description={
          procedure.data
            ? `This deletes “${procedure.data.title}” along with its recording and any handoffs created from it. This can’t be undone.`
            : ''
        }
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={() => deleteRecording.mutate()}
        open={confirmingDelete}
        pending={deleteRecording.isPending}
        title="Delete this recording?"
      />
    </AppShell>
  )
}
