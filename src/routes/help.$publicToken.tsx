import { useForm } from '@tanstack/react-form'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'

import { Card, EmptyState } from '../components/ui/Card'
import { BrandMark } from '../components/ui/BrandMark'
import type { HelperChoice } from '../domain/model'
import { executeCommand } from '../domain/commands/executeCommand'
import { createDemoAccount } from '../domain/integration/productFlow'
import { handoffRecipientName, possessive } from '../lib/handoffRecipient'
import { repositories } from '../domain/repositories/appRepositories'

export const Route = createFileRoute('/help/$publicToken')({
  component: HelperRoute,
})

function choiceOptions(
  detail: 'plan_unavailable' | 'material_price_change',
  recipientName: string | null,
) {
  const chooseLabel = recipientName
    ? `Let ${recipientName} choose locally`
    : 'Let the recipient choose locally'
  if (detail === 'material_price_change') {
    return [
      ['gold', 'Approve Gold at regional price ($142/mo)'],
      ['silver', 'Recommend Silver instead'],
      ['let_recipient_decide', chooseLabel],
    ] as const
  }
  return [
    ['silver', 'Recommend Silver'],
    ['platinum', 'Recommend Platinum'],
    ['let_recipient_decide', recipientName ? `Let ${recipientName} decide` : 'Let the recipient decide'],
  ] as const
}

function HelperRoute() {
  const { publicToken } = Route.useParams()
  const queryClient = useQueryClient()
  const request = useQuery({
    queryKey: ['public-help-request', publicToken],
    queryFn: () => repositories.helpRequests.getByPublicToken(publicToken),
  })
  const ownerRequest = useQuery({
    queryKey: ['owner-help-request', publicToken],
    enabled: Boolean(request.data),
    queryFn: async () =>
      (await repositories.helpRequests.list()).find(
        (item) => item.publicToken === publicToken,
      ) ?? null,
  })
  const ownerHandoff = useQuery({
    queryKey: ['owner-handoff-for-help', ownerRequest.data?.handoffId],
    enabled: Boolean(ownerRequest.data?.handoffId),
    queryFn: async () =>
      (await repositories.handoffs.list()).find(
        (item) => item.id === ownerRequest.data?.handoffId,
      ) ?? null,
  })
  const recipientName = handoffRecipientName(ownerHandoff.data?.recipient)
  const decision = useQuery({
    queryKey: ['decision-for-request', publicToken],
    queryFn: () => repositories.decisions.pollByRequestToken(publicToken),
  })
  const form = useForm({
    defaultValues: {
      choice: (request.data?.detail === 'material_price_change'
        ? 'gold'
        : 'silver') as HelperChoice,
    },
    onSubmit: async ({ value }) => {
      const result = executeCommand(
        {
          state: createDemoAccount(),
          source: 'human',
          now: Date.now(),
          createId: () => crypto.randomUUID(),
        },
        value.choice === 'let_recipient_decide'
          ? {
              type: 'record_decision',
              requestId: publicToken,
              outcome: 'let_recipient_decide',
            }
          : {
              type: 'record_decision',
              requestId: publicToken,
              outcome: 'recommend_plan',
              recommendedPlanId: value.choice,
            },
      )
      if (!result.decision) throw new Error('Decision was not created')
      await repositories.decisions.saveForRequestToken(
        publicToken,
        result.decision,
      )
      const current = (await repositories.helpRequests.list()).find(
        (item) => item.publicToken === publicToken,
      )
      if (current) {
        await repositories.helpRequests.save({
          ...current,
          status: 'resolved',
          updatedAt: Date.now(),
        })
      }
      await queryClient.invalidateQueries({
        queryKey: ['decision-for-request', publicToken],
      })
      await queryClient.invalidateQueries({ queryKey: ['help-requests'] })
    },
  })

  const detail = request.data?.detail ?? 'plan_unavailable'
  const options = choiceOptions(detail, recipientName)

  return (
    <div className="helper-page">
      <header>
        <span className="brand__mark">
          <BrandMark height={14} width={18} />
        </span>
        <strong>ShowOnce decision request</strong>
      </header>
      <main>
        {request.isPending || decision.isPending ? (
          <div aria-label="Loading helper request" className="page-loading" />
        ) : !request.data ? (
          <Card>
            <EmptyState
              detail="This request may be expired or unavailable."
              icon="help"
              iconTone="amber"
              title="Request unavailable"
            />
          </Card>
        ) : decision.data ? (
          <Card className="completion-card">
            <h1>Decision sent to the recipient.</h1>
            <p>
              {decision.data.outcome === 'recommend_plan'
                ? `${decision.data.recommendedPlanId} was explicitly recommended. ${recipientName ? `${possessive(recipientName)} agent` : 'The recipient\'s agent'} can continue in ChatGPT.`
                : recipientName
                  ? `${recipientName} will make the plan choice on the shared link.`
                  : 'The recipient will make the plan choice locally.'}
            </p>
            <Link className="button button--primary" to="/needs-input">
              Back to Needs input
            </Link>
          </Card>
        ) : (
          <Card className="helper-decision">
            <span className="eyebrow">Minimum information</span>
            <h1>
              {detail === 'material_price_change'
                ? 'Regional pricing differs from your demonstration.'
                : 'The recipient cannot access the demonstrated Gold plan.'}
            </h1>
            <p>
              {detail === 'material_price_change'
                ? recipientName
                  ? `You showed Gold at $88/mo. ${possessive(recipientName)} account lists Gold at $142/mo. No address, dependents, or credentials were shared.`
                  : 'You showed Gold at $88/mo. The recipient\'s account lists Gold at $142/mo. No address, dependents, or credentials were shared.'
                : 'No address, dependents, account, or screen details were shared.'}
            </p>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                void form.handleSubmit()
              }}
            >
              <form.Field name="choice">
                {(field) => (
                  <fieldset className="decision-options">
                    <legend>Recommendation</legend>
                    {options.map(([value, label]) => (
                      <label key={value}>
                        <input
                          checked={field.state.value === value}
                          name={field.name}
                          onChange={() => field.handleChange(value)}
                          type="radio"
                        />
                        {label}
                      </label>
                    ))}
                  </fieldset>
                )}
              </form.Field>
              <button className="button button--primary" type="submit">
                Send exact decision
              </button>
            </form>
          </Card>
        )}
      </main>
    </div>
  )
}
