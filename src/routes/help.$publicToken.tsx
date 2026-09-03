import { useForm } from '@tanstack/react-form'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { Card, EmptyState } from '../components/ui/Card'
import { Icon } from '../components/ui/Icon'
import { executeCommand } from '../domain/commands/executeCommand'
import { createDemoAccount } from '../domain/integration/productFlow'
import type { HelperChoice } from '../domain/model'
import { repositories } from '../domain/repositories/appRepositories'

export const Route = createFileRoute('/help/$publicToken')({
  component: HelperRoute,
})

function HelperRoute() {
  const { publicToken } = Route.useParams()
  const queryClient = useQueryClient()
  const request = useQuery({
    queryKey: ['public-help-request', publicToken],
    queryFn: () => repositories.helpRequests.getByPublicToken(publicToken),
  })
  const decision = useQuery({
    queryKey: ['decision-for-request', publicToken],
    queryFn: () => repositories.decisions.pollByRequestToken(publicToken),
  })
  const form = useForm({
    defaultValues: { choice: 'silver' as HelperChoice },
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
      await queryClient.invalidateQueries({
        queryKey: ['decision-for-request', publicToken],
      })
    },
  })

  return (
    <div className="helper-page">
      <header>
        <span className="brand__mark"><Icon name="spark" /></span>
        <strong>ShowOnce decision request</strong>
      </header>
      <main>
        {request.isPending || decision.isPending ? (
          <div aria-label="Loading helper request" className="page-loading" />
        ) : !request.data ? (
          <Card>
            <EmptyState
              detail="This request may be expired or unavailable."
              title="Request unavailable"
            />
          </Card>
        ) : decision.data ? (
          <Card className="completion-card">
            <h1>Decision sent to the recipient.</h1>
            <p>
              {decision.data.outcome === 'recommend_plan'
                ? `${decision.data.recommendedPlanId} was explicitly recommended.`
                : 'The recipient will make the plan choice.'}
            </p>
          </Card>
        ) : (
          <Card className="helper-decision">
            <span className="eyebrow">Minimum information</span>
            <h1>The recipient cannot access the demonstrated Gold plan.</h1>
            <p>No address, dependents, account, or screen details were shared.</p>
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
                    {(
                      [
                        ['silver', 'Recommend Silver'],
                        ['platinum', 'Recommend Platinum'],
                        ['let_recipient_decide', 'Let the recipient decide'],
                      ] as const
                    ).map(([value, label]) => (
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
